# backend/app/core/database.py
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables from root directory
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
env_path = os.path.join(root_dir, '.env')
load_dotenv(env_path)

# Get environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

_supabase_client: Client | None = None

def get_supabase_client() -> Client:
    """Get the standard Supabase client. Lazily initialize on first use."""
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")
        print(f"Connecting to Supabase at: {SUPABASE_URL}")
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _supabase_client

def get_admin_client() -> Client:
    """Get the admin Supabase client (creates when needed)."""
    if not SUPABASE_SERVICE_KEY:
        print("Warning: No service key found, using anon key for admin operations")
        return get_supabase_client()
    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL must be set in .env file")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)