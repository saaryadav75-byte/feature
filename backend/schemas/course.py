from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class CourseBase(BaseModel):
    title: str
    description: str
    thumbnail: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    instructor_id: str
    instructor_name: str
    created_at: str
    students_enrolled: int = 0

class LessonBase(BaseModel):
    title: str
    content: str
    video_url: Optional[str] = None
    order: int
    duration_minutes: int = 30

class LessonCreate(LessonBase):
    course_id: str

class Lesson(LessonBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    course_id: str
