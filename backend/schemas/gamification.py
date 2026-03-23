from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class CoinTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    amount: int
    transaction_type: str
    description: str
    created_at: str

class CoinUpdate(BaseModel):
    amount: int
    transaction_type: str
    description: str

class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    icon: str
    coins_reward: int
    requirement_type: str
    requirement_value: float

class UserAchievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    achievement_id: str
    unlocked_at: str

class Streak(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    current_streak: int
    longest_streak: int
    last_study_date: str

class UserStats(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    total_xp: int = 0
    level: int = 1
    coins: int = 0
    total_study_hours: float = 0
    current_streak: int = 0
    longest_streak: int = 0
    achievements_unlocked: int = 0
