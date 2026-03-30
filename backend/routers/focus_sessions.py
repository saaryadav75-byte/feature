from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from schemas.progress import FocusSession, FocusSessionCreate, FocusSessionEnd
from utils.auth import get_current_user
from models.database import get_supabase_client
import json

router = APIRouter(prefix="/focus-sessions", tags=["focus-sessions"])

@router.get("", response_model=List[FocusSession])
async def get_focus_sessions(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []
    
    try:
        response = client.table('focus_sessions').select('*').eq('user_id', current_user['user_id']).order('start_time', desc=True).execute()
        return [FocusSession(**row) for row in response.data]
    except Exception as e:
        if 'Could not find the table' in str(e):
            return []
        raise HTTPException(status_code=500, detail=f"Error fetching focus sessions: {str(e)}")

@router.post("/start", response_model=FocusSession)
async def start_focus_session(session_data: FocusSessionCreate, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        session_id = f"session_{datetime.now(timezone.utc).timestamp()}"

        session_insert = {
            'id': session_id,
            'user_id': current_user['user_id'],
            'lesson_id': session_data.lesson_id,
            'start_time': datetime.now(timezone.utc).isoformat(),
            'end_time': None,
            'duration_minutes': 0,
            'engagement_logs': [],
            'coins_earned': 0
        }
        client.table('focus_sessions').insert(session_insert).execute()

        return FocusSession(**session_insert)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")

@router.post("/end")
async def end_focus_session(session_end: FocusSessionEnd, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        # Check if session exists
        session_response = client.table('focus_sessions').select('id').eq('id', session_end.session_id).execute()
        if not session_response.data:
            raise HTTPException(status_code=404, detail="Session not found")

        # Calculate coins earned
        focused_count = sum(1 for log in session_end.engagement_logs if log.get('state') == 'focused')
        coins_earned = min(focused_count * 2, 50)

        # Update session
        update_session_data = {
            'end_time': datetime.now(timezone.utc).isoformat(),
            'duration_minutes': session_end.duration_minutes,
            'engagement_logs': session_end.engagement_logs,
            'coins_earned': coins_earned
        }
        client.table('focus_sessions').update(update_session_data).eq('id', session_end.session_id).execute()

        # Update user stats
        user_response = client.table('users').select('coins,total_study_hours').eq('id', current_user['user_id']).execute()
        if user_response.data:
            user_data = user_response.data[0]
            new_coins = (user_data.get('coins', 0) or 0) + coins_earned
            new_hours = (user_data.get('total_study_hours', 0) or 0) + (session_end.duration_minutes / 60)
            client.table('users').update({'coins': new_coins, 'total_study_hours': new_hours}).eq('id', current_user['user_id']).execute()

        return {"coins_earned": coins_earned, "message": "Session completed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending session: {str(e)}")

@router.post("/{session_id}/log")
async def log_engagement(session_id: str, log_data: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        # Get current engagement logs
        session_response = client.table('focus_sessions').select('engagement_logs').eq('id', session_id).execute()
        if not session_response.data:
            raise HTTPException(status_code=404, detail="Session not found")

        session_data = session_response.data[0]
        current_logs = session_data.get('engagement_logs') or []
        if not isinstance(current_logs, list):
            current_logs = []
        current_logs.append(log_data)

        # Update with new log
        update_data = {'engagement_logs': current_logs}
        client.table('focus_sessions').update(update_data).eq('id', session_id).execute()

        return {"message": "Engagement logged"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging engagement: {str(e)}")
