from motor.motor_asyncio import AsyncIOMotorClient
import os

class Database:
    client: AsyncIOMotorClient = None
    db = None

def get_database() -> Database:
    return Database()

async def connect_to_mongo():
    mongo_url = os.environ['MONGO_URL']
    Database.client = AsyncIOMotorClient(mongo_url)
    Database.db = Database.client[os.environ['DB_NAME']]
    print("Connected to MongoDB")

async def close_mongo_connection():
    Database.client.close()
    print("Closed MongoDB connection")

def get_db():
    return Database.db
