# backend/app/core/services.py
from typing import List, Optional, Dict, Any
from app.core.database import get_supabase_client, get_admin_client
from app.models.user import UserCreate, UserUpdate, UserResponse
import uuid

class UserService:
    """Service layer for user operations"""
    
    def __init__(self):
        self.client = get_supabase_client()
        self.admin_client = get_admin_client()
    
    def create_user(self, user_data: UserCreate, auth_id: str = None) -> Dict[str, Any]:
        """Create a new user"""
        user_dict = user_data.dict(exclude_unset=True)
        if auth_id:
            user_dict['auth_id'] = auth_id
            
        result = self.client.table('users').insert(user_dict).execute()
        return result.data[0] if result.data else None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        result = self.client.table('users')\
            .select('*')\
            .eq('id', user_id)\
            .execute()
        return result.data[0] if result.data else None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        result = self.client.table('users')\
            .select('*')\
            .eq('email', email)\
            .execute()
        return result.data[0] if result.data else None
    
    def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[Dict[str, Any]]:
        """Update user information"""
        update_dict = user_data.dict(exclude_unset=True)
        if not update_dict:
            return None
            
        result = self.client.table('users')\
            .update(update_dict)\
            .eq('id', user_id)\
            .execute()
        return result.data[0] if result.data else None
    
    def get_talents(self, 
                   skills: Optional[List[str]] = None,
                   location: Optional[str] = None,
                   experience_level: Optional[str] = None,
                   availability: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get talents with optional filters"""
        query = self.client.table('users')\
            .select('*')\
            .eq('role', 'talent')
        
        if skills:
            # Filter by skills overlap
            query = query.overlaps('skills', skills)
        if location:
            query = query.ilike('location', f'%{location}%')
        if experience_level:
            query = query.eq('experience_level', experience_level)
        if availability:
            query = query.eq('availability', availability)
            
        result = query.execute()
        return result.data or []
    
    def delete_user(self, user_id: str) -> bool:
        """Delete a user (admin only)"""
        result = self.admin_client.table('users')\
            .delete()\
            .eq('id', user_id)\
            .execute()
        return len(result.data) > 0

class InternshipService:
    """Service layer for internship operations"""
    
    def __init__(self):
        self.client = get_supabase_client()
    
    def create_internship(self, internship_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new internship posting"""
        result = self.client.table('internships').insert(internship_data).execute()
        return result.data[0] if result.data else None
    
    def get_internships(self, 
                       status: str = 'open',
                       skills: Optional[List[str]] = None,
                       location: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get internships with filters"""
        query = self.client.table('internships')\
            .select('*')\
            .eq('status', status)\
            .order('posted_at', desc=True)
        
        if skills:
            query = query.overlaps('required_skills', skills)
        if location:
            query = query.ilike('location', f'%{location}%')
            
        result = query.execute()
        return result.data or []
    
    def get_internship_by_id(self, internship_id: str) -> Optional[Dict[str, Any]]:
        """Get internship by ID"""
        result = self.client.table('internships')\
            .select('*')\
            .eq('id', internship_id)\
            .execute()
        return result.data[0] if result.data else None

class FreelanceJobService:
    """Service layer for freelance job operations"""
    
    def __init__(self):
        self.client = get_supabase_client()
    
    def create_freelance_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new freelance job posting"""
        result = self.client.table('freelance_jobs').insert(job_data).execute()
        return result.data[0] if result.data else None
    
    def get_freelance_jobs(self,
                          status: str = 'open',
                          category: Optional[str] = None,
                          budget_min: Optional[float] = None,
                          budget_max: Optional[float] = None) -> List[Dict[str, Any]]:
        """Get freelance jobs with filters"""
        query = self.client.table('freelance_jobs')\
            .select('*')\
            .eq('status', status)\
            .order('posted_at', desc=True)
        
        if category:
            query = query.eq('category', category)
        if budget_min:
            query = query.gte('budget_min', budget_min)
        if budget_max:
            query = query.lte('budget_max', budget_max)
            
        result = query.execute()
        return result.data or []

# Service instances
user_service = UserService()
internship_service = InternshipService()
freelance_job_service = FreelanceJobService()