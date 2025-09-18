# backend/app/core/services.py
from typing import List, Optional, Dict, Any
from app.core.database import get_db_connection, get_admin_connection
from app.models.user import UserCreate, UserUpdate, UserResponse
import uuid

class UserService:
    """Service layer for user operations"""
    
    def __init__(self):
        self._conn = None
    
    @property
    def conn(self):
        if self._conn is None:
            self._conn = get_db_connection()
        return self._conn
    
    @property
    def admin_conn(self):
        return get_admin_connection()
    
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
            
        with self.admin_conn().cursor() as cur:
            columns = ','.join(user_dict.keys())
            placeholders = ','.join(['%s'] * len(user_dict))
            cur.execute(f"INSERT INTO public.users ({columns}) VALUES ({placeholders}) RETURNING *", list(user_dict.values()))
            row = cur.fetchone()
            self.admin_conn().commit()
            return row
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        with self.conn().cursor() as cur:
            cur.execute("SELECT * FROM public.users WHERE id = %s", (user_id,))
            return cur.fetchone()
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        with self.conn().cursor() as cur:
            cur.execute("SELECT * FROM public.users WHERE email = %s", (email,))
            return cur.fetchone()
    
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
            
        sets = ','.join([f"{k} = %s" for k in update_dict.keys()])
        with self.admin_conn().cursor() as cur:
            cur.execute(f"UPDATE public.users SET {sets} WHERE id = %s RETURNING *", list(update_dict.values()) + [user_id])
            row = cur.fetchone()
            self.admin_conn().commit()
            return row
    
    def get_talents(self, 
                   skills: Optional[List[str]] = None,
                   location: Optional[str] = None,
                   experience_level: Optional[str] = None,
                   availability: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get talents with optional filters"""
        sql = "SELECT * FROM public.users WHERE role = 'talent'"
        params = []
        
        if skills:
            sql += " AND skills && %s"; params.append(skills)
        if location:
            sql += " AND location ILIKE %s"; params.append(f"%{location}%")
        if experience_level:
            sql += " AND experience_level = %s"; params.append(experience_level)
        if availability:
            sql += " AND availability = %s"; params.append(availability)
        with self.conn().cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall() or []
    
    def delete_user(self, user_id: str) -> bool:
        """Delete a user (admin only)"""
        with self.admin_conn().cursor() as cur:
            cur.execute("DELETE FROM public.users WHERE id = %s RETURNING id", (user_id,))
            ok = cur.fetchone() is not None
            self.admin_conn().commit()
            return ok

class InternshipService:
    """Service layer for internship operations"""
    
    def __init__(self):
        self._conn = None
    
    @property
    def client(self):
        if self._conn is None:
            self._conn = get_db_connection()
        return self._conn
    
    def create_internship(self, internship_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new internship posting"""
        columns = ','.join(internship_data.keys())
        placeholders = ','.join(['%s'] * len(internship_data))
        with self.conn().cursor() as cur:
            cur.execute(f"INSERT INTO public.internships ({columns}) VALUES ({placeholders}) RETURNING *", list(internship_data.values()))
            row = cur.fetchone(); self.conn().commit(); return row
    
    def get_internships(self, 
                       status: str = 'open',
                       skills: Optional[List[str]] = None,
                       location: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get internships with filters"""
        sql = "SELECT * FROM public.internships WHERE status = %s ORDER BY posted_at DESC"; params=[status]
        
        if skills:
            sql = sql.replace('WHERE status = %s', 'WHERE status = %s AND required_skills && %s'); params.append(skills)
        if location:
            sql = sql.replace('ORDER BY posted_at DESC', 'AND location ILIKE %s ORDER BY posted_at DESC'); params.append(f"%{location}%")
        with self.conn().cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall() or []
    
    def get_internship_by_id(self, internship_id: str) -> Optional[Dict[str, Any]]:
        """Get internship by ID"""
        with self.conn().cursor() as cur:
            cur.execute("SELECT * FROM public.internships WHERE id = %s", (internship_id,))
            return cur.fetchone()

class FreelanceJobService:
    """Service layer for freelance job operations"""
    
    def __init__(self):
        self._conn = None
    
    @property
    def client(self):
        if self._conn is None:
            self._conn = get_db_connection()
        return self._conn
    
    def create_freelance_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new freelance job posting"""
        columns = ','.join(job_data.keys())
        placeholders = ','.join(['%s'] * len(job_data))
        with self.conn().cursor() as cur:
            cur.execute(f"INSERT INTO public.freelance_jobs ({columns}) VALUES ({placeholders}) RETURNING *", list(job_data.values()))
            row = cur.fetchone(); self.conn().commit(); return row
    
    def get_freelance_jobs(self,
                          status: str = 'open',
                          category: Optional[str] = None,
                          budget_min: Optional[float] = None,
                          budget_max: Optional[float] = None) -> List[Dict[str, Any]]:
        """Get freelance jobs with filters"""
        sql = "SELECT * FROM public.freelance_jobs WHERE status = %s ORDER BY posted_at DESC"; params=[status]
        
        if category:
            sql = sql.replace('WHERE status = %s', 'WHERE status = %s AND category = %s'); params.append(category)
        if budget_min:
            sql = sql.replace('ORDER BY posted_at DESC', 'AND budget_min >= %s ORDER BY posted_at DESC'); params.append(budget_min)
        if budget_max:
            sql = sql.replace('ORDER BY posted_at DESC', 'AND budget_max <= %s ORDER BY posted_at DESC'); params.append(budget_max)
        with self.conn().cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall() or []

# Service instances
user_service = UserService()
internship_service = InternshipService()
freelance_job_service = FreelanceJobService()