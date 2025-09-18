# backend/app/models/saved_job.py
from typing import Optional
from pydantic import BaseModel, UUID4
from datetime import datetime
from enum import Enum

class JobType(str, Enum):
    INTERNSHIP = "internship"
    FREELANCE = "freelance"

class SavedJobCreate(BaseModel):
    """Model for creating a saved job"""
    talent_id: UUID4
    job_id: Optional[UUID4] = None
    internship_id: Optional[UUID4] = None
    job_type: JobType
    notes: Optional[str] = None

class SavedJobUpdate(BaseModel):
    """Model for updating a saved job"""
    notes: Optional[str] = None

class SavedJobResponse(BaseModel):
    """Model for saved job response data"""
    id: UUID4
    talent_id: UUID4
    job_id: Optional[UUID4]
    internship_id: Optional[UUID4]
    job_type: JobType
    saved_at: datetime
    notes: Optional[str]
