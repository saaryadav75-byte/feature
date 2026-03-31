from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List
from schemas.course import Course, CourseCreate, Lesson, LessonCreate
from utils.auth import get_current_user
from models.database import get_supabase_client

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("", response_model=List[Course])
async def get_courses(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []  # Return empty list if database not available
    
    try:
        response = client.table('courses').select('*').order('created_at', desc=True).execute()
        return [Course(**row) for row in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")

@router.post("", response_model=Course)
async def create_course(course_data: CourseCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] not in ['instructor', 'admin']:
        raise HTTPException(status_code=403, detail="Only instructors can create courses")

    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        # Get user name
        user_response = client.table('users').select('name').eq('id', current_user['user_id']).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_name = user_response.data[0]['name']
        course_id = f"course_{datetime.now(timezone.utc).timestamp()}"

        course_insert = {
            'id': course_id,
            'title': course_data.title,
            'description': course_data.description,
            'instructor_id': current_user['user_id'],
            'instructor_name': user_name,
            'thumbnail': course_data.thumbnail,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'students_enrolled': 0,
            'price': course_data.price,
            'category': course_data.category,
            'difficulty': course_data.difficulty,
            'rating': 0.0
        }
        
        client.table('courses').insert(course_insert).execute()

        return Course(**course_insert)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating course: {str(e)}")

@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")
    
    try:
        response = client.table('courses').select('*').eq('id', course_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Course not found")
        return Course(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course: {str(e)}")

@router.post("/{course_id}/enroll")
async def enroll_course(course_id: str, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        # Check if course exists
        course_response = client.table('courses').select('id').eq('id', course_id).execute()
        if not course_response.data:
            raise HTTPException(status_code=404, detail="Course not found")

        # Check if already enrolled
        existing_response = client.table('enrollments').select('id').eq('user_id', current_user['user_id']).eq('course_id', course_id).execute()
        if existing_response.data:
            return {"message": "Already enrolled"}

        # Create enrollment using UUID
        import uuid
        enrollment_id = str(uuid.uuid4())
        
        enrollment_data = {
            'id': enrollment_id,
            'user_id': current_user['user_id'],
            'course_id': course_id,
            'enrolled_at': datetime.now(timezone.utc).isoformat(),
            'progress_percentage': 0.0
        }
        client.table('enrollments').insert(enrollment_data).execute()

        # Update course enrollment count
        course_data = client.table('courses').select('students_enrolled').eq('id', course_id).execute()
        current_count = course_data.data[0]['students_enrolled'] if course_data.data else 0
        client.table('courses').update({'students_enrolled': current_count + 1}).eq('id', course_id).execute()

        return {"message": "Enrolled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enrolling in course: {str(e)}")

@router.get("/{course_id}/lessons", response_model=List[Lesson])
async def get_lessons(course_id: str, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []  # Return empty list if database not available
    
    try:
        response = client.table('lessons').select('*').eq('course_id', course_id).order('order_index', desc=False).execute()
        return [Lesson(**row) for row in response.data]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lessons: {str(e)}")
