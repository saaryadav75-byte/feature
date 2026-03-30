from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
from typing import List
from schemas.gamification import CoinTransaction, CoinUpdate, UserStats, Streak, Achievement, UserAchievement
from utils.auth import get_current_user
from models.database import get_supabase_client
import math

router = APIRouter(prefix="/gamification", tags=["gamification"])

def calculate_level(total_xp: int) -> int:
    """Calculate user level based on total XP"""
    if total_xp < 100:
        return 1
    return int(math.log(total_xp / 100) / math.log(1.5)) + 1

@router.get("/coins/{user_id}")
async def get_user_coins(user_id: str, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        # Get user coins
        user_response = client.table('users').select('coins').eq('id', user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")

        # Get recent transactions
        transactions_response = client.table('coin_transactions').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(20).execute()

        return {
            "current_balance": user_response.data[0]['coins'],
            "recent_transactions": transactions_response.data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching coins: {str(e)}")

@router.post("/coins/update")
async def update_coins(coin_data: CoinUpdate, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        user_id = current_user['user_id']

        # Create transaction
        transaction_id = f"tx_{datetime.now(timezone.utc).timestamp()}"
        transaction_data = {
            'id': transaction_id,
            'user_id': user_id,
            'amount': coin_data.amount,
            'transaction_type': coin_data.transaction_type,
            'description': coin_data.description,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        client.table('coin_transactions').insert(transaction_data).execute()

        # Update user balance
        user_response = client.table('users').select('coins').eq('id', user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        new_balance = (user_response.data[0]['coins'] or 0) + coin_data.amount
        client.table('users').update({'coins': new_balance}).eq('id', user_id).execute()

        return {
            "success": True,
            "new_balance": new_balance,
            "transaction": transaction_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating coins: {str(e)}")

@router.get("/stats", response_model=UserStats)
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        user_id = current_user['user_id']

        # Get user data
        user_response = client.table('users').select('total_xp,coins,total_study_hours').eq('id', user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_response.data[0]

        # Get streak data
        streak_response = client.table('streaks').select('current_streak,longest_streak').eq('user_id', user_id).execute()

        # Get achievements count
        achievements_response = client.table('user_achievements').select('count()', count='exact').eq('user_id', user_id).execute()

        total_xp = user_data.get('total_xp') or 0
        level = calculate_level(total_xp)

        return UserStats(
            user_id=user_id,
            total_xp=total_xp,
            level=level,
            coins=user_data.get('coins') or 0,
            total_study_hours=user_data.get('total_study_hours') or 0,
            current_streak=streak_response.data[0]['current_streak'] if streak_response.data else 0,
            longest_streak=streak_response.data[0]['longest_streak'] if streak_response.data else 0,
            achievements_unlocked=len(achievements_response.data) if achievements_response.data else 0
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user stats: {str(e)}")

@router.get("/streak")
async def get_streak(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return {"current_streak": 0, "longest_streak": 0}
    
    try:
        user_id = current_user['user_id']

        response = client.table('streaks').select('current_streak,longest_streak').eq('user_id', user_id).execute()

        if not response.data:
            return {"current_streak": 0, "longest_streak": 0}

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching streak: {str(e)}")

@router.post("/streak/update")
async def update_streak(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        user_id = current_user['user_id']
        today = datetime.now(timezone.utc).date().isoformat()

        # Check if streak exists
        streak_response = client.table('streaks').select('current_streak,longest_streak,last_study_date').eq('user_id', user_id).execute()

        if not streak_response.data:
            # Create new streak
            streak_data = {
                'user_id': user_id,
                'current_streak': 1,
                'longest_streak': 1,
                'last_study_date': today
            }
            client.table('streaks').insert(streak_data).execute()
            return {"current_streak": 1, "longest_streak": 1}

        streak_data = streak_response.data[0]
        last_date = streak_data['last_study_date']
        
        if last_date == today:
            return {"current_streak": streak_data['current_streak'], "message": "Already logged today"}

        yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()

        if last_date == yesterday:
            new_streak_count = streak_data['current_streak'] + 1
        else:
            new_streak_count = 1

        longest_streak = max(new_streak_count, streak_data['longest_streak'])

        # Update streak
        update_data = {
            'current_streak': new_streak_count,
            'longest_streak': longest_streak,
            'last_study_date': today
        }
        client.table('streaks').update(update_data).eq('user_id', user_id).execute()

        return {"current_streak": new_streak_count, "longest_streak": longest_streak}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating streak: {str(e)}")

@router.get("/achievements", response_model=List[UserAchievement])
async def get_user_achievements(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []
    
    try:
        user_id = current_user['user_id']

        response = client.table('user_achievements').select('*').eq('user_id', user_id).order('unlocked_at', desc=True).execute()

        achievements = []
        for row in response.data:
            achievements.append({
                "id": row['id'],
                "user_id": row['user_id'],
                "achievement_id": row['achievement_id'],
                "unlocked_at": row['unlocked_at'],
                "details": row
            })

        return achievements
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching achievements: {str(e)}")

@router.get("/leaderboard")
async def get_leaderboard(metric: str = "coins", limit: int = 10):
    client = get_supabase_client()
    if not client:
        return []
    
    try:
        valid_metrics = ["coins", "total_study_hours", "total_xp"]
        if metric not in valid_metrics:
            metric = "coins"

        response = client.table('users').select(f'name,{metric}').order(metric, desc=True).limit(limit).execute()

        leaderboard = []
        for idx, row in enumerate(response.data):
            leaderboard.append({
                "rank": idx + 1,
                "name": row['name'],
                "value": row.get(metric, 0),
                "metric": metric
            })

        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")
