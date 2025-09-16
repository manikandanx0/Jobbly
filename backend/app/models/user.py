# backend/app/models/user.py
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime

class UserCreate(BaseModel):
    """Model for creating a new user"""
    role: str  # 'talent', 'recruiter', 'admin'
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    professional_summary: Optional[str] = None
    experience_level: Optional[str] = None
    current_position: Optional[str] = None
    years_of_experience: Optional[int] = 0
    hourly_rate: Optional[float] = None
    availability: Optional[str] = 'full-time'
    skills: Optional[List[str]] = []
    preferred_work_type: Optional[List[str]] = ['remote']
    education: Optional[Dict[str, Any]] = None
    certifications: Optional[List[str]] = []
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_website: Optional[str] = None

class UserUpdate(BaseModel):
    """Model for updating user information"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    professional_summary: Optional[str] = None
    experience_level: Optional[str] = None
    current_position: Optional[str] = None
    years_of_experience: Optional[int] = None
    hourly_rate: Optional[float] = None
    availability: Optional[str] = None
    skills: Optional[List[str]] = None
    preferred_work_type: Optional[List[str]] = None
    education: Optional[Dict[str, Any]] = None
    certifications: Optional[List[str]] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_website: Optional[str] = None

class UserResponse(BaseModel):
    """Model for user response data"""
    id: UUID4
    role: str
    full_name: str
    email: str
    phone: Optional[str]
    location: Optional[str]
    professional_summary: Optional[str]
    experience_level: Optional[str]
    current_position: Optional[str]
    years_of_experience: int
    hourly_rate: Optional[float]
    availability: str
    skills: List[str]
    preferred_work_type: List[str]
    education: Optional[Dict[str, Any]]
    certifications: List[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_website: Optional[str]
    created_at: datetime
    updated_at: datetime