# backend/wsgi.py
import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Add the root directory to Python path for .env access
root_dir = os.path.dirname(backend_dir)
sys.path.insert(0, root_dir)

from app import create_app

application = create_app()
app = application  # For compatibility

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)