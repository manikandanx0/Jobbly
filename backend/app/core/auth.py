# backend/app/core/auth.py
from functools import wraps
from flask import request, jsonify, session
from app.core.database import get_supabase_client
import logging
import jwt
import os

def login_required(f):
    """
    Decorator to require authentication for Flask routes.
    Similar to the Python decorator you showed, but for Flask API endpoints.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        token = None
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif 'auth_token' in request.cookies:
            token = request.cookies.get('auth_token')
        
        if not token:
            return jsonify({'error': 'Authentication required', 'message': 'Please log in to access this resource'}), 401
        
        try:
            # Verify JWT token
            JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret')
            decoded_token = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            
            # Get user from Supabase to ensure they still exist
            client = get_supabase_client()
            # We use our own JWT; retrieve role-aware user context from token
            request.current_user = {
                'id': decoded_token.get('sub'),
                'email': decoded_token.get('email'),
                'role': decoded_token.get('role')
            }
            
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired', 'message': 'Please log in again'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token', 'message': 'Please log in again'}), 401
        except Exception as e:
            logging.error(f"Authentication error: {str(e)}")
            return jsonify({'error': 'Authentication failed', 'message': 'Please log in again'}), 401
    
    return decorated_function

def get_current_user():
    """
    Helper function to get current user from request context.
    Must be called within a route decorated with @login_required
    """
    return getattr(request, 'current_user', None)

def require_user_id(f):
    """
    Decorator that ensures user_id is provided and matches the authenticated user.
    Used for endpoints that require user_id parameter.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # First check authentication
        auth_result = login_required(f)(*args, **kwargs)
        if isinstance(auth_result, tuple) and auth_result[1] == 401:
            return auth_result
        
        # Get user_id from request
        user_id = None
        if request.method == 'GET':
            user_id = request.args.get('userId') or request.args.get('user_id')
        else:
            data = request.get_json() or {}
            user_id = data.get('userId') or data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'userId is required'}), 400
        
        # Verify user_id matches authenticated user
        current_user = get_current_user()
        if not current_user or current_user['id'] != user_id:
            return jsonify({'error': 'Unauthorized', 'message': 'You can only access your own data'}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


