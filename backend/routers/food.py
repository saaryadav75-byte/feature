from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List
from schemas.food import FoodItem, FoodItemCreate, Order, OrderCreate, OrderItem
from utils.auth import get_current_user
from models.database import get_supabase_client
import json

router = APIRouter(prefix="/food-items", tags=["food"])

@router.get("", response_model=List[FoodItem])
async def get_food_items(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []
    
    try:
        response = client.table('food_items').select('*').order('name').execute()
        return [FoodItem(**row) for row in response.data]
    except Exception as e:
        if 'Could not find the table' in str(e):
            return []
        raise HTTPException(status_code=500, detail=f"Error fetching food items: {str(e)}")

@router.post("", response_model=FoodItem)
async def create_food_item(item_data: FoodItemCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can create food items")

    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        item_id = f"food_{datetime.now(timezone.utc).timestamp()}"

        item_insert = {
            'id': item_id,
            'name': item_data.name,
            'category': item_data.category,
            'price': item_data.price,
            'image': item_data.image,
            'nutrition_score': item_data.nutrition_score,
            'description': item_data.description
        }
        client.table('food_items').insert(item_insert).execute()

        return FoodItem(**item_insert)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating food item: {str(e)}")

@router.get("/recommend")
async def recommend_food(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return {"recommended": [], "reason": "Database unavailable"}

    try:
        hour = datetime.now(timezone.utc).hour

        if 6 <= hour < 12:
            category = "breakfast"
        elif 12 <= hour < 16:
            category = "lunch"
        elif 16 <= hour < 20:
            category = "snack"
        else:
            category = "dinner"

        food_response = client.table('food_items').select('*').eq('category', category).limit(3).execute()
        items = food_response.data if food_response.data else []

        if not items:
            all_items_response = client.table('food_items').select('*').limit(3).execute()
            items = all_items_response.data if all_items_response.data else []

        return {"recommended": items, "reason": f"Perfect for {category} time!"}
    except Exception as e:
        if 'Could not find the table' in str(e):
            return {"recommended": [], "reason": "Food catalog not available"}
        raise HTTPException(status_code=500, detail=f"Error recommending food: {str(e)}")

router_orders = APIRouter(prefix="/orders", tags=["orders"])

@router_orders.post("", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        # Get user study hours for discount calculation
        user_response = client.table('users').select('total_study_hours').eq('id', current_user['user_id']).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_response.data[0]
        total = sum(item.price * item.quantity for item in order_data.items)

        study_hours = user_data.get('total_study_hours') or 0
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

        order_insert = {
            'id': order_id,
            'user_id': current_user['user_id'],
            'items': [item.model_dump() for item in order_data.items],
            'total': total,
            'discount': discount,
            'final_price': final_price,
            'status': 'confirmed',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        client.table('orders').insert(order_insert).execute()

        return Order(**order_insert)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")

@router_orders.get("/my-orders", response_model=List[Order])
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []

    try:
        response = client.table('orders').select('*').eq('user_id', current_user['user_id']).order('created_at', desc=True).execute()

        orders = []
        for row in response.data:
            orders.append(Order(
                id=row['id'],
                user_id=row['user_id'],
                items=row['items'] if isinstance(row['items'], list) else [],
                total=row['total'],
                discount=row['discount'],
                final_price=row['final_price'],
                status=row['status'],
                created_at=row['created_at']
            ))

        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")
