import base64
import json
import time
import hmac
import hashlib
import os

# Generate JWT token
secret = os.environ.get('OUTRELIX_JWT_SECRET', 'dev_only_change_me').encode()
b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b'=')

header = b64(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
payload = b64(json.dumps({
    'sub': 'admin@outrelix.local',
    'role': 'admin',
    'iat': int(time.time()),
    'exp': int(time.time() + 7*24*3600)
}).encode())

signature = hmac.new(secret, header + b'.' + payload, hashlib.sha256).digest()
token = (header + b'.' + payload + b'.' + b64(signature)).decode()

print(token)

