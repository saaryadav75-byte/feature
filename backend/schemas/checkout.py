from pydantic import BaseModel
from typing import List, Optional

class PaymentMethod(BaseModel):
    type: str
    coins_used: int = 0
    card_last4: Optional[str] = None

class CheckoutRequest(BaseModel):
    items: List[dict]
    payment_method: PaymentMethod
    total: float

class OrderHistoryItem(BaseModel):
    id: str
    user_id: str
    items: List[dict]
    total: float
    discount: float
    final_price: float
    payment_method: str
    coins_used: int
    status: str
    created_at: str
