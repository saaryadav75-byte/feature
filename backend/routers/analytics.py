from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
from typing import List, Dict
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/heatmap/{user_id}")
async def get_study_heatmap(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get GitHub-style heatmap data for study activity"""
    db = get_db()
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=365)
    
    sessions = await db.focus_sessions.find({
        "user_id": user_id,
        "start_time": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    heatmap_data = {}
    
    for session in sessions:
        if session.get("start_time"):
            date_str = session["start_time"][:10]
            duration = session.get("duration_minutes", 0)
            
            if date_str in heatmap_data:
                heatmap_data[date_str] += duration
            else:
                heatmap_data[date_str] = duration
    
    result = []
    for date_str, minutes in heatmap_data.items():
        result.append({
            "date": date_str,
            "value": minutes,
            "level": get_intensity_level(minutes)
        })
    
    return sorted(result, key=lambda x: x["date"])

@router.get("/study-stats")
async def get_study_stats(days: int = 7, current_user: dict = Depends(get_current_user)):
    """Get study statistics for charts"""
    db = get_db()
    user_id = current_user['user_id']
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    sessions = await db.focus_sessions.find({
        "user_id": user_id,
        "start_time": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    daily_stats = {}
    
    for i in range(days):
        date = (start_date + timedelta(days=i)).date().isoformat()
        daily_stats[date] = {"sessions": 0, "minutes": 0}
    
    for session in sessions:
        if session.get("start_time"):
            date_str = session["start_time"][:10]
            if date_str in daily_stats:
                daily_stats[date_str]["sessions"] += 1
                daily_stats[date_str]["minutes"] += session.get("duration_minutes", 0)
    
    result = []
    for date_str, stats in sorted(daily_stats.items()):
        result.append({
            "date": date_str,
            "sessions": stats["sessions"],
            "minutes": stats["minutes"],
            "hours": round(stats["minutes"] / 60, 2)
        })
    
    return result

@router.get("/productivity-score")
async def get_productivity_score(current_user: dict = Depends(get_current_user)):
    """Calculate productivity score based on study time and sessions"""
    db = get_db()
    user_id = current_user['user_id']
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    sessions_count = await db.focus_sessions.count_documents({"user_id": user_id})
    
    study_hours = user.get("total_study_hours", 0)
    
    score = (study_hours * 0.6) + (sessions_count * 0.4)
    score = min(int(score * 10), 100)
    
    return {
        "score": score,
        "study_hours": study_hours,
        "total_sessions": sessions_count,
        "grade": get_grade(score)
    }

@router.get("/course-progress")
async def get_course_progress_analytics(current_user: dict = Depends(get_current_user)):
    """Get detailed course progress analytics"""
    db = get_db()
    user_id = current_user['user_id']
    
    enrollments = await db.enrollments.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    course_analytics = []
    
    for enrollment in enrollments:
        course_id = enrollment["course_id"]
        course = await db.courses.find_one({"id": course_id}, {"_id": 0})
        
        if course:
            lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).to_list(100)
            progress_records = await db.progress.find({
                "user_id": user_id,
                "course_id": course_id
            }, {"_id": 0}).to_list(100)
            
            completed_lessons = sum(1 for p in progress_records if p.get("completion_percentage", 0) >= 100)
            total_lessons = len(lessons)
            
            course_analytics.append({
                "course_id": course_id,
                "course_title": course["title"],
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "progress_percentage": (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
            })
    
    return course_analytics

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
