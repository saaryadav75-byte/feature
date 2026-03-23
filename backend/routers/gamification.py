from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
from typing import List
from schemas.gamification import CoinTransaction, CoinUpdate, UserStats, Streak, Achievement, UserAchievement
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/gamification", tags=["gamification"])

@router.get("/coins/{user_id}")
async def get_user_coins(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    transactions = await db.coin_transactions.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {
        "current_balance": user.get("coins", 0),
        "recent_transactions": transactions
    }

@router.post("/coins/update")
async def update_coins(coin_data: CoinUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    transaction_id = f"tx_{datetime.now(timezone.utc).timestamp()}"
    transaction_doc = {
        "id": transaction_id,
        "user_id": user_id,
        "amount": coin_data.amount,
        "transaction_type": coin_data.transaction_type,
        "description": coin_data.description,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.coin_transactions.insert_one(transaction_doc)
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"coins": coin_data.amount}}
    )
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    return {
        "success": True,
        "new_balance": updated_user.get("coins", 0),
        "transaction": transaction_doc
    }

@router.get("/stats", response_model=UserStats)
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    streak_data = await db.streaks.find_one({"user_id": user_id}, {"_id": 0})
    achievements = await db.user_achievements.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    total_xp = user.get("total_xp", 0)
    level = calculate_level(total_xp)
    
    return UserStats(
        user_id=user_id,
        total_xp=total_xp,
        level=level,
        coins=user.get("coins", 0),
        total_study_hours=user.get("total_study_hours", 0),
        current_streak=streak_data.get("current_streak", 0) if streak_data else 0,
        longest_streak=streak_data.get("longest_streak", 0) if streak_data else 0,
        achievements_unlocked=len(achievements)
    )

@router.get("/streak")
async def get_streak(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    streak_data = await db.streaks.find_one({"user_id": user_id}, {"_id": 0})
    
    if not streak_data:
        return {"current_streak": 0, "longest_streak": 0}
    
    return streak_data

@router.post("/streak/update")
async def update_streak(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    today = datetime.now(timezone.utc).date().isoformat()
    
    streak_data = await db.streaks.find_one({"user_id": user_id}, {"_id": 0})
    
    if not streak_data:
        new_streak = {
            "user_id": user_id,
            "current_streak": 1,
            "longest_streak": 1,
            "last_study_date": today
        }
        await db.streaks.insert_one(new_streak)
        return {"current_streak": 1, "longest_streak": 1}
    
    last_date = streak_data.get("last_study_date")
    if last_date == today:
        return {"current_streak": streak_data["current_streak"], "message": "Already logged today"}
    
    yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    
    if last_date == yesterday:
        new_streak_count = streak_data["current_streak"] + 1
    else:
        new_streak_count = 1
    
    longest_streak = max(new_streak_count, streak_data.get("longest_streak", 0))
    
    await db.streaks.update_one(
        {"user_id": user_id},
        {"$set": {
            "current_streak": new_streak_count,
            "longest_streak": longest_streak,
            "last_study_date": today
        }}
    )
    
    return {"current_streak": new_streak_count, "longest_streak": longest_streak}

@router.get("/achievements", response_model=List[UserAchievement])
async def get_user_achievements(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    achievements = await db.user_achievements.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    for achievement in achievements:
        achievement_details = await db.achievements.find_one(
            {"id": achievement["achievement_id"]}, {"_id": 0}
        )
        if achievement_details:
            achievement["details"] = achievement_details
    
    return achievements

@router.get("/leaderboard")
async def get_leaderboard(metric: str = "coins", limit: int = 10):
    db = get_db()
    
    valid_metrics = ["coins", "total_study_hours", "total_xp"]
    if metric not in valid_metrics:
        metric = "coins"
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort(metric, -1).limit(limit).to_list(limit)
    
    leaderboard = []
    for idx, user in enumerate(users):
        leaderboard.append({
            "rank": idx + 1,
            "name": user.get("name"),
            "value": user.get(metric, 0),
            "metric": metric
        })
    
    return leaderboard

def calculate_level(xp: int) -> int:
    """Calculate user level based on XP"""
    return min(int((xp / 100) ** 0.5) + 1, 100)

def calculate_xp_for_next_level(current_level: int) -> int:
    """Calculate XP needed for next level"""
    return ((current_level) ** 2) * 100
