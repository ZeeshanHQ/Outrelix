import requests
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        """
        Initialize AI Service with Ollama
        
        Args:
            ollama_url: URL where Ollama is running (default: http://localhost:11434)
        """
        self.ollama_url = ollama_url
        self.model_name = "llama2"
        
    def generate_email_from_goal(self, campaign_goal: str, industry: str, recipient_name: str = "{name}") -> str:
        """
        Generate an AI-powered email based on campaign goal and industry
        
        Args:
            campaign_goal: User's campaign goal/objective
            industry: Target industry
            recipient_name: Recipient name placeholder (default: {name})
            
        Returns:
            Generated email content
        """
        try:
            # Create a comprehensive prompt for email generation
            prompt = self._create_email_prompt(campaign_goal, industry, recipient_name)
            
            # Call Ollama API
            response = self._call_ollama(prompt)
            
            if response and 'response' in response:
                email_content = response['response'].strip()
                # Clean up the response and ensure it's properly formatted
                email_content = self._clean_email_content(email_content)
                return email_content
            else:
                logger.error("Invalid response from Ollama")
                return self._get_fallback_email(recipient_name)
                
        except Exception as e:
            logger.error(f"Error generating email with AI: {str(e)}")
            return self._get_fallback_email(recipient_name)
    
    def _create_email_prompt(self, campaign_goal: str, industry: str, recipient_name: str) -> str:
        """
        Create a detailed prompt for email generation
        """
        prompt = f"""You are an expert email outreach specialist. Generate a professional, personalized email based on the following information:

CAMPAIGN GOAL: {campaign_goal}
TARGET INDUSTRY: {industry}
RECIPIENT: {recipient_name}

Requirements:
1. Keep the email concise (2-3 paragraphs maximum)
2. Make it personal and relevant to the industry
3. Include a clear call-to-action
4. Use a professional but friendly tone
5. Reference the campaign goal naturally
6. End with a professional signature

Generate only the email content (no subject line, no explanations). Start directly with the greeting and end with the signature.

Email:"""
        
        return prompt
    
    def _call_ollama(self, prompt: str) -> Optional[Dict[str, Any]]:
        """
        Make API call to Ollama
        """
        try:
            url = f"{self.ollama_url}/api/generate"
            
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error calling Ollama: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error calling Ollama: {str(e)}")
            return None
    
    def _clean_email_content(self, content: str) -> str:
        """
        Clean and format the AI-generated email content
        """
        # Remove any markdown formatting if present
        content = content.replace("```", "").replace("**", "").replace("*", "")
        
        # Remove any explanatory text that might be included
        lines = content.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            # Skip lines that are clearly not part of the email
            if (line.lower().startswith(('email:', 'subject:', 'prompt:', 'requirements:')) or
                line.lower().startswith(('generate', 'create', 'write'))):
                continue
            if line:
                cleaned_lines.append(line)
        
        # Join lines and ensure proper formatting
        cleaned_content = '\n'.join(cleaned_lines)
        
        # If the content is too short, it might be incomplete
        if len(cleaned_content) < 50:
            return self._get_fallback_email("{name}")
        
        return cleaned_content
    
    def _get_fallback_email(self, recipient_name: str) -> str:
        """
        Return a fallback email template if AI generation fails
        """
        return f"""Hi {recipient_name},

I hope this email finds you well. I came across your work and was genuinely impressed by what you're doing.

I believe there could be some interesting synergies between our work and I'd love to explore potential collaboration opportunities.

Would you be interested in a brief conversation to discuss how we might work together?

Best regards,
[Your Name]"""
    
    def test_connection(self) -> bool:
        """
        Test if Ollama is running and accessible
        """
        try:
            url = f"{self.ollama_url}/api/tags"
            response = requests.get(url, timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_available_models(self) -> list:
        """
        Get list of available models in Ollama
        """
        try:
            url = f"{self.ollama_url}/api/tags"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [model['name'] for model in data.get('models', [])]
            return []
        except:
            return []

# Global AI service instance
ai_service = AIService() 