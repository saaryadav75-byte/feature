from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from schemas.user import UserCreate, UserLogin, User, TokenResponse
from utils.auth import create_token, hash_password, verify_password, get_current_user
from models.database import get_supabase_client

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        # Check if user already exists
        existing_response = client.table('users').select('id').eq('email', user_data.email).execute()
        if existing_response.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create new user
        hashed = hash_password(user_data.password)
        user_id = f"user_{datetime.now(timezone.utc).timestamp()}"

        user_insert = {
            'id': user_id,
            'email': user_data.email,
            'password': hashed,
            'name': user_data.name,
            'role': user_data.role,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'coins': 0,
            'total_study_hours': 0.0,
            'total_xp': 0
        }
        client.table('users').insert(user_insert).execute()

        token = create_token(user_id, user_data.email, user_data.role)

        # Return user without password
        user_response = {k: v for k, v in user_insert.items() if k != 'password'}
        return TokenResponse(
            token=token,
            user=User(**user_response)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        user_response = client.table('users').select('*').eq('email', credentials.email).execute()
        if not user_response.data:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        user = user_response.data[0]
        
        if not verify_password(credentials.password, user['password']):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        token = create_token(user['id'], user['email'], user['role'])

        user_data = {k: v for k, v in user.items() if k != 'password'}
        return TokenResponse(
            token=token,
            user=User(**user_data)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging in: {str(e)}")

@router.get("/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        user_response = client.table('users').select('id,email,name,role,created_at,coins,total_study_hours,total_xp').eq('id', current_user['user_id']).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return User(**user_response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")
