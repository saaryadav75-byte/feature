from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class CourseBase(BaseModel):
    title: str
    description: str
    thumbnail: Optional[str] = None

class CourseCreate(BaseModel):
    title: str
    description: str
    thumbnail: Optional[str] = None
    price: float = 0.0
    category: str = ""
    difficulty: str = "beginner"

class Course(CourseBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    instructor_id: str
    instructor_name: str
    created_at: Optional[str] = None
    students_enrolled: int = 0
    price: float = 0.0
    category: str = ""
    difficulty: str = "beginner"
    rating: float = 0.0

class LessonBase(BaseModel):
    title: str
    content: str
    video_url: Optional[str] = None
    order_index: int
    duration_minutes: int = 30

class LessonCreate(LessonBase):
    course_id: str

class Lesson(LessonBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    course_id: str
