from datetime import date, timedelta
from typing import List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from app.ai import generate_coach_summary

from app.db import supabase
from app.schemas import (
    HealthLogCreate, HealthLog,
    MealLogCreate, MealLog,
)


app = FastAPI(title="MyHealthMate API")

# Allow frontend (Next.js on port 3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthLogCreate(BaseModel):
    log_date: date
    sleep_hours: float
    water_glasses: int
    mood_score: int
    steps: int
    weight: float
    notes: str | None = None
    user_id: str  # NEW

class MealLogCreate(BaseModel):
    log_date: date
    meal_type: str
    meal_name: str
    calories: float | None = None
    protein_grams: float | None = None
    carbs_grams: float | None = None
    fat_grams: float | None = None
    notes: str | None = None
    user_id: str  # NEW


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "MyHealthMate backend is running 🚀"}

@app.post("/debug/add-health-log")
def debug_add_health_log():
    """
    Temporary test endpoint to check Supabase connection.
    Inserts a dummy health log row for user 'test-user-1'.
    """
    payload = {
        "user_id": "test-user-1",
        "log_date": date.today().isoformat(),
        "sleep_hours": 7.5,
        "water_glasses": 8,
        "steps": 8000,
        "mood_score": 4,
        "weight": 70.5,
        "notes": "Test log from FastAPI",
    }

    result = (
        supabase.table("health_logs")
        .insert(payload)
        .execute()
    )

    return {"inserted": result.data}

@app.post("/health-logs", response_model=HealthLog)
def create_health_log(payload: HealthLogCreate):
    user_id = payload.user_id  # from frontend
    date_str = payload.log_date.isoformat()

    result = (
        supabase.table("health_logs")
        .insert(
            {
                "user_id": user_id,
                "log_date": date_str,
                "sleep_hours": payload.sleep_hours,
                "water_glasses": payload.water_glasses,
                "mood_score": payload.mood_score,
                "steps": payload.steps,
                "weight": payload.weight,
                "notes": payload.notes,
            }
        )
        .execute()
    )

    return result.data[0]


@app.get("/health-logs/today", response_model=List[HealthLog])
def get_today_health_logs():
    user_id = "test-user-1"
    today_str = date.today().isoformat()

    result = (
        supabase.table("health_logs")
        .select("*")
        .eq("user_id", user_id)
        .eq("log_date", today_str)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []

@app.get("/health-logs/week", response_model=List[HealthLog])
def get_week_health_logs():
    user_id = "test-user-1"
    today = date.today()
    start_date = (today - timedelta(days=6)).isoformat()
    end_date = today.isoformat()

    result = (
        supabase.table("health_logs")
        .select("*")
        .eq("user_id", user_id)
        .gte("log_date", start_date)
        .lte("log_date", end_date)
        .order("log_date")
        .execute()
    )

    return result.data or []

@app.get("/health-logs/all", response_model=List[HealthLog])
def get_all_health_logs():
    user_id = "test-user-1"

    result = (
        supabase.table("health_logs")
        .select("*")
        .eq("user_id", user_id)
        .order("log_date", desc=True)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []

@app.get("/health-logs/by-date", response_model=List[HealthLog])
def get_health_logs_by_date(
    log_date: date = Query(..., description="YYYY-MM-DD"),
    user_id: str = Query(..., description="Appwrite user id"),
):
    date_str = log_date.isoformat()

    result = (
        supabase.table("health_logs")
        .select("*")
        .eq("user_id", user_id)
        .eq("log_date", date_str)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []




@app.post("/meal-logs", response_model=MealLog)
def create_meal_log(payload: MealLogCreate):
    user_id = payload.user_id  # NEW
    date_str = payload.log_date.isoformat()

    result = (
        supabase.table("meal_logs")
        .insert(
            {
                "user_id": user_id,
                "log_date": date_str,
                "meal_type": payload.meal_type,
                "meal_name": payload.meal_name,
                "calories": payload.calories,
                "protein_grams": payload.protein_grams,
                "carbs_grams": payload.carbs_grams,
                "fat_grams": payload.fat_grams,
                "notes": payload.notes,
            }
        )
        .execute()
    )

    return result.data[0]


@app.get("/meal-logs/today", response_model=List[MealLog])
def get_today_meals():
    user_id = "test-user-1"
    today_str = date.today().isoformat()

    result = (
        supabase.table("meal_logs")
        .select("*")
        .eq("user_id", user_id)
        .eq("log_date", today_str)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []

@app.get("/meal-logs/week", response_model=List[MealLog])
def get_week_meals():
    user_id = "test-user-1"
    today = date.today()
    start_date = (today - timedelta(days=6)).isoformat()
    end_date = today.isoformat()

    result = (
        supabase.table("meal_logs")
        .select("*")
        .eq("user_id", user_id)
        .gte("log_date", start_date)
        .lte("log_date", end_date)
        .order("log_date")
        .execute()
    )

    return result.data or []

@app.get("/meal-logs/by-date", response_model=List[MealLog])
def get_meals_by_date(
    log_date: date = Query(..., description="YYYY-MM-DD"),
    user_id: str = Query(..., description="Appwrite user id"),
):
    date_str = log_date.isoformat()

    result = (
        supabase.table("meal_logs")
        .select("*")
        .eq("user_id", user_id)
        .eq("log_date", date_str)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []


@app.get("/coach/summary")
def get_coach_summary(
    user_id: str = Query(..., description="Appwrite user id"),
):
    today = date.today()
    start_date = (today - timedelta(days=6)).isoformat()
    end_date = today.isoformat()

    health_result = (
        supabase.table("health_logs")
        .select("*")
        .eq("user_id", user_id)
        .gte("log_date", start_date)
        .lte("log_date", end_date)
        .order("log_date")
        .execute()
    )
    health_logs = health_result.data or []

    meal_result = (
        supabase.table("meal_logs")
        .select("*")
        .eq("user_id", user_id)
        .gte("log_date", start_date)
        .lte("log_date", end_date)
        .order("log_date")
        .execute()
    )
    meal_logs = meal_result.data or []

    summary = generate_coach_summary(health_logs, meal_logs)

    return {
        "health_logs_count": len(health_logs),
        "meal_logs_count": len(meal_logs),
        "summary": summary,
    }


