import logging
from typing import Dict, List, Set, Tuple
import requests
from textblob import TextBlob

from api.config import (
    POSITIVE_KEYWORDS, NEGATIVE_KEYWORDS,
    PUSHOVER_USER_KEY, PUSHOVER_API_TOKEN
)

logger = logging.getLogger(__name__)

class ReplyDetector:
    def __init__(self):
        self.notified_emails = self._load_notified_emails()
        
    def _load_notified_emails(self) -> Set[str]:
        """Load previously notified email addresses."""
        try:
            with open('notified_replies.txt', 'r') as f:
                return set(line.strip() for line in f)
        except FileNotFoundError:
            return set()

    def _save_notified_email(self, email: str):
        """Save notified email address."""
        with open('notified_replies.txt', 'a') as f:
            f.write(email + '\n')
        self.notified_emails.add(email)

    def _send_push_notification(self, title: str, message: str) -> bool:
        """Send push notification via Pushover."""
        payload = {
            "token": PUSHOVER_API_TOKEN,
            "user": PUSHOVER_USER_KEY,
            "title": title,
            "message": message
        }
        try:
            response = requests.post(
                "https://api.pushover.net/1/messages.json",
                data=payload
            )
            if response.status_code == 200:
                logger.info("Push notification sent successfully")
                return True
            else:
                logger.error(f"Push notification failed: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Push notification error: {e}")
            return False

    def _analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment of text using TextBlob."""
        analysis = TextBlob(text)
        return analysis.sentiment.polarity

    def _check_keywords(self, text: str) -> Tuple[bool, bool]:
        """Check for positive and negative keywords in text."""
        text_lower = text.lower()
        has_positive = any(word in text_lower for word in POSITIVE_KEYWORDS)
        has_negative = any(word in text_lower for word in NEGATIVE_KEYWORDS)
        return has_positive, has_negative

    def analyze_reply(self, email: str, snippet: str) -> Dict:
        """Analyze email reply and determine its category."""
        if email in self.notified_emails:
            return {'status': 'already_notified'}

        # Get sentiment score (-1 to 1)
        sentiment_score = self._analyze_sentiment(snippet)
        
        # Check for keywords
        has_positive, has_negative = self._check_keywords(snippet)

        # Determine reply category
        if has_negative:
            category = 'negative'
        elif has_positive and sentiment_score > 0:
            category = 'positive'
        elif sentiment_score > 0.3:
            category = 'positive'
        elif sentiment_score < -0.3:
            category = 'negative'
        else:
            category = 'neutral'

        return {
            'status': 'new',
            'category': category,
            'sentiment_score': sentiment_score,
            'has_positive_keywords': has_positive,
            'has_negative_keywords': has_negative
        }

    def process_reply(self, email: str, snippet: str) -> bool:
        """Process a reply and send notification if positive."""
        analysis = self.analyze_reply(email, snippet)
        
        if analysis['status'] == 'already_notified':
            return False

        if analysis['category'] == 'positive':
            notification_title = "Positive Reply 🚀"
            notification_message = f"From: {email}\n\n{snippet}"
            
            if self._send_push_notification(notification_title, notification_message):
                self._save_notified_email(email)
                logger.info(f"Processed positive reply from {email}")
                return True

        return False

    def check_replies(self, service, targets: List[Dict]) -> Dict[str, int]:
        """Check for replies and process them."""
        stats = {'positive': 0, 'negative': 0, 'neutral': 0}
        target_emails = {t['email'] for t in targets}

        try:
            results = service.users().messages().list(
                userId='me',
                labelIds=['INBOX'],
                maxResults=10
            ).execute()
            
            messages = results.get('messages', [])

            for msg in messages:
                msg_data = service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='full'
                ).execute()
                
                headers = msg_data['payload']['headers']
                snippet = msg_data.get('snippet', '')

                from_header = next(
                    (h['value'] for h in headers if h['name'] == 'From'),
                    ''
                )
                sender_email = from_header.split('<')[-1].replace('>', '').strip().lower()

                if sender_email not in target_emails:
                    continue

                analysis = self.analyze_reply(sender_email, snippet)
                if analysis['status'] == 'new':
                    stats[analysis['category']] += 1
                    self.process_reply(sender_email, snippet)

            return stats

        except Exception as e:
            logger.error(f"Error checking replies: {e}")
            return stats 