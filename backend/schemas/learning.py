from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    lesson_id: str
    questions: List[QuizQuestion]

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: List[int]

class QuizResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    quiz_id: str
    score: float
    total_questions: int
    correct_answers: int
    submitted_at: str

class LessonBookmark(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    lesson_id: str
    created_at: str

class VideoProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    lesson_id: str
    progress_seconds: float
    duration_seconds: float
    last_watched: str
