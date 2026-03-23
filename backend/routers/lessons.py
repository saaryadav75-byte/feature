from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from schemas.course import Lesson, LessonCreate
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/lessons", tags=["lessons"])

@router.post("", response_model=Lesson)
async def create_lesson(lesson_data: LessonCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] not in ['instructor', 'admin']:
        raise HTTPException(status_code=403, detail="Only instructors can create lessons")
    
    db = get_db()
    lesson_id = f"lesson_{datetime.now(timezone.utc).timestamp()}"
    
    lesson_doc = {
        "id": lesson_id,
        "course_id": lesson_data.course_id,
        "title": lesson_data.title,
        "content": lesson_data.content,
        "video_url": lesson_data.video_url,
        "order": lesson_data.order,
        "duration_minutes": lesson_data.duration_minutes
    }
    
    await db.lessons.insert_one(lesson_doc)
    return Lesson(**lesson_doc)

@router.get("/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return Lesson(**lesson)
