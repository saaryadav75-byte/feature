from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from pathlib import Path

from models.database import connect_to_mongo, close_mongo_connection
from routers import auth, courses, lessons, progress, focus_sessions, food, dashboard
from utils.seed import seed_database

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Smart Adaptive Learning Platform", version="2.0")

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(lessons.router)
api_router.include_router(progress.router)
api_router.include_router(focus_sessions.router)
api_router.include_router(food.router)
api_router.include_router(food.router_orders)
api_router.include_router(dashboard.router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    await seed_database()
    logging.info("Application started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    logging.info("Application shutdown complete")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {"message": "Smart Adaptive Learning Platform API", "version": "2.0"}
