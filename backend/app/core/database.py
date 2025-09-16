# backend/app/core/database.py
from supabase import create_client, Client
import os
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables from root directory
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
env_path = os.path.join(root_dir, '.env')
load_dotenv(env_path)

class SupabaseConfig:
    """Supabase configuration and client management"""
    
    def __init__(self):
        self.url = os.getenv('SUPABASE_URL')
        self.anon_key = os.getenv('SUPABASE_ANON_KEY')
        self.service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not self.url or not self.anon_key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
    
    @lru_cache()
    def get_client(self) -> Client:
        """Get Supabase client with anon key (for normal operations)"""
        return create_client(self.url, self.anon_key)
    
    @lru_cache()
    def get_admin_client(self) -> Client:
        """Get Supabase client with service key (for admin operations)"""
        if not self.service_key:
            raise ValueError("SUPABASE_SERVICE_KEY must be set for admin operations")
        return create_client(self.url, self.service_key)

# Global instances
config = SupabaseConfig()
supabase = config.get_client()
supabase_admin = config.get_admin_client()

# Convenience functions
def get_supabase_client() -> Client:
    """Get the standard Supabase client"""
    return supabase

def get_admin_client() -> Client:
    """Get the admin Supabase client"""
    return supabase_admin