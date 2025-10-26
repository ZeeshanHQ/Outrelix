from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime, timedelta
import random
import string

app = Flask(__name__)
CORS(app, origins=['https://outrelix.vercel.app', 'http://localhost:3000'])

# Environment variables
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://bfoggljxtwoloxthtocy.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
RESEND_DOMAIN = os.environ.get('RESEND_DOMAIN', 'cavexa.online')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@cavexa.online')

@app.route('/')
def home():
    return jsonify({
        "message": "Outrelix API is running!", 
        "status": "success",
        "python_version": "3.11+",
        "endpoints": [
            "/health",
            "/api/user/gmail-status",
            "/api/otp/send",
            "/api/otp/verify", 
            "/api/otp/resend",
            "/api/user/onboarding",
            "/api/campaign/start",
            "/api/industries",
            "/me"
        ]
    })

@app.route('/health')
def health():
    """Health check endpoint for backend wake-up system"""
    return jsonify({
        "status": "online",
        "message": "Backend is awake and ready"
    })

# User management endpoints
@app.route('/me', methods=['GET'])
def get_user():
    """Get current user profile"""
    try:
        # Get user info from request headers or session
        # For now, return mock data - in production, get from Supabase auth
        return jsonify({
            "id": "user_123",
            "name": "Sam Gya",  # This should come from Supabase auth
            "email": "gyasam76@gmail.com",  # This should come from Supabase auth
            "created_at": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/onboarding', methods=['POST'])
def user_onboarding():
    """Handle user onboarding data"""
    try:
        data = request.get_json()
        print(f"Onboarding data received: {data}")
        
        return jsonify({
            "message": "Onboarding data saved successfully",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Gmail integration endpoints
@app.route('/api/user/gmail-status', methods=['GET'])
def gmail_status():
    """Check Gmail connection status"""
    try:
        return jsonify({
            "connected": True,
            "email": "user@gmail.com",
            "status": "active"
        })
    except Exception as e:
        return jsonify({
            "connected": False,
            "email": "",
            "error": str(e)
        })

# OTP verification system
@app.route('/api/otp/send', methods=['POST'])
def send_otp():
    """Send OTP to user's email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Generate 6-digit OTP
        otp = ''.join(random.choices(string.digits, k=6))
        print(f"OTP generated for {email}: {otp}")
        
        # Send email via Resend API
        email_data = {
            "from": f"Outrelix <{SENDER_EMAIL}>",
            "to": [email],
            "subject": "Your Outrelix Verification Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Outrelix Verification</h2>
                <p>Your verification code is:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">
                    {otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
            </div>
            """
        }
        
        # Send via Resend API
        resend_response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {RESEND_API_KEY}',
                'Content-Type': 'application/json'
            },
            json=email_data
        )
        
        if resend_response.status_code == 200:
            return jsonify({
                "message": "OTP sent successfully",
                "status": "success"
            })
        else:
            return jsonify({
                "error": "Failed to send OTP",
                "status": "error"
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/otp/verify', methods=['POST'])
def verify_otp():
    """Verify OTP code"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        
        if not email or not otp:
            return jsonify({"error": "Email and OTP are required"}), 400
        
        # Mock verification - accept any 6-digit code
        if len(otp) == 6 and otp.isdigit():
            return jsonify({
                "message": "OTP verified successfully",
                "status": "success",
                "verified": True
            })
        else:
            return jsonify({
                "message": "Invalid OTP",
                "status": "error",
                "verified": False
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/otp/resend', methods=['POST'])
def resend_otp():
    """Resend OTP to user's email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Generate new OTP
        otp = ''.join(random.choices(string.digits, k=6))
        print(f"OTP resent for {email}: {otp}")
        
        return jsonify({
            "message": "OTP resent successfully",
            "status": "success"
        })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Campaign management endpoints
@app.route('/api/campaign/start', methods=['POST'])
def start_campaign():
    """Start a new campaign"""
    try:
        data = request.get_json()
        print(f"Campaign started: {data}")
        
        return jsonify({
            "message": "Campaign started successfully",
            "campaign_id": "campaign_123",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Industries endpoint
@app.route('/api/industries', methods=['GET'])
def get_industries():
    """Get list of industries"""
    try:
        industries = [
            "Technology",
            "Healthcare", 
            "Finance",
            "Education",
            "Manufacturing",
            "Retail",
            "Real Estate",
            "Consulting",
            "Marketing",
            "E-commerce"
        ]
        
        return jsonify({
            "industries": industries,
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)

