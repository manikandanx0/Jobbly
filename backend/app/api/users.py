
# backend/app/api/users.py
from flask import Blueprint, request, jsonify
from app.models.user import UserCreate, UserUpdate
from pydantic import EmailStr
from app.core.services import user_service
from pydantic import ValidationError
import logging
from app.core.database import get_db_connection, get_admin_connection
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
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        # Basic email format validation
        if '@' not in email or '.' not in email.split('@')[-1]:
            return jsonify({'error': 'Invalid email address'}), 400
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400

        # Local table signup (no Supabase)
        try:
            admin = get_admin_connection()
            with admin.cursor() as cur:
                cur.execute("SELECT id FROM public.users WHERE email = %s LIMIT 1", (email,))
                if cur.fetchone():
                    return jsonify({'error': 'An account with this email already exists.'}), 400
                password_hash = generate_password_hash(password)
                cur.execute(
                    "INSERT INTO public.users (role, full_name, email, password_hash, created_at, updated_at) VALUES (%s,%s,%s,%s, now(), now()) RETURNING id",
                    ('talent', name or '', email, password_hash)
                )
                row = cur.fetchone(); admin.commit()
                user_id = row['id'] if row else None
                return jsonify({ 'message': 'Signup successful.', 'user': { 'id': user_id, 'email': email } }), 201
        except Exception as table_err:
            logging.error(f"Table signup failed: {table_err}")
            return jsonify({'error': 'Signup failed'}), 400
    except Exception as e:
        error_msg = str(e)
        logging.error(f"Signup error: {error_msg}")
        
        # Handle specific Supabase auth errors
        if "email" in error_msg.lower() and "invalid" in error_msg.lower():
            return jsonify({'error': 'Email address is invalid or not allowed. Please try a different email address.'}), 400
        elif "password" in error_msg.lower():
            return jsonify({'error': 'Password does not meet requirements. Please use a stronger password.'}), 400
        elif "already" in error_msg.lower() and "registered" in error_msg.lower():
            return jsonify({'error': 'An account with this email already exists. Please try logging in instead.'}), 400
        else:
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

        # Table auth (compare password hash)
        admin = get_admin_connection()
        with admin.cursor() as cur:
            cur.execute("SELECT id,email,full_name,password_hash FROM public.users WHERE email = %s LIMIT 1", (email,))
            row = cur.fetchone()
            if not row or not row.get('password_hash'):
                return jsonify({'error': 'Invalid credentials'}), 401
            if not check_password_hash(row['password_hash'], password):
                return jsonify({'error': 'Invalid credentials'}), 401
            token = jwt.encode({'sub': str(row['id'])}, os.getenv('SECRET_KEY', 'dev-secret-key'), algorithm='HS256')
            return jsonify({'access_token': token, 'user': {'id': row['id'], 'email': row['email'], 'full_name': row.get('full_name')}}), 200
    except Exception as e:
        error_msg = str(e)
        logging.error(f"Login error: {error_msg}")
        
        # Handle specific Supabase auth errors
        if "invalid" in error_msg.lower() and ("credentials" in error_msg.lower() or "password" in error_msg.lower()):
            return jsonify({'error': 'Invalid email or password. Please check your credentials and try again.'}), 401
        elif "email" in error_msg.lower() and "not" in error_msg.lower() and "confirmed" in error_msg.lower():
            return jsonify({'error': 'Please check your email and click the confirmation link before logging in.'}), 401
        elif "too many" in error_msg.lower() and "requests" in error_msg.lower():
            return jsonify({'error': 'Too many login attempts. Please wait a moment and try again.'}), 429
        else:
            return jsonify({'error': f'Login failed: {error_msg}'}), 401

@users_bp.route('/me', methods=['GET'])
def get_me():
    try:
        auth = request.headers.get('Authorization', '')
        token = auth.replace('Bearer ', '') if auth.startswith('Bearer ') else None
        if not token:
            return jsonify({'error': 'Unauthorized'}), 401
        client = get_supabase_client()
        user_resp = client.auth.get_user(token)
        if not user_resp.user:
            return jsonify({'error': 'Unauthorized'}), 401
        return jsonify({'user': {'id': user_resp.user.id, 'email': user_resp.user.email}}), 200
    except Exception as e:
        logging.error(f"/me error: {str(e)}")
        return jsonify({'error': 'Failed to fetch user'}), 500