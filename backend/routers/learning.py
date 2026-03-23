from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
from typing import List
from schemas.learning import Quiz, QuizSubmission, QuizResult, LessonBookmark, VideoProgress
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/learning", tags=["learning"])

@router.post("/quiz/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmission, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    quiz = await db.quizzes.find_one({"id": submission.quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    correct_answers = 0
    total_questions = len(quiz["questions"])
    
    for idx, answer in enumerate(submission.answers):
        if idx < len(quiz["questions"]):
            if answer == quiz["questions"][idx]["correct_answer"]:
                correct_answers += 1
    
    score = (correct_answers / total_questions) * 100
    
    result_id = f"quiz_result_{datetime.now(timezone.utc).timestamp()}"
    result_doc = {
        "id": result_id,
        "user_id": user_id,
        "quiz_id": submission.quiz_id,
        "score": score,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.quiz_results.insert_one(result_doc)
    
    if score >= 70:
        xp_earned = int(total_questions * 5)
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"total_xp": xp_earned, "coins": 10}}
        )
    
    return QuizResult(**result_doc)

@router.post("/bookmarks")
async def add_bookmark(lesson_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    existing = await db.bookmarks.find_one({
        "user_id": user_id,
        "lesson_id": lesson_id
    }, {"_id": 0})
    
    if existing:
        return {"message": "Already bookmarked"}
    
    bookmark_id = f"bookmark_{datetime.now(timezone.utc).timestamp()}"
    bookmark_doc = {
        "id": bookmark_id,
        "user_id": user_id,
        "lesson_id": lesson_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookmarks.insert_one(bookmark_doc)
    return {"message": "Bookmark added", "id": bookmark_id}

@router.delete("/bookmarks/{lesson_id}")
async def remove_bookmark(lesson_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    result = await db.bookmarks.delete_one({
        "user_id": user_id,
        "lesson_id": lesson_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    return {"message": "Bookmark removed"}

@router.get("/bookmarks")
async def get_bookmarks(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    bookmarks = await db.bookmarks.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    for bookmark in bookmarks:
        lesson = await db.lessons.find_one({"id": bookmark["lesson_id"]}, {"_id": 0})
        if lesson:
            bookmark["lesson"] = lesson
    
    return bookmarks

@router.post("/video-progress")
async def save_video_progress(lesson_id: str, progress_seconds: float, duration_seconds: float, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    await db.video_progress.update_one(
        {"user_id": user_id, "lesson_id": lesson_id},
        {"$set": {
            "progress_seconds": progress_seconds,
            "duration_seconds": duration_seconds,
            "last_watched": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Progress saved"}

@router.get("/video-progress/{lesson_id}")
async def get_video_progress(lesson_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    progress = await db.video_progress.find_one(
        {"user_id": user_id, "lesson_id": lesson_id},
        {"_id": 0}
    )
    
    if not progress:
        return {"progress_seconds": 0, "duration_seconds": 0}
    
    return progress
