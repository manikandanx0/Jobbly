# backend/app/api/multilingual.py
from flask import Blueprint, request, jsonify
from app.core.translation import translation_service
import logging

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