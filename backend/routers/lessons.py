from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from schemas.course import Lesson, LessonCreate
from utils.auth import get_current_user
from models.database import get_supabase_client

router = APIRouter(prefix="/lessons", tags=["lessons"])

@router.post("", response_model=Lesson)
async def create_lesson(lesson_data: LessonCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] not in ['instructor', 'admin']:
        raise HTTPException(status_code=403, detail="Only instructors can create lessons")

    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        lesson_id = f"lesson_{datetime.now(timezone.utc).timestamp()}"

        lesson_insert = {
            'id': lesson_id,
            'course_id': lesson_data.course_id,
            'title': lesson_data.title,
            'content': lesson_data.content,
            'video_url': lesson_data.video_url,
            'order_index': lesson_data.order,
            'duration_minutes': lesson_data.duration_minutes,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        client.table('lessons').insert(lesson_insert).execute()

        return Lesson(
            id=lesson_id,
            course_id=lesson_data.course_id,
            title=lesson_data.title,
            content=lesson_data.content,
            video_url=lesson_data.video_url,
            order=lesson_data.order,
            duration_minutes=lesson_data.duration_minutes
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating lesson: {str(e)}")

@router.get("/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        response = client.table('lessons').select('*').eq('id', lesson_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Lesson not found")

        row = response.data[0]
        return Lesson(
            id=row['id'],
            course_id=row['course_id'],
            title=row['title'],
            content=row['content'],
            video_url=row['video_url'],
            order=row['order_index'],
            duration_minutes=row['duration_minutes']
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lesson: {str(e)}")
