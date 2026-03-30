from models.database import get_supabase_client
from utils.auth import hash_password
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

async def seed_demo_users():
    """Seed demo user accounts for testing"""
    client = get_supabase_client()
    if not client:
        logger.warning("Cannot seed database: Supabase client not available")
        return

    try:
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
            existing_response = client.table('users').select('id').eq('email', user["email"]).execute()
            if not existing_response.data:
                client.table('users').insert(user).execute()
                logger.info(f"Created demo user: {user['email']}")
            else:
                logger.info(f"Demo user already exists: {user['email']}")
    except Exception as e:
        logger.error(f"Error seeding demo users: {e}")
        raise

async def seed_food_items():
    """Seed food items for the catalog - placeholder for future implementation"""
    logger.info("Food seeding not implemented for Supabase yet")
    pass

async def seed_sample_courses():
    """Seed sample courses with lessons - placeholder for future implementation"""
    logger.info("Course seeding not implemented for Supabase yet")
    pass

async def seed_achievements():
    """Seed achievement definitions - placeholder for future implementation"""
    logger.info("Achievement seeding not implemented for Supabase yet")
    pass

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
