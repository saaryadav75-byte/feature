from models.database import get_db
from utils.auth import hash_password
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

async def seed_demo_users():
    """Seed demo user accounts for testing"""
    db = get_db()
    
    demo_users = [
        {
            "id": "user_demo_student",
            "email": "student@test.com",
            "password": hash_password("password123"),
            "name": "Demo Student",
            "role": "student",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "coins": 50,
            "total_study_hours": 3.5,
            "total_xp": 150
        },
        {
            "id": "user_demo_instructor",
            "email": "instructor@test.com",
            "password": hash_password("password123"),
            "name": "Demo Instructor",
            "role": "instructor",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "coins": 100,
            "total_study_hours": 20.0,
            "total_xp": 500
        }
    ]
    
    for user in demo_users:
        existing = await db.users.find_one({"email": user["email"]}, {"_id": 0})
        if not existing:
            await db.users.insert_one(user)
            logger.info(f"Created demo user: {user['email']}")
        else:
            logger.info(f"Demo user already exists: {user['email']}")

async def seed_food_items():
    """Seed food items for the catalog"""
    db = get_db()
    
    food_items = [
        {
            "id": "food_energy_smoothie",
            "name": "Energy Smoothie Bowl",
            "category": "breakfast",
            "price": 8.99,
            "image": "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg",
            "nutrition_score": 9,
            "description": "Packed with fruits, nuts, and energy-boosting ingredients"
        },
        {
            "id": "food_brain_salad",
            "name": "Brain Food Salad",
            "category": "lunch",
            "price": 12.50,
            "image": "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
            "nutrition_score": 10,
            "description": "Fresh greens with omega-3 rich salmon and walnuts"
        },
        {
            "id": "food_mixed_nuts",
            "name": "Mixed Nuts & Berries",
            "category": "snack",
            "price": 5.99,
            "image": "https://images.pexels.com/photos/6928273/pexels-photo-6928273.jpeg",
            "nutrition_score": 8,
            "description": "Perfect study snack for sustained energy"
        },
        {
            "id": "food_protein_bowl",
            "name": "Protein Power Bowl",
            "category": "lunch",
            "price": 14.99,
            "image": "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg",
            "nutrition_score": 9,
            "description": "Quinoa, grilled chicken, and fresh vegetables"
        },
        {
            "id": "food_green_juice",
            "name": "Green Energy Juice",
            "category": "snack",
            "price": 6.50,
            "image": "https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg",
            "nutrition_score": 8,
            "description": "Refreshing blend of greens and fruits"
        },
        {
            "id": "food_mediterranean_wrap",
            "name": "Mediterranean Wrap",
            "category": "dinner",
            "price": 11.99,
            "image": "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg",
            "nutrition_score": 9,
            "description": "Healthy wrap with hummus and grilled vegetables"
        },
        {
            "id": "food_breakfast_burrito",
            "name": "Breakfast Burrito",
            "category": "breakfast",
            "price": 9.99,
            "image": "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg",
            "nutrition_score": 7,
            "description": "Eggs, cheese, and vegetables wrapped in a tortilla"
        },
        {
            "id": "food_dark_chocolate",
            "name": "Dark Chocolate Bar",
            "category": "snack",
            "price": 4.50,
            "image": "https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg",
            "nutrition_score": 6,
            "description": "70% cacao for brain function and mood"
        }
    ]
    
    for item in food_items:
        existing = await db.food_items.find_one({"id": item["id"]}, {"_id": 0})
        if not existing:
            await db.food_items.insert_one(item)
            logger.info(f"Created food item: {item['name']}")
        else:
            logger.info(f"Food item already exists: {item['name']}")

async def seed_sample_courses():
    """Seed sample courses with lessons"""
    db = get_db()
    
    instructor_user = await db.users.find_one({"email": "instructor@test.com"}, {"_id": 0})
    if not instructor_user:
        logger.warning("Instructor user not found, skipping course seeding")
        return
    
    courses = [
        {
            "id": "course_intro_ml",
            "title": "Introduction to Machine Learning",
            "description": "Learn the fundamentals of machine learning, including supervised and unsupervised learning algorithms, neural networks, and practical applications.",
            "instructor_id": instructor_user["id"],
            "instructor_name": instructor_user["name"],
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "students_enrolled": 0
        },
        {
            "id": "course_web_dev",
            "title": "Full Stack Web Development",
            "description": "Master modern web development with React, FastAPI, and MongoDB. Build complete full-stack applications from scratch.",
            "instructor_id": instructor_user["id"],
            "instructor_name": instructor_user["name"],
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "students_enrolled": 0
        },
        {
            "id": "course_data_science",
            "title": "Data Science Fundamentals",
            "description": "Explore data analysis, visualization, and statistical modeling using Python, pandas, and scikit-learn.",
            "instructor_id": instructor_user["id"],
            "instructor_name": instructor_user["name"],
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "students_enrolled": 0
        }
    ]
    
    for course in courses:
        existing = await db.courses.find_one({"id": course["id"]}, {"_id": 0})
        if not existing:
            await db.courses.insert_one(course)
            logger.info(f"Created course: {course['title']}")
            
            if course["id"] == "course_intro_ml":
                lessons = [
                    {
                        "id": f"lesson_{course['id']}_1",
                        "course_id": course["id"],
                        "title": "What is Machine Learning?",
                        "content": "Machine learning is a branch of artificial intelligence that enables computers to learn from data without being explicitly programmed. In this lesson, we'll explore the basic concepts and applications of ML.",
                        "video_url": None,
                        "order": 1,
                        "duration_minutes": 30
                    },
                    {
                        "id": f"lesson_{course['id']}_2",
                        "course_id": course["id"],
                        "title": "Supervised vs Unsupervised Learning",
                        "content": "Learn the difference between supervised learning (where we have labeled data) and unsupervised learning (where we discover patterns in unlabeled data). We'll cover examples of each type and when to use them.",
                        "video_url": None,
                        "order": 2,
                        "duration_minutes": 45
                    },
                    {
                        "id": f"lesson_{course['id']}_3",
                        "course_id": course["id"],
                        "title": "Neural Networks Basics",
                        "content": "An introduction to artificial neural networks, inspired by the human brain. We'll understand neurons, layers, activation functions, and how networks learn through backpropagation.",
                        "video_url": None,
                        "order": 3,
                        "duration_minutes": 60
                    }
                ]
                
                for lesson in lessons:
                    existing_lesson = await db.lessons.find_one({"id": lesson["id"]}, {"_id": 0})
                    if not existing_lesson:
                        await db.lessons.insert_one(lesson)
                        logger.info(f"Created lesson: {lesson['title']}")
        else:
            logger.info(f"Course already exists: {course['title']}")

async def seed_database():
    """Main seeding function to populate the database with initial data"""
    logger.info("Starting database seeding...")
    
    try:
        await seed_demo_users()
        await seed_food_items()
        await seed_sample_courses()
        await seed_achievements()
        logger.info("Database seeding completed successfully")
    except Exception as e:
        logger.error(f"Error during database seeding: {e}")
        raise

async def seed_achievements():
    """Seed achievement definitions"""
    db = get_db()
    
    achievements = [
        {
            "id": "ach_first_hour",
            "name": "First Hour",
            "description": "Complete 1 hour of study",
            "icon": "⏰",
            "coins_reward": 10,
            "requirement_type": "study_hours",
            "requirement_value": 1.0
        },
        {
            "id": "ach_early_bird",
            "name": "Early Bird",
            "description": "Complete 5 focus sessions",
            "icon": "🌅",
            "coins_reward": 25,
            "requirement_type": "sessions",
            "requirement_value": 5
        },
        {
            "id": "ach_streak_master",
            "name": "Streak Master",
            "description": "Maintain a 7-day study streak",
            "icon": "🔥",
            "coins_reward": 50,
            "requirement_type": "streak",
            "requirement_value": 7
        },
        {
            "id": "ach_course_complete",
            "name": "Course Completer",
            "description": "Complete your first course",
            "icon": "🎓",
            "coins_reward": 100,
            "requirement_type": "courses_completed",
            "requirement_value": 1
        }
    ]
    
    for achievement in achievements:
        existing = await db.achievements.find_one({"id": achievement["id"]}, {"_id": 0})
        if not existing:
            await db.achievements.insert_one(achievement)
            logger.info(f"Created achievement: {achievement['name']}")
        else:
            logger.info(f"Achievement already exists: {achievement['name']}")
