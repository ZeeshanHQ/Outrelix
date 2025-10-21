import os
import sys
import pickle
import base64
import csv
import time
import requests
from email.mime.text import MIMEText
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# -------------------- CONFIG --------------------
SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
PUSHOVER_USER_KEY = "u2x6s9x88awhujg9zgw72wjz5ohzj3"
PUSHOVER_API_TOKEN = "abnu8xm3nc79f4h6inh52hrqxm5d9e"

EMAIL_SUBJECT = "Quick strategy to grow your business"
EMAIL_BODY_TEMPLATE = """Hi {name},

I have a simple strategy that could help your {industry} business get more leads fast.

Would you like to hear more?

Best,
Sam Smith"""

BATCH_SIZE = 2
NOTIFIED_FILE = "notified_replies.txt"

# -------------------- FUNCTIONS --------------------
def load_notified_emails():
    if not os.path.exists(NOTIFIED_FILE):
        return set()
    with open(NOTIFIED_FILE, "r") as f:
        return set(line.strip() for line in f)

def save_notified_email(email):
    with open(NOTIFIED_FILE, "a") as f:
        f.write(email + "\n")

def send_push_notification(title, message):
    payload = {
        "token": PUSHOVER_API_TOKEN,
        "user": PUSHOVER_USER_KEY,
        "title": title,
        "message": message
    }
    try:
        response = requests.post("https://api.pushover.net/1/messages.json", data=payload)
        if response.status_code == 200:
            print("✅ Phone Notified!")
        else:
            print("❌ Push failed:", response.text)
    except Exception as e:
        print("❌ Push notification error:", e)

def authenticate_gmail():
    creds = None
    if os.path.exists('token.json'):
        with open('token.json', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'wb') as token:
            pickle.dump(creds, token)
    return build('gmail', 'v1', credentials=creds)

def load_target_emails():
    targets = []
    with open('leads.csv', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row['email'].strip().lower()
            name = row['name'].strip()
            industry = row['industry'].strip()
            targets.append({'email': email, 'name': name, 'industry': industry})
    print(f"🎯 Loaded {len(targets)} emails from CSV")
    return targets

def create_message(to, subject, body):
    msg = MIMEText(body)
    msg['to'] = to
    msg['subject'] = subject
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    return {'raw': raw}

def send_email(service, email, name, industry):
    try:
        message_body = EMAIL_BODY_TEMPLATE.format(name=name, industry=industry)
        message = create_message(email, EMAIL_SUBJECT, message_body)
        service.users().messages().send(userId='me', body=message).execute()
        print(f"📤 Sent email to {email}")
        time.sleep(2)
    except Exception as e:
        print(f"❌ Failed to send to {email}: {e}")

def send_batch_emails(service, targets, batch_number):
    start_index = (batch_number - 1) * BATCH_SIZE
    end_index = start_index + BATCH_SIZE
    batch_targets = targets[start_index:end_index]

    if not batch_targets:
        print(f"⚠️ No emails to send in batch {batch_number}")
        return

    print(f"🚀 Sending batch {batch_number} emails ({len(batch_targets)} emails)...")
    for t in batch_targets:
        send_email(service, t['email'], t['name'], t['industry'])

def check_for_replies(service, targets, notified_emails):
    print("🔍 Checking inbox for replies...")
    results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=10).execute()
    messages = results.get('messages', [])
    target_emails = {t['email'] for t in targets}

    for msg in messages:
        msg_data = service.users().messages().get(userId='me', id=msg['id'], format='full').execute()
        headers = msg_data['payload']['headers']
        snippet = msg_data.get('snippet', '')

        from_header = next((h['value'] for h in headers if h['name'] == 'From'), '')
        sender_email = from_header.split('<')[-1].replace('>', '').strip().lower()

        if sender_email not in target_emails or sender_email in notified_emails:
            continue

        positive_keywords = ['interested', 'yes', 'okay', 'sure', 'please send', 'thank you']
        if any(word in snippet.lower() for word in positive_keywords):
            print(f"✅ Positive reply from {sender_email}: {snippet}")
            send_push_notification("Positive Reply 🚀", f"From: {sender_email}\n\n{snippet}")
            save_notified_email(sender_email)
            notified_emails.add(sender_email)
        else:
            print(f"🤔 Reply from {sender_email}, but not clearly positive.")

# -------------------- MAIN --------------------
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("❌ Please specify batch number (1-4) as an argument, e.g. python outreach.py 1")
        sys.exit(1)

    batch_num = int(sys.argv[1])
    if batch_num not in [1, 2, 3, 4]:
        print("❌ Batch number must be 1, 2, 3, or 4")
        sys.exit(1)

    print("📥 Authenticating Gmail...")
    gmail_service = authenticate_gmail()
    print("✅ Gmail Authenticated")

    targets = load_target_emails()
    notified_emails = load_notified_emails()

    send_batch_emails(gmail_service, targets, batch_num)

    print("⏳ Starting reply checking loop. Press Ctrl+C to stop.")
    try:
        while True:
            check_for_replies(gmail_service, targets, notified_emails)
            time.sleep(120)  # check every 2 minutes
    except KeyboardInterrupt:
        print("\n🛑 Stopped by user.")
