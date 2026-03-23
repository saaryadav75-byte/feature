from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List
from schemas.progress import Progress, ProgressUpdate, FocusSession, FocusSessionCreate, FocusSessionEnd
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/progress", tags=["progress"])

@router.post("", response_model=Progress)
async def update_progress(progress_data: ProgressUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    existing = await db.progress.find_one({
        "user_id": current_user['user_id'],
        "lesson_id": progress_data.lesson_id
    }, {"_id": 0})
    
    if existing:
        await db.progress.update_one(
            {"user_id": current_user['user_id'], "lesson_id": progress_data.lesson_id},
            {"$set": {
                "completion_percentage": progress_data.completion_percentage,
                "time_spent_minutes": progress_data.time_spent_minutes,
                "last_accessed": datetime.now(timezone.utc).isoformat()
            }}
        )
        updated = await db.progress.find_one({
            "user_id": current_user['user_id'],
            "lesson_id": progress_data.lesson_id
        }, {"_id": 0})
        return Progress(**updated)
    
    progress_id = f"progress_{datetime.now(timezone.utc).timestamp()}"
    progress_doc = {
        "id": progress_id,
        "user_id": current_user['user_id'],
        "course_id": progress_data.course_id,
        "lesson_id": progress_data.lesson_id,
        "completion_percentage": progress_data.completion_percentage,
        "time_spent_minutes": progress_data.time_spent_minutes,
        "last_accessed": datetime.now(timezone.utc).isoformat()
    }
    
    await db.progress.insert_one(progress_doc)
    return Progress(**progress_doc)

@router.get("/course/{course_id}")
async def get_course_progress(course_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    progress_list = await db.progress.find({
        "user_id": current_user['user_id'],
        "course_id": course_id
    }, {"_id": 0}).to_list(100)
    return progress_list
