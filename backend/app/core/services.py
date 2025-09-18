# backend/app/core/services.py
from typing import List, Optional, Dict, Any
from app.core.database import get_supabase_client
from app.models.user import UserCreate, UserUpdate, UserResponse
import uuid

class UserService:
    """Service layer for user operations"""
    
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            self._client = get_supabase_client()
        return self._client
    
    # Supabase client has a single interface; service role is configured via env key
    
    def create_user(self, user_data: UserCreate, auth_id: str = None) -> Dict[str, Any]:
        """Create a new user with translation support"""
        from app.core.translation import detect_and_translate
        
        user_dict = user_data.dict(exclude_unset=True)
        if auth_id:
            user_dict['auth_id'] = auth_id
        
        # Handle professional summary translation
        if 'professional_summary' in user_dict and user_dict['professional_summary']:
            summary = user_dict['professional_summary']
            source_lang, translations = detect_and_translate(summary, 'professional_summary')
            
            user_dict['professional_summary_source_language'] = source_lang
            user_dict['professional_summary_translations'] = translations
            
            # Keep the original field for backward compatibility
            user_dict['professional_summary'] = summary
            
        res = self.client.table('users').insert(user_dict).execute()
        return (res.data or [{}])[0]
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        res = self.client.table('users').select('*').eq('id', user_id).limit(1).execute()
        return (res.data or [None])[0]
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        res = self.client.table('users').select('*').eq('email', email).limit(1).execute()
        return (res.data or [None])[0]
    
    def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[Dict[str, Any]]:
        """Update user information with translation support"""
        from app.core.translation import detect_and_translate
        
        update_dict = user_data.dict(exclude_unset=True)
        if not update_dict:
            return None
        
        # Handle professional summary translation if it's being updated
        if 'professional_summary' in update_dict and update_dict['professional_summary']:
            summary = update_dict['professional_summary']
            source_lang, translations = detect_and_translate(summary, 'professional_summary')
            
            update_dict['professional_summary_source_language'] = source_lang
            update_dict['professional_summary_translations'] = translations
            
        res = self.client.table('users').update(update_dict).eq('id', user_id).execute()
        return (res.data or [None])[0]
    
    def get_talents(self, 
                   skills: Optional[List[str]] = None,
                   location: Optional[str] = None,
                   experience_level: Optional[str] = None,
                   availability: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get talents with optional filters"""
        q = self.client.table('users').select('*').eq('role', 'talent')
        if skills:
            q = q.cs('skills', skills)  # contains
        if location:
            q = q.ilike('location', f"%{location}%")
        if experience_level:
            q = q.eq('experience_level', experience_level)
        if availability:
            q = q.eq('availability', availability)
        res = q.execute()
        return res.data or []
    
    def delete_user(self, user_id: str) -> bool:
        """Delete a user (admin only)"""
        res = self.client.table('users').delete().eq('id', user_id).execute()
        return bool(res.data)

class InternshipService:
    """Service layer for internship operations"""
    
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            self._client = get_supabase_client()
        return self._client
    
    def create_internship(self, internship_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new internship posting"""
        res = self.client.table('internships').insert(internship_data).execute()
        return (res.data or [{}])[0]
    
    def get_internships(self, 
                       status: str = 'open',
                       skills: Optional[List[str]] = None,
                       location: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get internships with filters"""
        q = self.client.table('internships').select('*').eq('status', status).order('posted_at', desc=True)
        if skills:
            q = q.cs('required_skills', skills)
        if location:
            q = q.ilike('location', f"%{location}%")
        res = q.execute()
        return res.data or []
    
    def get_internship_by_id(self, internship_id: str) -> Optional[Dict[str, Any]]:
        """Get internship by ID"""
        res = self.client.table('internships').select('*').eq('id', internship_id).limit(1).execute()
        return (res.data or [None])[0]

class FreelanceJobService:
    """Service layer for freelance job operations"""
    
    def __init__(self):
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            self._client = get_supabase_client()
        return self._client
    
    def create_freelance_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new freelance job posting"""
        res = self.client.table('freelance_jobs').insert(job_data).execute()
        return (res.data or [{}])[0]
    
    def get_freelance_jobs(self,
                          status: str = 'open',
                          category: Optional[str] = None,
                          budget_min: Optional[float] = None,
                          budget_max: Optional[float] = None) -> List[Dict[str, Any]]:
        """Get freelance jobs with filters"""
        q = self.client.table('freelance_jobs').select('*').eq('status', status).order('posted_at', desc=True)
        if category:
            q = q.eq('category', category)
        if budget_min is not None:
            q = q.gte('budget_min', budget_min)
        if budget_max is not None:
            q = q.lte('budget_max', budget_max)
        res = q.execute()
        return res.data or []

# Service instances
user_service = UserService()
internship_service = InternshipService()
freelance_job_service = FreelanceJobService()