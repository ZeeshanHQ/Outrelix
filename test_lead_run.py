import requests
import jwt
import json

token = jwt.encode({'sub': 'test-user-123'}, 'secret', algorithm='HS256')
url = "http://127.0.0.1:8000/api/lead-engine/runs"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}
data = {
    "queries": "test query",
    "geo": "Chicago",
    "limit": 5,
    "dry_run": True
}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
