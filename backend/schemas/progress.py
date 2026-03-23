from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class ProgressUpdate(BaseModel):
    lesson_id: str
    course_id: str
    completion_percentage: float
    time_spent_minutes: float

class Progress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    course_id: str
    lesson_id: str
    completion_percentage: float
    time_spent_minutes: float
    last_accessed: str

class FocusSessionCreate(BaseModel):
    lesson_id: str

class FocusSessionEnd(BaseModel):
    session_id: str
    duration_minutes: float
    engagement_logs: List[Dict[str, Any]]

class FocusSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    lesson_id: str
    start_time: str
    end_time: Optional[str] = None
    duration_minutes: float = 0
    engagement_logs: List[Dict[str, Any]] = []
    coins_earned: int = 0
