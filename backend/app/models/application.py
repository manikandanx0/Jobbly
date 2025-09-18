# backend/app/models/application.py
from typing import Optional, Dict, Any
from pydantic import BaseModel, UUID4
from datetime import datetime
from enum import Enum

class JobType(str, Enum):
    INTERNSHIP = "internship"
    FREELANCE = "freelance"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    REVIEWING = "reviewing"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ACCEPTED = "accepted"
    WITHDRAWN = "withdrawn"

class ApplicationCreate(BaseModel):
    """Model for creating a new application"""
    talent_id: UUID4
    job_id: Optional[UUID4] = None
    internship_id: Optional[UUID4] = None
    job_type: JobType
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    application_data: Optional[Dict[str, Any]] = {}

class ApplicationUpdate(BaseModel):
    """Model for updating an application"""
    status: Optional[ApplicationStatus] = None
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    application_data: Optional[Dict[str, Any]] = None
    recruiter_notes: Optional[str] = None
    interview_scheduled_at: Optional[datetime] = None

class ApplicationResponse(BaseModel):
    """Model for application response data"""
    id: UUID4
    talent_id: UUID4
    job_id: Optional[UUID4]
    internship_id: Optional[UUID4]
    job_type: JobType
    status: ApplicationStatus
    cover_letter: Optional[str]
    resume_url: Optional[str]
    portfolio_url: Optional[str]
    application_data: Optional[Dict[str, Any]]
    applied_at: datetime
    updated_at: datetime
    recruiter_notes: Optional[str]
    interview_scheduled_at: Optional[datetime]
