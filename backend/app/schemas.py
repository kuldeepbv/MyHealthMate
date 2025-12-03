from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class HealthLogCreate(BaseModel):
    log_date: date
    sleep_hours: Optional[float] = None
    water_glasses: Optional[int] = None
    steps: Optional[int] = None
    mood_score: Optional[int] = Field(default=None, ge=1, le=5)
    weight: Optional[float] = None
    notes: Optional[str] = None


class HealthLog(BaseModel):
    id: str
    user_id: str
    log_date: date
    sleep_hours: Optional[float] = None
    water_glasses: Optional[int] = None
    steps: Optional[int] = None
    mood_score: Optional[int] = None
    weight: Optional[float] = None
    notes: Optional[str] = None

# ---- Meal logs ----

class MealLogCreate(BaseModel):
    log_date: date
    meal_type: str  # "breakfast" | "lunch" | "dinner" | "snack"
    meal_name: str
    calories: Optional[int] = None
    protein_grams: Optional[float] = None
    carbs_grams: Optional[float] = None
    fat_grams: Optional[float] = None
    notes: Optional[str] = None


class MealLog(BaseModel):
    id: str
    user_id: str
    log_date: date
    meal_type: str
    meal_name: str
    calories: Optional[int] = None
    protein_grams: Optional[float] = None
    carbs_grams: Optional[float] = None
    fat_grams: Optional[float] = None
    notes: Optional[str] = None

