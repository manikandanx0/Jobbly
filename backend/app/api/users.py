
# backend/app/api/users.py
from flask import Blueprint, request, jsonify
from app.models.user import UserCreate, UserUpdate
from pydantic import EmailStr
from app.core.services import user_service
from pydantic import ValidationError
import logging
from app.core.database import get_supabase_client
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import os

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        user_data = UserCreate(**data)
        
        # Check if user already exists
        existing_user = user_service.get_user_by_email(user_data.email)
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create user
        user = user_service.create_user(user_data)
        if not user:
            return jsonify({'error': 'Failed to create user'}), 500
            
        return jsonify({'message': 'User created successfully', 'user': user}), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.errors()}), 400
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/signup', methods=['POST'])
def signup_user():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        name = data.get('name')
        role = (data.get('role') or 'talent').strip().lower()
        if role not in ['talent', 'recruiter']:
            role = 'talent'
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        # Basic email format validation
        if '@' not in email or '.' not in email.split('@')[-1]:
            return jsonify({'error': 'Invalid email address'}), 400
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400

        client = get_supabase_client()
        # Check if user exists
        exists = client.table('users').select('id').eq('email', email).limit(1).execute()
        if exists.data:
            return jsonify({'error': 'An account with this email already exists.'}), 400
        password_hash = generate_password_hash(password)
        # Attempt Supabase insert (requires service role key or permissive RLS)
        payload = {
            'role': role,
            'full_name': name or '',
            'email': email,
            'password_hash': password_hash
        }
        # Create in unified credentials table
        res = client.table('users').insert(payload).execute()
        created = (res.data or [{}])[0]
        # Also ensure role-specific profile exists without password_hash
        if created and created.get('id'):
            profile = {
                'id': created.get('id'),
                'email': email,
                'full_name': name or ''
            }
            target_table = 'talents' if role == 'talent' else 'recruiters'
            try:
                client.table(target_table).insert(profile).execute()
            except Exception:
                pass
        if created and created.get('id'):
            return jsonify({'message': 'Signup successful.', 'user': {'id': created.get('id'), 'email': email, 'role': role}}), 201
        return jsonify({'error': 'Signup failed'}), 400
    except Exception as e:
        error_msg = str(e)
        logging.error(f"Signup error: {error_msg}")
        return jsonify({'error': f'Signup failed: {error_msg}'}), 400
@users_bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    try:
        user = user_service.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({'user': user}), 200
        
    except Exception as e:
        logging.error(f"Error getting user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user information"""
    try:
        data = request.get_json()
        user_data = UserUpdate(**data)
        
        user = user_service.update_user(user_id, user_data)
        if not user:
            return jsonify({'error': 'User not found or no changes made'}), 404
            
        return jsonify({'message': 'User updated successfully', 'user': user}), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.errors()}), 400
    except Exception as e:
        logging.error(f"Error updating user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/talents', methods=['GET'])
def get_talents():
    """Get talents with optional filters"""
    try:
        # Get query parameters
        skills = request.args.getlist('skills')
        location = request.args.get('location')
        experience_level = request.args.get('experience_level')
        availability = request.args.get('availability')
        
        talents = user_service.get_talents(
            skills=skills if skills else None,
            location=location,
            experience_level=experience_level,
            availability=availability
        )
        
        return jsonify({'talents': talents, 'count': len(talents)}), 200
        
    except Exception as e:
        logging.error(f"Error getting talents: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/search', methods=['GET'])
def search_users():
    """Search users by email or name"""
    try:
        query = request.args.get('q', '')
        role = request.args.get('role', 'talent')
        
        if not query:
            return jsonify({'error': 'Search query required'}), 400
        
        # Simple search implementation
        # In production, you might want to use full-text search
        client = user_service.client
        result = client.table('users')\
            .select('*')\
            .eq('role', role)\
            .or_(f'full_name.ilike.%{query}%,email.ilike.%{query}%')\
            .execute()
        
        return jsonify({'users': result.data, 'count': len(result.data)}), 200
        
    except Exception as e:
        logging.error(f"Error searching users: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        client = get_supabase_client()
        # Authenticate against unified users table only
        res = client.table('users').select('id,email,full_name,password_hash,role').eq('email', email).limit(1).execute()
        row = (res.data or [None])[0]
        if not row or not row.get('password_hash'):
            return jsonify({'error': 'Invalid credentials'}), 401
        if not check_password_hash(row['password_hash'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        jwt_secret = os.getenv('JWT_SECRET', 'dev-secret')
        token = jwt.encode({'sub': str(row['id']), 'email': row['email'], 'role': row.get('role')}, jwt_secret, algorithm='HS256')
        return jsonify({'access_token': token, 'user': {'id': row['id'], 'email': row['email'], 'full_name': row.get('full_name'), 'role': row.get('role')}}), 200
    except Exception as e:
        error_msg = str(e)
        logging.error(f"Login error: {error_msg}")
        return jsonify({'error': f'Login failed: {error_msg}'}), 401

@users_bp.route('/me', methods=['GET'])
def get_me():
    try:
        auth = request.headers.get('Authorization', '')
        token = auth.replace('Bearer ', '') if auth.startswith('Bearer ') else None
        if not token:
            return jsonify({'error': 'Unauthorized'}), 401
        jwt_secret = os.getenv('JWT_SECRET', 'dev-secret')
        decoded = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = decoded.get('sub')
        client = get_supabase_client()
        # Try unified users table first
        row = None
        try:
            res = client.table('users').select('id,email,role').eq('id', user_id).limit(1).execute()
            row = (res.data or [None])[0]
        except Exception:
            row = None
        if not row:
            # Determine role from token and fetch accordingly
            role = decoded.get('role')
            if role == 'recruiter':
                rr = client.table('recruiters').select('id,email').eq('id', user_id).limit(1).execute()
                row = (rr.data or [None])[0]
            else:
                rt = client.table('talents').select('id,email').eq('id', user_id).limit(1).execute()
                row = (rt.data or [None])[0]
        if not row:
            return jsonify({'error': 'Unauthorized'}), 401
        return jsonify({'user': {'id': row['id'], 'email': row['email'], 'role': decoded.get('role')}}), 200
    except Exception as e:
        logging.error(f"/me error: {str(e)}")
        return jsonify({'error': 'Failed to fetch user'}), 500