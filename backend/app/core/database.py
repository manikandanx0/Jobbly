# backend/app/core/database.py
import os
from dotenv import load_dotenv
try:
    from supabase import create_client as _create_supabase_client  # type: ignore
except Exception:
    _create_supabase_client = None  # Supabase client is optional; configured via env + requirements

# Load environment variables from root directory
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
env_path = os.path.join(root_dir, '.env')
load_dotenv(env_path)

_supabase_client = None


def get_supabase_client():
    """Return a lazily initialized Supabase client.

    Requires SUPABASE_URL and either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in the environment
    and the 'supabase' package installed (see requirements.txt).
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    supabase_url = os.getenv('SUPABASE_URL')
    # Prefer service role key for backend writes; fallback to anon only if no service key
    supabase_key = (
        os.getenv('SUPABASE_SERVICE_KEY')
        or os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        or os.getenv('SUPABASE_ANON_KEY')
    )

    if _create_supabase_client is None:
        raise ImportError("Supabase client library not installed. Add 'supabase' to requirements and pip install.")

    if not supabase_url or not supabase_key:
        raise RuntimeError("Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SERVICE_ROLE) in .env")

    _supabase_client = _create_supabase_client(supabase_url, supabase_key)
    return _supabase_client