from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from typing import List
from schemas.checkout import CheckoutRequest, OrderHistoryItem
from schemas.food import Order, OrderItem
from utils.auth import get_current_user
from models.database import get_supabase_client
import json

router = APIRouter(prefix="/checkout", tags=["checkout"])

@router.post("/process", response_model=Order)
async def process_checkout(checkout_data: CheckoutRequest, current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    try:
        user_id = current_user['user_id']

        # Get user data
        user_response = client.table('users').select('total_study_hours,coins').eq('id', user_id).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_response.data[0]
        total = checkout_data.total

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

        coins_used = checkout_data.payment_method.coins_used

        if checkout_data.payment_method.type == "coins":
            if (user_data.get('coins') or 0) < coins_used:
                raise HTTPException(status_code=400, detail="Insufficient coins")

            final_price -= coins_used

            # Deduct coins from user
            new_coins = (user_data.get('coins') or 0) - coins_used
            client.table('users').update({'coins': new_coins}).eq('id', user_id).execute()

        order_id = f"order_{datetime.now(timezone.utc).timestamp()}"

        order_insert = {
            'id': order_id,
            'user_id': user_id,
            'items': checkout_data.items,
            'total': total,
            'discount': discount,
            'final_price': max(final_price, 0),
            'status': 'confirmed',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        client.table('orders').insert(order_insert).execute()

        return Order(**order_insert)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing checkout: {str(e)}")

@router.get("/orders/history", response_model=List[OrderHistoryItem])
async def get_order_history(current_user: dict = Depends(get_current_user)):
    client = get_supabase_client()
    if not client:
        return []

    try:
        user_id = current_user['user_id']

        response = client.table('orders').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(50).execute()

        orders = []
        for row in response.data:
            orders.append(OrderHistoryItem(
                id=row['id'],
                user_id=row['user_id'],
                items=row['items'] if isinstance(row['items'], list) else [],
                total=row['total'],
                discount=row['discount'],
                final_price=row['final_price'],
                status=row['status'],
                created_at=row['created_at'].isoformat() if row['created_at'] else None
            ))

        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching order history: {str(e)}")

@router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, current_user: dict = Depends(get_current_user)):
    """Remove item from cart (frontend handles cart state)"""
    return {"message": "Item removed from cart", "item_id": item_id}
