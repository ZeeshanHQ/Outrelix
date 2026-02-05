import os

# Gmail API Configuration
SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token.json'

# Push Notification Configuration
PUSHOVER_USER_KEY = "u2x6s9x88awhujg9zgw72wjz5ohzj3"
PUSHOVER_API_TOKEN = "abnu8xm3nc79f4h6inh52hrqxm5d9e"

# Email Configuration
DEFAULT_EMAIL_SUBJECT = "Quick strategy to grow your business"
DEFAULT_EMAIL_TEMPLATE = """Hi {name},

I have a simple strategy that could help your {industry} business get more leads fast.

Would you like to hear more?

Best,
Sam Smith"""

# Batch Configuration
BATCH_SIZE = 2
MAX_BATCHES = 4

# File Paths
LEADS_FILE = 'leads.csv'
NOTIFIED_FILE = 'notified_replies.txt'
LOG_FILE = 'outreach.log'

# Reply Detection
POSITIVE_KEYWORDS = ['interested', 'yes', 'okay', 'sure', 'please send', 'thank you', 'love to', 'would like']
NEGATIVE_KEYWORDS = ['no', 'not interested', 'unsubscribe', 'stop', 'don\'t contact']

# UI Configuration
FLASK_HOST = '0.0.0.0'
FLASK_PORT = 5000
FLASK_DEBUG = True

# Logging Configuration
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOG_LEVEL = 'INFO' 