from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List
from schemas.checkout import CheckoutRequest, OrderHistoryItem
from schemas.food import Order, OrderItem
from utils.auth import get_current_user
from models.database import get_db

router = APIRouter(prefix="/checkout", tags=["checkout"])

@router.post("/process", response_model=Order)
async def process_checkout(checkout_data: CheckoutRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total = checkout_data.total
    
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
    
    coins_used = checkout_data.payment_method.coins_used
    
    if checkout_data.payment_method.type == "coins":
        if user.get("coins", 0) < coins_used:
            raise HTTPException(status_code=400, detail="Insufficient coins")
        
        final_price -= coins_used
        
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"coins": -coins_used}}
        )
    
    order_id = f"order_{datetime.now(timezone.utc).timestamp()}"
    
    order_doc = {
        "id": order_id,
        "user_id": user_id,
        "items": checkout_data.items,
        "total": total,
        "discount": discount,
        "final_price": max(final_price, 0),
        "payment_method": checkout_data.payment_method.type,
        "coins_used": coins_used,
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    return Order(**order_doc)

@router.get("/orders/history", response_model=List[OrderHistoryItem])
async def get_order_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user['user_id']
    
    orders = await db.orders.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return [OrderHistoryItem(**order) for order in orders]

@router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, current_user: dict = Depends(get_current_user)):
    """Remove item from cart (frontend handles cart state)"""
    return {"message": "Item removed from cart", "item_id": item_id}
