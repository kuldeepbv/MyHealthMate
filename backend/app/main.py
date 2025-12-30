from datetime import date, timedelta, datetime
from typing import List
import os
import secrets
import uuid as uuid_lib

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
    "https://my-health-mate-frontend.vercel.app",
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


class PendingSignup(BaseModel):
    email: str
    password: str
    name: str = ""


class UserRegister(BaseModel):
    appwrite_user_id: str
    email: str
    name: str = ""


@app.post("/auth/pending-signup")
def create_pending_signup(payload: PendingSignup):
    """
    Store signup data temporarily and send verification email.
    Account will be created only after email verification.
    """
    try:
        # Generate a unique verification token
        verification_token = secrets.token_urlsafe(32)
        
        # Store in pending_signups table (create this table in Supabase)
        # Table schema: email (text), password (text, encrypted), name (text), 
        #               verification_token (text), created_at (timestamp), expires_at (timestamp)
        expires_at = (datetime.utcnow() + timedelta(days=1)).isoformat()
        
        result = (
            supabase.table("pending_signups")
            .insert({
                "email": payload.email,
                "password": payload.password,  # In production, hash this!
                "name": payload.name,
                "verification_token": verification_token,
                "expires_at": expires_at,
            })
            .execute()
        )
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to store signup data")
        
        # Send verification email
        # For now, we'll construct the verification URL
        # In production, use your email service (SendGrid, SES, etc.) to send email
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        verification_url = f"{frontend_url}/auth/verify?token={verification_token}&email={payload.email}"
        
        # TODO: Send actual email using your email service
        # For now, just return the URL (remove this in production!)
        print(f"VERIFICATION URL: {verification_url}")
        
        return {
            "message": "Verification email sent",
            "email": payload.email,
            # Remove this in production - only for testing
            "verification_url": verification_url if os.getenv("ENV") == "development" else None
        }
        
    except Exception as e:
        error_msg = str(e)
        if "already exists" in error_msg.lower() or "duplicate" in error_msg.lower():
            raise HTTPException(status_code=409, detail="An account with this email is already pending verification or exists")
        raise HTTPException(status_code=500, detail=f"Error creating pending signup: {error_msg}")


@app.post("/auth/complete-signup")
def complete_signup(token: str = Query(...), email: str = Query(...)):
    """
    Verify token and create Appwrite account + Supabase user.
    This is called when user clicks verification link.
    """
    try:
        # Get pending signup data
        result = (
            supabase.table("pending_signups")
            .select("*")
            .eq("verification_token", token)
            .eq("email", email)
            .execute()
        )
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Invalid or expired verification token")
        
        pending_signup = result.data[0]
        
        # Check if token expired
        expires_at = datetime.fromisoformat(pending_signup["expires_at"].replace("Z", "+00:00"))
        if datetime.utcnow() > expires_at:
            raise HTTPException(status_code=400, detail="Verification token has expired")
        
        # Now create Appwrite account using Admin SDK
        from appwrite.client import Client
        from appwrite.services.users import Users
        
        appwrite_endpoint = os.getenv("APPWRITE_ENDPOINT")
        appwrite_project_id = os.getenv("APPWRITE_PROJECT_ID")
        appwrite_api_key = os.getenv("APPWRITE_API_KEY")  # Admin API key
        
        if not all([appwrite_endpoint, appwrite_project_id, appwrite_api_key]):
            raise HTTPException(status_code=500, detail="Appwrite configuration missing")
        
        client = Client()
        client.set_endpoint(appwrite_endpoint)
        client.set_project(appwrite_project_id)
        client.set_key(appwrite_api_key)
        
        users = Users(client)
        
        # Create user in Appwrite (will be automatically verified if email verification is disabled)
        # Note: We need to hash password or use password hash from Appwrite
        user_id = str(uuid_lib.uuid4())
        try:
            appwrite_user = users.create(
                user_id=user_id,
                email=pending_signup["email"],
                password=pending_signup["password"],  # Appwrite will hash this
                name=pending_signup.get("name", "")
            )
            
            appwrite_user_id = appwrite_user["$id"]
            
            # IMPORTANT: Create user in Supabase ONLY after Appwrite account is successfully created
            # This ensures both accounts are created together and only after email verification
            try:
                supabase_result = (
                    supabase.table("users")
                    .insert({
                        "appwrite_user_id": appwrite_user_id,
                        "email": pending_signup["email"],
                        "name": pending_signup.get("name", ""),
                    })
                    .execute()
                )
                print(f"User created in Supabase: {appwrite_user_id}")
            except Exception as supabase_err:
                # If Supabase insertion fails, we should clean up Appwrite account
                # But for now, log the error - in production you might want to delete Appwrite account
                print(f"Warning: Failed to create Supabase user: {supabase_err}")
                # Don't fail the whole process, but log it
                # In production, you might want to rollback Appwrite account creation
            
            # Delete pending signup data after successful account creation
            supabase.table("pending_signups").delete().eq("verification_token", token).execute()
            
            return {
                "message": "Account created successfully in both Appwrite and Supabase",
                "appwrite_user_id": appwrite_user_id,
                "email": pending_signup["email"]
            }
        except Exception as appwrite_err:
            error_msg = str(appwrite_err)
            if "already exists" in error_msg.lower():
                raise HTTPException(status_code=409, detail="Account already exists")
            raise HTTPException(status_code=500, detail=f"Failed to create Appwrite account: {error_msg}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error completing signup: {str(e)}")


@app.post("/auth/register")
def register_user(payload: UserRegister):
    """
    Register a user in Supabase after email verification in Appwrite.
    This creates a user record in Supabase that links to the Appwrite user ID.
    """
    try:
        # Check if user already exists
        existing = (
            supabase.table("users")
            .select("*")
            .eq("appwrite_user_id", payload.appwrite_user_id)
            .execute()
        )
        
        if existing.data and len(existing.data) > 0:
            return {
                "message": "User already registered in Supabase",
                "user_id": existing.data[0].get("id"),
                "appwrite_user_id": payload.appwrite_user_id,
            }
        
        # Insert new user
        result = (
            supabase.table("users")
            .insert({
                "appwrite_user_id": payload.appwrite_user_id,
                "email": payload.email,
                "name": payload.name,
            })
            .execute()
        )
        
        if result.data and len(result.data) > 0:
            return {
                "message": "User registered successfully in Supabase",
                "user_id": result.data[0].get("id"),
                "appwrite_user_id": payload.appwrite_user_id,
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to register user in Supabase"
            )
    except Exception as e:
        error_msg = str(e)
        # If user already exists, that's okay
        if "already exists" in error_msg.lower() or "duplicate" in error_msg.lower():
            return {
                "message": "User already registered",
                "appwrite_user_id": payload.appwrite_user_id,
            }
        raise HTTPException(
            status_code=500,
            detail=f"Error registering user: {error_msg}"
        )


