from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from schemas.user import UserCreate, UserLogin, User, TokenResponse
from utils.auth import create_token, hash_password, verify_password
from models.database import get_db

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    db = get_db()
    
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user_data.password)
    user_id = f"user_{datetime.now(timezone.utc).timestamp()}"
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hashed,
        "name": user_data.name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "coins": 0,
        "total_study_hours": 0
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.email, user_data.role)
    
    return TokenResponse(
        token=token,
        user=User(**{k: v for k, v in user_doc.items() if k != 'password'})
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    db = get_db()
    
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], user['role'])
    
    return TokenResponse(
        token=token,
        user=User(**{k: v for k, v in user.items() if k != 'password'})
    )

from utils.auth import get_current_user

@router.get("/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)
