from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Authenticate user with email/password or Google OAuth."""
    # Demo implementation - in production, implement proper authentication
    return AuthResponse(
        access_token="demo_token",
        token_type="bearer",
        user={
            "id": 1,
            "email": request.email,
            "name": "Demo User"
        }
    )

@router.get("/google/login")
async def google_login():
    """Initiate Google OAuth flow."""
    return {"auth_url": "https://accounts.google.com/oauth/authorize?..."}

@router.post("/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback."""
    return {"message": "Google authentication successful"}

@router.get("/me")
async def get_current_user():
    """Get current authenticated user."""
    return {
        "id": 1,
        "email": "demo@example.com",
        "name": "Demo User",
        "google_connected": False
    }