from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List
from schemas.food import FoodItem, FoodItemCreate, Order, OrderCreate, OrderItem
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/food-items", tags=["food"])

@router.get("", response_model=List[FoodItem])
async def get_food_items(current_user: dict = Depends(get_current_user)):
    db = get_db()
    items = await db.food_items.find({}, {"_id": 0}).to_list(100)
    return [FoodItem(**item) for item in items]

@router.post("", response_model=FoodItem)
async def create_food_item(item_data: FoodItemCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can create food items")
    
    db = get_db()
    item_id = f"food_{datetime.now(timezone.utc).timestamp()}"
    
    item_doc = {
        "id": item_id,
        "name": item_data.name,
        "category": item_data.category,
        "price": item_data.price,
        "image": item_data.image,
        "nutrition_score": item_data.nutrition_score,
        "description": item_data.description
    }
    
    await db.food_items.insert_one(item_doc)
    return FoodItem(**item_doc)

@router.get("/recommend")
async def recommend_food(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hour = datetime.now(timezone.utc).hour
    
    if 6 <= hour < 12:
        category = "breakfast"
    elif 12 <= hour < 16:
        category = "lunch"
    elif 16 <= hour < 20:
        category = "snack"
    else:
        category = "dinner"
    
    items = await db.food_items.find({"category": category}, {"_id": 0}).to_list(3)
    
    if not items:
        items = await db.food_items.find({}, {"_id": 0}).limit(3).to_list(3)
    
    return {"recommended": items, "reason": f"Perfect for {category} time!"}

router_orders = APIRouter(prefix="/orders", tags=["orders"])

@router_orders.post("", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"id": current_user['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total = sum(item.price * item.quantity for item in order_data.items)
    
    study_hours = user.get('total_study_hours', 0)
    if study_hours >= 10:
        discount_percent = 20
    elif study_hours >= 5:
        discount_percent = 15
    elif study_hours >= 2:
        discount_percent = 10
    else:
        discount_percent = 5
    
    discount = total * (discount_percent / 100)
    final_price = total - discount
    
    order_id = f"order_{datetime.now(timezone.utc).timestamp()}"
    
    order_doc = {
        "id": order_id,
        "user_id": current_user['user_id'],
        "items": [item.model_dump() for item in order_data.items],
        "total": total,
        "discount": discount,
        "final_price": final_price,
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    return Order(**order_doc)

@router_orders.get("/my-orders", response_model=List[Order])
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    db = get_db()
    orders = await db.orders.find({"user_id": current_user['user_id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [Order(**order) for order in orders]
