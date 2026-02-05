from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

app = FastAPI(title="Outrelix API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def supabase_request(method, endpoint, data=None):
    """Make direct HTTP request to Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PATCH":
            response = requests.patch(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        response.raise_for_status()
        return response.json() if response.content else {}
    except requests.exceptions.RequestException as e:
        print(f"Supabase request error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Outrelix API is running!", "status": "success"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "outrelix-api"}

@app.post("/api/otp/send")
async def send_otp(request: dict):
    """Send OTP to user email"""
    try:
        email = request.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Generate 6-digit OTP
        import random
        otp_code = str(random.randint(100000, 999999))
        
        # Store OTP in Supabase
        otp_data = {
            "email": email,
            "otp_code": otp_code,
            "expires_at": "2025-01-01T00:00:00Z"  # Simple expiration
        }
        
        result = supabase_request("POST", "otp_verifications", otp_data)
        
        return {
            "success": True,
            "message": "OTP sent successfully",
            "otp_code": otp_code  # For testing - remove in production
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/otp/verify")
async def verify_otp(request: dict):
    """Verify OTP code"""
    try:
        email = request.get("email")
        otp_code = request.get("otp_code")
        
        if not email or not otp_code:
            raise HTTPException(status_code=400, detail="Email and OTP code are required")
        
        # Check OTP in Supabase
        result = supabase_request("GET", f"otp_verifications?email=eq.{email}&otp_code=eq.{otp_code}")
        
        if result and len(result) > 0:
            return {"success": True, "message": "OTP verified successfully"}
        else:
            raise HTTPException(status_code=400, detail="Invalid OTP code")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/otp/resend")
async def resend_otp(request: dict):
    """Resend OTP to user email"""
    try:
        email = request.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Generate new OTP
        import random
        otp_code = str(random.randint(100000, 999999))
        
        # Update OTP in Supabase
        otp_data = {"otp_code": otp_code}
        result = supabase_request("PATCH", f"otp_verifications?email=eq.{email}", otp_data)
        
        return {
            "success": True,
            "message": "OTP resent successfully",
            "otp_code": otp_code  # For testing - remove in production
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
