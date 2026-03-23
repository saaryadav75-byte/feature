from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List
from schemas.course import Course, CourseCreate, Lesson, LessonCreate
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("", response_model=List[Course])
async def get_courses(current_user: dict = Depends(get_current_user)):
    db = get_db()
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    return [Course(**c) for c in courses]

@router.post("", response_model=Course)
async def create_course(course_data: CourseCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] not in ['instructor', 'admin']:
        raise HTTPException(status_code=403, detail="Only instructors can create courses")
    
    db = get_db()
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    course_id = f"course_{datetime.now(timezone.utc).timestamp()}"
    
    course_doc = {
        "id": course_id,
        "title": course_data.title,
        "description": course_data.description,
        "instructor_id": current_user['user_id'],
        "instructor_name": user['name'],
        "thumbnail": course_data.thumbnail,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "students_enrolled": 0
    }
    
    await db.courses.insert_one(course_doc)
    return Course(**course_doc)

@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return Course(**course)

@router.post("/{course_id}/enroll")
async def enroll_course(course_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing = await db.enrollments.find_one({
        "user_id": current_user['user_id'],
        "course_id": course_id
    }, {"_id": 0})
    
    if existing:
        return {"message": "Already enrolled"}
    
    enrollment_doc = {
        "id": f"enrollment_{datetime.now(timezone.utc).timestamp()}",
        "user_id": current_user['user_id'],
        "course_id": course_id,
        "enrolled_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.enrollments.insert_one(enrollment_doc)
    await db.courses.update_one({"id": course_id}, {"$inc": {"students_enrolled": 1}})
    
    return {"message": "Enrolled successfully"}

@router.get("/{course_id}/lessons", response_model=List[Lesson])
async def get_lessons(course_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)
    return [Lesson(**l) for l in lessons]
