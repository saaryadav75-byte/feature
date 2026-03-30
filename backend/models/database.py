import os
from typing import Optional
import logging
from supabase import create_client, Client

logger = logging.getLogger(__name__)

class Database:
    client: Optional[Client] = None
    connection_failed: bool = False

def get_database() -> Database:
    return Database()

async def connect_to_supabase():
    """Connect to Supabase using REST API (works in restricted networks)"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    supabase_url = os.getenv("SUPABASE_URL", "https://nrjzujhlunngmfbtzfjg.supabase.co")
    supabase_key = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_5TeVPmJbGluCVU0oqLnrXg_j749jQan")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")

    try:
        Database.client = create_client(supabase_url, supabase_key)
        Database.connection_failed = False
        logger.info("✅ Connected to Supabase via REST API")
        return Database.client
    except Exception as e:
        Database.connection_failed = True
        if environment == "development":
            logger.warning(f"⚠️  Error connecting to Supabase: {e}")
            logger.warning("💡 Running in development mode. API will work with mock data.")
        else:
            logger.error(f"❌ Failed to connect to Supabase: {e}")
            raise
        return None

async def close_supabase_connection():
    """Close Supabase connection"""
    if Database.client:
        try:
            logger.info("Closed Supabase connection")
        except Exception as e:
            logger.error(f"Error closing connection: {e}")

def get_supabase_client() -> Optional[Client]:
    """Get Supabase client instance"""
    if not Database.client and not Database.connection_failed:
        import asyncio
        asyncio.run(connect_to_supabase())
    return Database.client

def get_db():
    """Get Supabase client (for backwards compatibility)"""
    return get_supabase_client()

def is_db_connected() -> bool:
    """Check if database is connected"""
    return Database.client is not None and not Database.connection_failed
