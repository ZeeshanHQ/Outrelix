from flask import Flask, request, jsonify
import os
import requests
import json
from datetime import datetime, timedelta
import random
import string

app = Flask(__name__)

# Environment variables
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://bfoggljxtwoloxthtocy.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
RESEND_DOMAIN = os.environ.get('RESEND_DOMAIN', 'cavexa.online')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@cavexa.online')

# Helper functions for Supabase
def supabase_request(method, endpoint, data=None):
    """Make a request to Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    if method == 'GET':
        response = requests.get(url, headers=headers)
    elif method == 'POST':
        response = requests.post(url, headers=headers, json=data)
    elif method == 'PATCH':
        response = requests.patch(url, headers=headers, json=data)
    elif method == 'DELETE':
        response = requests.delete(url, headers=headers)
    
    return response

def supabase_rpc(function_name, params=None):
    """Call a Supabase RPC function"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/{function_name}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers, json=params or {})
    return response

# Basic endpoints
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
    return jsonify({"status": "healthy"})

# User management endpoints
@app.route('/me', methods=['GET'])
def get_user():
    """Get current user profile"""
    try:
        # This would typically get user from session/token
        # For now, return a mock response
        return jsonify({
            "id": "user_123",
            "name": "Test User",
            "email": "test@example.com",
            "created_at": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/onboarding', methods=['POST'])
def user_onboarding():
    """Handle user onboarding data"""
    try:
        data = request.get_json()
        
        # Store onboarding data in Supabase
        onboarding_data = {
            "user_id": "user_123",  # This would come from auth
            "expect": data.get('expect', ''),
            "goals": data.get('goals', ''),
            "industry": data.get('industry', ''),
            "company_size": data.get('company_size', ''),
            "created_at": datetime.now().isoformat()
        }
        
        # Save to Supabase (mock for now)
        print(f"Onboarding data: {onboarding_data}")
        
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
        # Mock Gmail status - in real implementation, check Google OAuth tokens
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

@app.route('/api/user/gmail-connect', methods=['POST'])
def gmail_connect():
    """Initiate Gmail OAuth connection"""
    try:
        # This would redirect to Google OAuth
        # For now, return a mock response
        return jsonify({
            "message": "Gmail connection initiated",
            "auth_url": "https://accounts.google.com/oauth/authorize?client_id=...",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        
        # Store OTP in Supabase with expiration
        otp_data = {
            "email": email,
            "otp": otp,
            "expires_at": (datetime.now() + timedelta(minutes=10)).isoformat(),
            "created_at": datetime.now().isoformat()
        }
        
        # Save to Supabase (mock for now)
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
                <p>If you didn't request this code, please ignore this email.</p>
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
        
        # Check OTP in Supabase (mock for now)
        # In real implementation, query Supabase for the OTP
        if otp == "123456":  # Mock verification
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
        
        # Send email via Resend API
        email_data = {
            "from": f"Outrelix <{SENDER_EMAIL}>",
            "to": [email],
            "subject": "Your Outrelix Verification Code (Resend)",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Outrelix Verification</h2>
                <p>Your new verification code is:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">
                    {otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
            </div>
            """
        }
        
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
                "message": "OTP resent successfully",
                "status": "success"
            })
        else:
            return jsonify({
                "error": "Failed to resend OTP",
                "status": "error"
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Campaign management endpoints
@app.route('/api/campaign/start', methods=['POST'])
def start_campaign():
    """Start a new campaign"""
    try:
        data = request.get_json()
        
        campaign_data = {
            "user_id": "user_123",  # This would come from auth
            "name": data.get('name', 'New Campaign'),
            "subject": data.get('subject', ''),
            "message": data.get('message', ''),
            "target_audience": data.get('target_audience', ''),
            "status": "active",
            "created_at": datetime.now().isoformat()
        }
        
        # Save campaign to Supabase (mock for now)
        print(f"Campaign started: {campaign_data}")
        
        return jsonify({
            "message": "Campaign started successfully",
            "campaign_id": "campaign_123",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    """Get user's campaigns"""
    try:
        # Mock campaigns data
        campaigns = [
            {
                "id": "campaign_1",
                "name": "Q4 Outreach",
                "status": "active",
                "created_at": "2024-01-15T10:00:00Z",
                "leads_count": 150
            },
            {
                "id": "campaign_2", 
                "name": "Product Launch",
                "status": "completed",
                "created_at": "2024-01-10T10:00:00Z",
                "leads_count": 75
            }
        ]
        
        return jsonify({
            "campaigns": campaigns,
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

# Leads management
@app.route('/api/leads', methods=['GET'])
def get_leads():
    """Get user's leads"""
    try:
        # Mock leads data
        leads = [
            {
                "id": "lead_1",
                "name": "John Doe",
                "email": "john@company.com",
                "company": "Tech Corp",
                "status": "new",
                "created_at": "2024-01-15T10:00:00Z"
            },
            {
                "id": "lead_2",
                "name": "Jane Smith", 
                "email": "jane@startup.com",
                "company": "Startup Inc",
                "status": "contacted",
                "created_at": "2024-01-14T10:00:00Z"
            }
        ]
        
        return jsonify({
            "leads": leads,
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
