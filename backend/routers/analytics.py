from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
from typing import List, Dict
from utils.auth import get_current_user
from models.database import get_supabase_client

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_intensity_level(minutes: float) -> int:
    """Convert study minutes to intensity level (0-4)"""
    if minutes == 0:
        return 0
    elif minutes < 30:
        return 1
    elif minutes < 60:
        return 2
    elif minutes < 120:
        return 3
    else:
        return 4

@router.get("/heatmap/{user_id}")
async def get_study_heatmap(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get GitHub-style heatmap data for study activity"""
    client = get_supabase_client()
    if not client:
        return []

    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=365)

        response = client.table('focus_sessions').select('start_time,duration_minutes').eq('user_id', user_id).gte('start_time', start_date.isoformat()).execute()
        
        heatmap_data = {}
        for session in response.data:
            date = session['start_time'].split('T')[0] if session['start_time'] else None
            if date:
                if date not in heatmap_data:
                    heatmap_data[date] = 0
                heatmap_data[date] += session.get('duration_minutes', 0)

        result = []
        for date, minutes in sorted(heatmap_data.items()):
            result.append({
                "date": date,
                "value": minutes,
                "level": get_intensity_level(minutes)
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching heatmap: {str(e)}")

@router.get("/study-stats")
async def get_study_stats(days: int = 7, current_user: dict = Depends(get_current_user)):
    """Get study statistics for charts"""
    client = get_supabase_client()
    if not client:
        return []

    try:
        user_id = current_user['user_id']
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)

        response = client.table('focus_sessions').select('start_time,duration_minutes').eq('user_id', user_id).gte('start_time', start_date.isoformat()).execute()

        # Create map of existing data
        existing_data = {}
        for session in response.data:
            date = session['start_time'].split('T')[0] if session['start_time'] else None
            if date not in existing_data:
                existing_data[date] = {'sessions': 0, 'minutes': 0}
            existing_data[date]['sessions'] += 1
            existing_data[date]['minutes'] += session.get('duration_minutes', 0)

        # Fill in missing days with zeros
        result = []
        for i in range(days):
            date = (start_date + timedelta(days=i)).date().isoformat()
            stats = existing_data.get(date, {'sessions': 0, 'minutes': 0})
            result.append({
                "date": date,
                "sessions": stats['sessions'],
                "minutes": stats['minutes'],
                "hours": round(stats['minutes'] / 60, 2)
            })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching study stats: {str(e)}")

@router.get("/productivity-score")
async def get_productivity_score(current_user: dict = Depends(get_current_user)):
    """Calculate productivity score based on study time and sessions"""
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        user_id = current_user['user_id']

        # Get user study hours
        user_response = client.table('users').select('total_study_hours').eq('id', user_id).execute()
        study_hours = user_response.data[0]['total_study_hours'] if user_response.data else 0

        # Get sessions count
        sessions_response = client.table('focus_sessions').select('count()', count='exact').eq('user_id', user_id).execute()
        sessions_count = len(sessions_response.data) if sessions_response.data else 0

        score = (study_hours * 0.6) + (sessions_count * 0.4)
        score = min(int(score * 10), 100)

        return {
            "score": score,
            "study_hours": study_hours,
            "total_sessions": sessions_count,
            "grade": get_grade(score)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating productivity score: {str(e)}")

@router.get("/course-progress")
async def get_course_progress_analytics(current_user: dict = Depends(get_current_user)):
    """Get detailed course progress analytics"""
    client = get_supabase_client()
    if not client:
        return []

    try:
        user_id = current_user['user_id']

        # Get user enrollments
        enrollments_response = client.table('enrollments').select('course_id').eq('user_id', user_id).execute()
        
        course_analytics = []
        for enrollment in enrollments_response.data:
            course_id = enrollment['course_id']
            
            # Get course info
            course_response = client.table('courses').select('id,title').eq('id', course_id).execute()
            if not course_response.data:
                continue
            
            course_data = course_response.data[0]
            
            # Get lessons count
            lessons_response = client.table('lessons').select('id').eq('course_id', course_id).execute()
            total_lessons = len(lessons_response.data) if lessons_response.data else 0
            
            # Get completed lessons
            progress_response = client.table('progress').select('id').eq('user_id', user_id).eq('course_id', course_id).gte('completion_percentage', 100).execute()
            completed_lessons = len(progress_response.data) if progress_response.data else 0
            
            progress_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0

            course_analytics.append({
                "course_id": course_data['id'],
                "course_title": course_data['title'],
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "progress_percentage": progress_percentage
            })

        return course_analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course progress analytics: {str(e)}")

def get_intensity_level(minutes: float) -> int:
    """Convert study minutes to heatmap intensity level (0-4)"""
    if minutes == 0:
        return 0
    elif minutes < 30:
        return 1
    elif minutes < 60:
        return 2
    elif minutes < 120:
        return 3
    else:
        return 4

def get_grade(score: int) -> str:
    """Convert score to grade"""
    if score >= 90:
        return "A+"
    elif score >= 80:
        return "A"
    elif score >= 70:
        return "B"
    elif score >= 60:
        return "C"
    else:
        return "D"
