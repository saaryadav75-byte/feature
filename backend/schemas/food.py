from pydantic import BaseModel, ConfigDict
from typing import List

class FoodItemBase(BaseModel):
    name: str
    category: str
    price: float
    image: str
    nutrition_score: int
    description: str

class FoodItemCreate(FoodItemBase):
    pass

class FoodItem(FoodItemBase):
    model_config = ConfigDict(extra="ignore")
    id: str

class OrderItem(BaseModel):
    food_id: str
    food_name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    items: List[OrderItem]

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    items: List[OrderItem]
    total: float
    discount: float
    final_price: float
    status: str
    created_at: str
