from fastapi import APIRouter, Depends, HTTPException
from utils.auth import get_current_user
from models.database import get_supabase_client

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return {
            "coins": 0,
            "total_study_hours": 0,
            "enrolled_courses": 0,
            "total_sessions": 0,
            "total_focused_minutes": 0
        }

    try:
        # Get user stats
        user_response = client.table('users').select('coins,total_study_hours').eq('id', current_user['user_id']).execute()

        # Get enrolled courses count
        enrollments_response = client.table('enrollments').select('count()', count='exact').eq('user_id', current_user['user_id']).execute()

        # Get focus sessions stats
        sessions_response = client.table('focus_sessions').select('duration_minutes').eq('user_id', current_user['user_id']).execute()

        user_data = user_response.data[0] if user_response.data else {}
        
        total_focused_minutes = 0
        if sessions_response.data:
            total_focused_minutes = sum(s.get('duration_minutes', 0) or 0 for s in sessions_response.data)

        return {
            "coins": user_data.get('coins') or 0,
            "total_study_hours": user_data.get('total_study_hours') or 0,
            "enrolled_courses": len(enrollments_response.data) if enrollments_response.data else 0,
            "total_sessions": len(sessions_response.data) if sessions_response.data else 0,
            "total_focused_minutes": total_focused_minutes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")
