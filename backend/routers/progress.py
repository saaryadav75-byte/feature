from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List
from schemas.progress import Progress, ProgressUpdate, FocusSession, FocusSessionCreate, FocusSessionEnd
from utils.auth import get_current_user
from models.database import get_supabase_client

router = APIRouter(prefix="/progress", tags=["progress"])

@router.post("", response_model=Progress)
async def update_progress(progress_data: ProgressUpdate, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        # Check if progress exists
        existing_response = client.table('progress').select('id').eq('user_id', current_user['user_id']).eq('lesson_id', progress_data.lesson_id).execute()

        if existing_response.data:
            # Update existing progress
            update_data = {
                'completion_percentage': progress_data.completion_percentage,
                'time_spent_minutes': progress_data.time_spent_minutes,
                'last_accessed': datetime.now(timezone.utc).isoformat()
            }
            updated_response = client.table('progress').update(update_data).eq('user_id', current_user['user_id']).eq('lesson_id', progress_data.lesson_id).execute()
            if updated_response.data:
                return Progress(**updated_response.data[0])

        # Create new progress
        progress_id = f"progress_{datetime.now(timezone.utc).timestamp()}"
        progress_insert = {
            'id': progress_id,
            'user_id': current_user['user_id'],
            'course_id': progress_data.course_id,
            'lesson_id': progress_data.lesson_id,
            'completion_percentage': progress_data.completion_percentage,
            'time_spent_minutes': progress_data.time_spent_minutes,
            'last_accessed': datetime.now(timezone.utc).isoformat()
        }
        client.table('progress').insert(progress_insert).execute()

        return Progress(**progress_insert)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating progress: {str(e)}")

@router.get("/course/{course_id}")
async def get_course_progress(course_id: str, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []  # Return empty list if database not available
    
    try:
        response = client.table('progress').select('*').eq('user_id', current_user['user_id']).eq('course_id', course_id).order('last_accessed', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course progress: {str(e)}")

@router.get("/enrolled")
async def get_enrolled_courses(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []
    
    try:
        enrollments_response = client.table('enrollments').select('course_id,enrolled_at').eq('user_id', current_user['user_id']).execute()
        
        enrolled_courses = []
        for enrollment in enrollments_response.data:
            course_id = enrollment['course_id']
            course_response = client.table('courses').select('*').eq('id', course_id).execute()
            if course_response.data:
                course = course_response.data[0]
                progress_response = client.table('progress').select('completion_percentage').eq('user_id', current_user['user_id']).eq('course_id', course_id).execute()
                progress = progress_response.data[0]['completion_percentage'] if progress_response.data else 0
                enrolled_courses.append({
                    **course,
                    'progress_percentage': progress,
                    'enrolled_at': enrollment['enrolled_at']
                })
        
        return enrolled_courses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching enrolled courses: {str(e)}")
