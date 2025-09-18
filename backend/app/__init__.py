# backend/app/__init__.py
import os
import sys
from flask import Flask, request, g
from flask import has_request_context
from flask_cors import CORS
from dotenv import load_dotenv
import logging
import os as _os
from logging.handlers import RotatingFileHandler
import uuid

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
    # Logging configuration
    _level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_dir = os.getenv('LOG_DIR', os.path.join(root_dir, 'logs'))
    try:
        if not os.path.isdir(log_dir):
            os.makedirs(log_dir, exist_ok=True)
    except Exception:
        # Fallback to backend dir if cannot create
        log_dir = os.path.dirname(__file__)

    # Configure rotating file handler
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'server.log'), maxBytes=5 * 1024 * 1024, backupCount=3, encoding='utf-8'
    )
    fmt = logging.Formatter(
        '%(asctime)s %(levelname)s %(name)s [%(request_id)s] %(message)s'
    )
    file_handler.setFormatter(fmt)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(fmt)

    class RequestIdFilter(logging.Filter):
        def filter(self, record):
            try:
                if has_request_context():
                    record.request_id = getattr(g, 'request_id', '-')
                else:
                    record.request_id = '-'
            except Exception:
                record.request_id = '-'
            return True

    file_handler.addFilter(RequestIdFilter())
    console_handler.addFilter(RequestIdFilter())

    root_logger = logging.getLogger()
    root_logger.setLevel(_level)
    # Avoid duplicate handlers on reload
    if not any(isinstance(h, RotatingFileHandler) for h in root_logger.handlers):
        root_logger.addHandler(file_handler)
    if not any(isinstance(h, logging.StreamHandler) for h in root_logger.handlers):
        root_logger.addHandler(console_handler)

    @app.before_request
    def _inject_request_id():
        g.request_id = str(uuid.uuid4())
        logging.getLogger(__name__).debug(
            f"Incoming {request.method} {request.path}")

    @app.after_request
    def _log_response(resp):
        logging.getLogger(__name__).info(
            f"{request.method} {request.path} -> {resp.status_code}")
        return resp

    @app.errorhandler(Exception)
    def _handle_exception(err):
        logging.getLogger(__name__).exception(f"Unhandled error: {err}")
        return ({'error': 'Internal server error', 'request_id': getattr(g, 'request_id', '-')}, 500)
    
    # Import and register blueprints
    from app.api.users import users_bp
    from app.api.multilingual import multilingual_bp
    from app.api.saved_jobs import saved_jobs_bp
    
    app.register_blueprint(users_bp)
    app.register_blueprint(multilingual_bp)
    app.register_blueprint(saved_jobs_bp)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Flask API is running'}
    
    @app.route('/')
    def root():
        return {'message': 'Talent Platform API', 'version': '1.0.0'}
    
    return app

# Note: Do NOT instantiate the Flask app at import time to avoid circular imports.