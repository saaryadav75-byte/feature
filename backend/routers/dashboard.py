from fastapi import APIRouter, Depends
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    enrollments = await db.enrollments.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(100)
    sessions = await db.focus_sessions.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(100)
    
    total_sessions = len(sessions)
    total_focused_time = sum(s.get('duration_minutes', 0) for s in sessions)
    
    return {
        "coins": user.get('coins', 0),
        "total_study_hours": user.get('total_study_hours', 0),
        "enrolled_courses": len(enrollments),
        "total_sessions": total_sessions,
        "total_focused_minutes": total_focused_time
    }
