# backend/app/core/database.py
import os
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

# Load environment variables from root directory
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
env_path = os.path.join(root_dir, '.env')
load_dotenv(env_path)

# Get environment variables
POSTGRES_DSN = os.getenv('POSTGRES_DSN', 'postgresql://postgres:postgres@localhost:5432/jobbly')

_pool = None

def get_db_connection():
    """Get a PostgreSQL connection using psycopg (simple lazy pool)."""
    global _pool
    if _pool is None:
        _pool = psycopg.Connection.connect(POSTGRES_DSN, row_factory=dict_row)
    # For simplicity, return a new connection per call if _pool is closed
    if _pool.closed:
        _pool = psycopg.Connection.connect(POSTGRES_DSN, row_factory=dict_row)
    return _pool

def get_admin_connection():
    """Alias for get_db_connection for compatibility."""
    return get_db_connection()