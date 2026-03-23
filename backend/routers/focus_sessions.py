from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List, Dict, Any
from schemas.progress import FocusSession, FocusSessionCreate, FocusSessionEnd
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/focus-sessions", tags=["focus-sessions"])

@router.post("/start", response_model=FocusSession)
async def start_focus_session(session_data: FocusSessionCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    session_id = f"session_{datetime.now(timezone.utc).timestamp()}"
    
    session_doc = {
        "id": session_id,
        "user_id": current_user['user_id'],
        "lesson_id": session_data.lesson_id,
        "start_time": datetime.now(timezone.utc).isoformat(),
        "end_time": None,
        "duration_minutes": 0,
        "engagement_logs": [],
        "coins_earned": 0
    }
    
    await db.focus_sessions.insert_one(session_doc)
    return FocusSession(**session_doc)

@router.post("/end")
async def end_focus_session(session_end: FocusSessionEnd, current_user: dict = Depends(get_current_user)):
    db = get_db()
    session = await db.focus_sessions.find_one({"id": session_end.session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    focused_count = sum(1 for log in session_end.engagement_logs if log.get('state') == 'focused')
    coins_earned = min(focused_count * 2, 50)
    
    await db.focus_sessions.update_one(
        {"id": session_end.session_id},
        {"$set": {
            "end_time": datetime.now(timezone.utc).isoformat(),
            "duration_minutes": session_end.duration_minutes,
            "engagement_logs": session_end.engagement_logs,
            "coins_earned": coins_earned
        }}
    )
    
    await db.users.update_one(
        {"id": current_user['user_id']},
        {"$inc": {"coins": coins_earned, "total_study_hours": session_end.duration_minutes / 60}}
    )
    
    return {"coins_earned": coins_earned, "message": "Session completed successfully"}

@router.post("/{session_id}/log")
async def log_engagement(session_id: str, log_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    db = get_db()
    await db.focus_sessions.update_one(
        {"id": session_id},
        {"$push": {"engagement_logs": log_data}}
    )
    return {"message": "Engagement logged"}
