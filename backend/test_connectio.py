# backend/test_connection.py
import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Add the root directory to Python path
root_dir = os.path.dirname(backend_dir)
sys.path.insert(0, root_dir)

from app.core.database import get_supabase_client
from app.core.services import user_service

def test_connection():
    try:
        print("Testing Supabase connection...")
        
        # Test basic connection
        client = get_supabase_client()
        print("✓ Supabase client created successfully")
        
        # Test table access
        result = client.table('users').select('count', count='exact').execute()
        user_count = result.count
        print(f"✓ Connected to database. Users table has {user_count} records")
        
        # Test service layer
        talents = user_service.get_talents()
        print(f"✓ Service layer working. Found {len(talents)} talents")
        
        print("\n🎉 Everything is working correctly!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Please check your .env file and Supabase configuration")

if __name__ == "__main__":
    test_connection()