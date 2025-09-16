
# backend/app/api/users.py
from flask import Blueprint, request, jsonify
from app.models.user import UserCreate, UserUpdate
from app.core.services import user_service
from pydantic import ValidationError
import logging

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