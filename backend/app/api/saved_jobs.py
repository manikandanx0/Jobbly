# backend/app/api/saved_jobs.py
from flask import Blueprint, request, jsonify
from app.models.saved_job import SavedJobCreate, SavedJobUpdate
from app.core.database import get_supabase_client
from app.core.auth import login_required, require_user_id, get_current_user
import logging

saved_jobs_bp = Blueprint('saved_jobs', __name__, url_prefix='/api/saved-jobs')

@saved_jobs_bp.route('/', methods=['GET'])
@require_user_id
def get_saved_jobs():
    """Get saved jobs for a user"""
    try:
        user_id = request.args.get('userId') or request.args.get('user_id')
        job_type = request.args.get('jobType') or request.args.get('job_type')
            
        client = get_supabase_client()
        q = client.table('saved_jobs').select('*').eq('talent_id', user_id)
        
        if job_type:
            q = q.eq('job_type', job_type)
            
        res = q.execute()
        return jsonify({'items': res.data or []}), 200
        
    except Exception as e:
        logging.error(f"Error getting saved jobs: {str(e)}")
        return jsonify({'error': 'Failed to get saved jobs'}), 500

@saved_jobs_bp.route('/', methods=['POST'])
@require_user_id
def save_job():
    """Save a job or internship"""
    try:
        data = request.get_json() or {}
        user_id = data.get('userId') or data.get('user_id')
        job_id = data.get('jobId') or data.get('job_id')
        internship_id = data.get('internshipId') or data.get('internship_id')
        job_type = data.get('jobType') or data.get('job_type')
        notes = data.get('notes')
            
        if not job_id and not internship_id:
            return jsonify({'error': 'jobId or internshipId required'}), 400
            
        if not job_type:
            job_type = 'internship' if internship_id else 'freelance'
            
        client = get_supabase_client()
        
        saved_job_data = {
            'talent_id': user_id,
            'job_type': job_type
        }
        
        if job_id:
            saved_job_data['job_id'] = job_id
        if internship_id:
            saved_job_data['internship_id'] = internship_id
        if notes:
            saved_job_data['notes'] = notes
            
        res = client.table('saved_jobs').insert(saved_job_data).execute()
        return jsonify({'ok': True, 'item': (res.data or [{}])[0]}), 201
        
    except Exception as e:
        logging.error(f"Error saving job: {str(e)}")
        return jsonify({'error': 'Failed to save job'}), 500

@saved_jobs_bp.route('/', methods=['DELETE'])
@require_user_id
def unsave_job():
    """Remove a saved job or internship"""
    try:
        user_id = request.args.get('userId') or request.args.get('user_id')
        job_id = request.args.get('jobId') or request.args.get('job_id')
        internship_id = request.args.get('internshipId') or request.args.get('internship_id')
            
        if not job_id and not internship_id:
            return jsonify({'error': 'jobId or internshipId required'}), 400
            
        client = get_supabase_client()
        q = client.table('saved_jobs').delete().eq('talent_id', user_id)
        
        if job_id:
            q = q.eq('job_id', job_id)
        if internship_id:
            q = q.eq('internship_id', internship_id)
            
        res = q.execute()
        return jsonify({'ok': True, 'count': len(res.data or [])}), 200
        
    except Exception as e:
        logging.error(f"Error removing saved job: {str(e)}")
        return jsonify({'error': 'Failed to remove saved job'}), 500

@saved_jobs_bp.route('/<saved_job_id>', methods=['PUT'])
@login_required
def update_saved_job(saved_job_id):
    """Update a saved job (e.g., notes)"""
    try:
        data = request.get_json() or {}
        notes = data.get('notes')
        current_user = get_current_user()
        
        if notes is None:
            return jsonify({'error': 'notes required'}), 400
            
        client = get_supabase_client()
        
        # First verify the saved job belongs to the current user
        check_res = client.table('saved_jobs').select('talent_id').eq('id', saved_job_id).execute()
        if not check_res.data or check_res.data[0]['talent_id'] != current_user['id']:
            return jsonify({'error': 'Saved job not found or access denied'}), 404
        
        res = client.table('saved_jobs').update({'notes': notes}).eq('id', saved_job_id).execute()
        
        if not res.data:
            return jsonify({'error': 'Saved job not found'}), 404
            
        return jsonify({'ok': True, 'item': res.data[0]}), 200
        
    except Exception as e:
        logging.error(f"Error updating saved job: {str(e)}")
        return jsonify({'error': 'Failed to update saved job'}), 500
