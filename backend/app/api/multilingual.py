# backend/app/api/multilingual.py
from flask import Blueprint, request, jsonify
from app.core.translation import translation_service
import logging
from app.core.database import get_supabase_client

multilingual_bp = Blueprint('multilingual', __name__, url_prefix='/api/multilingual')

@multilingual_bp.route('/detect', methods=['POST'])
def detect_language():
    """Detect the language of input text"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        detected_lang = translation_service.detect_language(text)
        language_name = translation_service.TARGET_LANGUAGES.get(detected_lang, 'Unknown')
        
        return jsonify({
            'language_code': detected_lang,
            'language_name': language_name,
            'confidence': 'high'  # langdetect doesn't provide confidence scores
        }), 200
        
    except Exception as e:
        logging.error(f"Error detecting language: {str(e)}")
        return jsonify({'error': 'Language detection failed'}), 500

@multilingual_bp.route('/translate', methods=['POST'])
def translate_text():
    """Translate text to target language(s)"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        target_languages = data.get('target_languages', [])  # List of target languages
        source_language = data.get('source_language')  # Optional
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # If no target languages specified, translate to all
        if not target_languages:
            target_languages = list(translation_service.TARGET_LANGUAGES.keys())
        
        # Detect source language if not provided
        if not source_language:
            source_language = translation_service.detect_language(text)
        
        translations = {}
        for target_lang in target_languages:
            if target_lang in translation_service.TARGET_LANGUAGES:
                translated = translation_service.translate_text(text, source_language, target_lang)
                if translated:
                    translations[target_lang] = translated
        
        return jsonify({
            'source_language': source_language,
            'translations': translations,
            'available_languages': translation_service.TARGET_LANGUAGES
        }), 200
        
    except Exception as e:
        logging.error(f"Error translating text: {str(e)}")
        return jsonify({'error': 'Translation failed'}), 500

@multilingual_bp.route('/batch-translate', methods=['POST'])
def batch_translate():
    """Translate multiple texts at once"""
    try:
        data = request.get_json()
        texts = data.get('texts', [])  # List of texts to translate
        target_languages = data.get('target_languages', list(translation_service.TARGET_LANGUAGES.keys()))
        
        if not texts:
            return jsonify({'error': 'Texts array is required'}), 400
        
        results = []
        for i, text in enumerate(texts):
            if text.strip():
                source_lang = translation_service.detect_language(text)
                translations = translation_service.translate_to_all_languages(text, source_lang)
                
                results.append({
                    'index': i,
                    'original_text': text,
                    'source_language': source_lang,
                    'translations': translations
                })
            else:
                results.append({
                    'index': i,
                    'original_text': text,
                    'source_language': 'unknown',
                    'translations': {}
                })
        
        return jsonify({
            'results': results,
            'total_processed': len(results)
        }), 200
        
    except Exception as e:
        logging.error(f"Error in batch translation: {str(e)}")
        return jsonify({'error': 'Batch translation failed'}), 500

@multilingual_bp.route('/languages', methods=['GET'])
def get_supported_languages():
    """Get list of supported languages"""
    return jsonify({
        'supported_languages': translation_service.TARGET_LANGUAGES,
        'total_languages': len(translation_service.TARGET_LANGUAGES)
    }), 200

@multilingual_bp.route('/applications', methods=['GET', 'POST', 'DELETE'])
def applications():
    """Handle job/internship applications with new schema."""
    try:
        client = get_supabase_client()
        if request.method == 'POST':
            data = request.get_json() or {}
            internship_id = data.get('internshipId') or data.get('internship_id')
            job_id = data.get('jobId') or data.get('job_id')
            user_id = data.get('userId') or data.get('user_id')
            
            if not user_id:
                return jsonify({'error': 'userId required'}), 400
            
            if not internship_id and not job_id:
                return jsonify({'error': 'internshipId or jobId required'}), 400
            
            # Determine job type
            job_type = 'internship' if internship_id else 'freelance'
            
            application_data = {
                'talent_id': user_id,
                'job_type': job_type,
                'status': 'pending'
            }
            
            if internship_id:
                application_data['internship_id'] = internship_id
            if job_id:
                application_data['job_id'] = job_id
                
            # Add optional fields
            if 'cover_letter' in data:
                application_data['cover_letter'] = data['cover_letter']
            if 'resume_url' in data:
                application_data['resume_url'] = data['resume_url']
            if 'portfolio_url' in data:
                application_data['portfolio_url'] = data['portfolio_url']
                
            res = client.table('applications').insert(application_data).execute()
            return jsonify({'ok': True, 'item': (res.data or [{}])[0]}), 201
            
        if request.method == 'DELETE':
            internship_id = request.args.get('internshipId') or request.args.get('internship_id')
            job_id = request.args.get('jobId') or request.args.get('job_id')
            user_id = request.args.get('userId') or request.args.get('user_id')
            
            if not user_id:
                return jsonify({'error': 'userId required'}), 400
                
            q = client.table('applications').delete().eq('talent_id', user_id)
            
            if internship_id:
                q = q.eq('internship_id', internship_id)
            elif job_id:
                q = q.eq('job_id', job_id)
            else:
                return jsonify({'error': 'internshipId or jobId required'}), 400
                
            res = q.execute()
            return jsonify({'ok': True, 'count': len(res.data or [])}), 200
            
        # GET
        user_id = request.args.get('userId') or request.args.get('user_id')
        job_type = request.args.get('jobType') or request.args.get('job_type')
        status = request.args.get('status')
        
        q = client.table('applications').select('*')
        
        if user_id:
            q = q.eq('talent_id', user_id)
        if job_type:
            q = q.eq('job_type', job_type)
        if status:
            q = q.eq('status', status)
            
        res = q.execute()
        return jsonify({ 'items': res.data or [] }), 200
        
    except Exception as e:
        logging.error(f"applications error: {str(e)}")
        return jsonify({'error': 'applications failed'}), 500