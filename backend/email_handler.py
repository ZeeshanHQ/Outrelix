import base64
import csv
import logging
import os
import pickle
import time
from email.mime.text import MIMEText
from typing import List, Dict

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from config import (
    SCOPES, CREDENTIALS_FILE, TOKEN_FILE, LEADS_FILE,
    DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_TEMPLATE
)

logger = logging.getLogger(__name__)

class EmailHandler:
    def __init__(self):
        # Remove any Gmail authentication from here
        pass

    def load_target_emails(self) -> List[Dict]:
        """Load target emails from CSV file."""
        targets = []
        try:
            with open(LEADS_FILE, newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    email = row['email'].strip().lower()
                    name = row['name'].strip()
                    industry = row['industry'].strip()
                    targets.append({'email': email, 'name': name, 'industry': industry})
            logger.info(f"Loaded {len(targets)} emails from CSV")
            return targets
        except Exception as e:
            logger.error(f"Error loading target emails: {e}")
            return []

    def create_message(self, to: str, subject: str, body: str) -> Dict:
        """Create email message."""
        msg = MIMEText(body)
        msg['to'] = to
        msg['subject'] = subject
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        return {'raw': raw}

    def send_email(self, email: str, name: str, industry: str, 
                  subject: str = DEFAULT_EMAIL_SUBJECT,
                  template: str = DEFAULT_EMAIL_TEMPLATE) -> bool:
        """Send email to target."""
        try:
            message_body = template.format(name=name, industry=industry)
            message = self.create_message(email, subject, message_body)
            self.service.users().messages().send(userId='me', body=message).execute()
            logger.info(f"Sent email to {email}")
            time.sleep(2)  # Rate limiting
            return True
        except Exception as e:
            logger.error(f"Failed to send to {email}: {e}")
            return False

    def send_batch_emails(self, targets: List[Dict], batch_number: int, 
                         batch_size: int) -> Dict[str, int]:
        """Send batch of emails and return statistics."""
        start_index = (batch_number - 1) * batch_size
        end_index = start_index + batch_size
        batch_targets = targets[start_index:end_index]

        if not batch_targets:
            logger.warning(f"No emails to send in batch {batch_number}")
            return {'sent': 0, 'failed': 0}

        stats = {'sent': 0, 'failed': 0}
        logger.info(f"Sending batch {batch_number} emails ({len(batch_targets)} emails)...")
        
        for target in batch_targets:
            success = self.send_email(
                target['email'],
                target['name'],
                target['industry']
            )
            if success:
                stats['sent'] += 1
            else:
                stats['failed'] += 1

        return stats 