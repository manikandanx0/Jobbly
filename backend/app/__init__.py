# backend/app/__init__.py
import os
import sys
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Add the root directory to the path so we can find the .env file
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
sys.path.insert(0, root_dir)

# Load environment variables from root .env file
env_path = os.path.join(root_dir, '.env')
load_dotenv(env_path)

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for your Next.js frontend
    CORS(app, origins=["http://localhost:3000"])
    
    # Basic config
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    # Import and register blueprints
    from app.api.users import users_bp
    from app.api.multilingual import multilingual_bp
    
    app.register_blueprint(users_bp)
    app.register_blueprint(multilingual_bp)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Flask API is running'}
    
    @app.route('/')
    def root():
        return {'message': 'Talent Platform API', 'version': '1.0.0'}
    
    return app

# For development
app = create_app()