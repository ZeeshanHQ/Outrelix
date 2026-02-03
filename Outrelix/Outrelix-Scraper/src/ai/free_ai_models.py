"""
Free AI Models for Continuous Lead Generation
Uses only free, open-source models that can run locally or via free APIs
"""

import logging
import asyncio
import aiohttp
from typing import Dict, List, Optional, Any, Tuple
import json
import re
from datetime import datetime

logger = logging.getLogger(__name__)

class FreeAIModels:
    """
    Collection of free AI models for lead generation tasks:
    1. Location demand analysis
    2. Lead scoring and classification
    3. Contact extraction and validation
    4. Market trend analysis
    """
    
    def __init__(self):
        self.session = None
        self.models_loaded = False
        self._init_models()
    
    def _init_models(self):
        """Initialize free AI models"""
        try:
            # Try to load local Hugging Face models
            self._load_local_models()
            self.models_loaded = True
            logger.info("✅ Free AI models loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load local models: {e}")
            # Fallback to free APIs
            self._init_free_apis()
    
    def _load_local_models(self):
        """Load free Hugging Face models locally"""
        try:
            from transformers import pipeline, AutoTokenizer, AutoModel
            
            # 1. Text classification for lead quality
            self.lead_classifier = pipeline(
                "text-classification",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                return_all_scores=True
            )
            
            # 2. Named Entity Recognition for contact extraction
            self.ner_model = pipeline(
                "ner",
                model="dslim/bert-base-NER",
                aggregation_strategy="simple"
            )
            
            # 3. Text generation for demand prediction
            self.text_generator = pipeline(
                "text-generation",
                model="gpt2",
                max_length=100,
                do_sample=True,
                temperature=0.7
            )
            
            # 4. Sentence embeddings for similarity
            try:
                from sentence_transformers import SentenceTransformer
                self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
            except ImportError:
                logger.warning("sentence-transformers not available, using fallback")
                self.embedder = None
            
            logger.info("✅ Local Hugging Face models loaded")
            
        except ImportError as e:
            logger.warning(f"Hugging Face models not available: {e}")
            raise
        except Exception as e:
            logger.error(f"Error loading local models: {e}")
            raise
    
    def _init_free_apis(self):
        """Initialize free API alternatives"""
        self.free_apis = {
            "huggingface_inference": "https://api-inference.huggingface.co/models",
            "cohere_free": "https://api.cohere.ai/v1",  # Has free tier
            "openai_free": None  # No longer free, but keeping for reference
        }
        logger.info("✅ Free API alternatives initialized")
    
    async def analyze_location_demand(self, city: str, state: str, country: str = "US") -> Dict[str, Any]:
        """
        Analyze demand for roofing contractors in a specific location
        Uses free AI models to predict demand based on:
        - Weather patterns
        - Population density
        - Economic indicators
        - Historical data
        """
        try:
            # Create context for analysis
            context = f"""
            Location: {city}, {state}, {country}
            Industry: Roofing Contractors
            Analysis needed: Demand prediction for roofing services
            
            Factors to consider:
            - Weather patterns (storms, hurricanes, hail)
            - Population density and growth
            - Economic indicators
            - Construction activity
            - Seasonal patterns
            """
            
            if self.models_loaded and hasattr(self, 'text_generator'):
                # Use local model for analysis
                result = self.text_generator(
                    context,
                    max_length=150,
                    num_return_sequences=1,
                    temperature=0.7
                )
                
                analysis_text = result[0]['generated_text']
                
                # Extract key insights using regex
                demand_score = self._extract_demand_score(analysis_text)
                key_factors = self._extract_key_factors(analysis_text)
                
            else:
                # Fallback to rule-based analysis
                demand_score = self._rule_based_demand_analysis(city, state)
                key_factors = self._get_rule_based_factors(city, state)
                analysis_text = f"Rule-based analysis for {city}, {state}"
            
            return {
                "location": f"{city}, {state}",
                "demand_score": demand_score,
                "key_factors": key_factors,
                "analysis": analysis_text,
                "confidence": 0.8 if self.models_loaded else 0.6,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing location demand: {e}")
            return {
                "location": f"{city}, {state}",
                "demand_score": 0.5,
                "key_factors": ["Unknown"],
                "analysis": f"Error in analysis: {str(e)}",
                "confidence": 0.0,
                "timestamp": datetime.now().isoformat()
            }
    
    def _extract_demand_score(self, text: str) -> float:
        """Extract demand score from AI-generated text"""
        # Look for numerical indicators
        numbers = re.findall(r'\b(\d+(?:\.\d+)?)\b', text)
        if numbers:
            # Convert to 0-1 scale
            max_num = max([float(n) for n in numbers])
            return min(1.0, max_num / 10.0)
        
        # Look for qualitative indicators
        high_indicators = ['high', 'strong', 'excellent', 'great', 'significant']
        medium_indicators = ['moderate', 'average', 'decent', 'good']
        low_indicators = ['low', 'weak', 'poor', 'limited']
        
        text_lower = text.lower()
        
        if any(indicator in text_lower for indicator in high_indicators):
            return 0.8
        elif any(indicator in text_lower for indicator in medium_indicators):
            return 0.5
        elif any(indicator in text_lower for indicator in low_indicators):
            return 0.2
        else:
            return 0.5
    
    def _extract_key_factors(self, text: str) -> List[str]:
        """Extract key factors from AI-generated text"""
        factors = []
        
        # Common roofing demand factors
        factor_keywords = {
            'weather': ['storm', 'hurricane', 'hail', 'wind', 'weather', 'climate'],
            'population': ['population', 'growth', 'density', 'urban', 'suburban'],
            'economy': ['economic', 'income', 'wealth', 'development', 'construction'],
            'seasonal': ['seasonal', 'spring', 'summer', 'fall', 'winter'],
            'disasters': ['disaster', 'damage', 'repair', 'replacement']
        }
        
        text_lower = text.lower()
        for category, keywords in factor_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                factors.append(category.title())
        
        return factors if factors else ['General']
    
    def _rule_based_demand_analysis(self, city: str, state: str) -> float:
        """Rule-based demand analysis as fallback"""
        # High-demand states (storm-prone, high population)
        high_demand_states = ['FL', 'TX', 'CA', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']
        medium_demand_states = ['VA', 'WA', 'AZ', 'CO', 'TN', 'IN', 'MO', 'WI', 'MN', 'LA']
        
        # High-demand cities (major metropolitan areas)
        high_demand_cities = [
            'miami', 'houston', 'dallas', 'atlanta', 'chicago', 'phoenix',
            'philadelphia', 'san antonio', 'san diego', 'austin', 'jacksonville',
            'fort worth', 'columbus', 'charlotte', 'seattle', 'denver', 'washington',
            'boston', 'el paso', 'nashville', 'detroit', 'oklahoma city', 'portland',
            'las vegas', 'memphis', 'louisville', 'baltimore', 'milwaukee', 'albuquerque'
        ]
        
        city_lower = city.lower()
        state_upper = state.upper()
        
        if state_upper in high_demand_states or any(c in city_lower for c in high_demand_cities):
            return 0.8
        elif state_upper in medium_demand_states:
            return 0.6
        else:
            return 0.4
    
    def _get_rule_based_factors(self, city: str, state: str) -> List[str]:
        """Get rule-based factors"""
        factors = []
        
        # Weather factors
        storm_states = ['FL', 'TX', 'LA', 'MS', 'AL', 'GA', 'SC', 'NC']
        if state.upper() in storm_states:
            factors.append('Weather')
        
        # Population factors
        major_cities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia']
        if any(c in city.lower() for c in major_cities):
            factors.append('Population')
        
        # Economic factors
        economic_states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']
        if state.upper() in economic_states:
            factors.append('Economy')
        
        return factors if factors else ['General']
    
    async def score_lead_quality(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score lead quality using free AI models
        Analyzes:
        - Company information completeness
        - Contact information quality
        - Role relevance
        - Geographic desirability
        """
        try:
            # Prepare text for analysis
            company_text = f"""
            Company: {lead_data.get('company_name', '')}
            Website: {lead_data.get('website_url', '')}
            Email: {lead_data.get('email', '')}
            Phone: {lead_data.get('phone', '')}
            Role: {lead_data.get('role', '')}
            Location: {lead_data.get('city', '')}, {lead_data.get('state', '')}
            Industry: Roofing Contractors
            """
            
            if self.models_loaded and hasattr(self, 'lead_classifier'):
                # Use local model for scoring
                sentiment_result = self.lead_classifier(company_text)
                
                # Extract positive sentiment score
                positive_score = 0.0
                for result in sentiment_result[0]:
                    if result['label'] == 'POSITIVE':
                        positive_score = result['score']
                        break
                
            else:
                # Fallback to rule-based scoring
                positive_score = self._rule_based_lead_scoring(lead_data)
            
            # Calculate overall quality score
            quality_score = self._calculate_quality_score(lead_data, positive_score)
            
            return {
                "lead_id": lead_data.get('id', 'unknown'),
                "quality_score": quality_score,
                "sentiment_score": positive_score,
                "completeness_score": self._calculate_completeness_score(lead_data),
                "relevance_score": self._calculate_relevance_score(lead_data),
                "confidence": 0.8 if self.models_loaded else 0.6,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error scoring lead quality: {e}")
            return {
                "lead_id": lead_data.get('id', 'unknown'),
                "quality_score": 0.5,
                "sentiment_score": 0.5,
                "completeness_score": 0.5,
                "relevance_score": 0.5,
                "confidence": 0.0,
                "timestamp": datetime.now().isoformat()
            }
    
    def _rule_based_lead_scoring(self, lead_data: Dict[str, Any]) -> float:
        """Rule-based lead scoring as fallback"""
        score = 0.0
        
        # Company name present
        if lead_data.get('company_name'):
            score += 0.2
        
        # Website present
        if lead_data.get('website_url'):
            score += 0.2
        
        # Email present
        if lead_data.get('email'):
            score += 0.2
        
        # Phone present
        if lead_data.get('phone'):
            score += 0.2
        
        # Role present and relevant
        role = lead_data.get('role', '').lower()
        relevant_roles = ['ceo', 'owner', 'founder', 'president', 'manager', 'director']
        if any(r in role for r in relevant_roles):
            score += 0.2
        
        return min(1.0, score)
    
    def _calculate_quality_score(self, lead_data: Dict[str, Any], sentiment_score: float) -> float:
        """Calculate overall quality score"""
        completeness = self._calculate_completeness_score(lead_data)
        relevance = self._calculate_relevance_score(lead_data)
        
        # Weighted average
        quality_score = (sentiment_score * 0.4 + completeness * 0.4 + relevance * 0.2)
        return min(1.0, quality_score)
    
    def _calculate_completeness_score(self, lead_data: Dict[str, Any]) -> float:
        """Calculate completeness score based on available fields"""
        required_fields = ['company_name', 'email', 'phone', 'website_url']
        optional_fields = ['role', 'address', 'city', 'state']
        
        score = 0.0
        
        # Required fields (60% of score)
        for field in required_fields:
            if lead_data.get(field):
                score += 0.15
        
        # Optional fields (40% of score)
        for field in optional_fields:
            if lead_data.get(field):
                score += 0.1
        
        return min(1.0, score)
    
    def _calculate_relevance_score(self, lead_data: Dict[str, Any]) -> float:
        """Calculate relevance score for roofing contractors"""
        score = 0.5  # Base score
        
        # Check company name for roofing keywords
        company_name = lead_data.get('company_name', '').lower()
        roofing_keywords = ['roof', 'roofing', 'construction', 'contractor', 'building', 'home improvement']
        if any(keyword in company_name for keyword in roofing_keywords):
            score += 0.3
        
        # Check role relevance
        role = lead_data.get('role', '').lower()
        decision_maker_roles = ['ceo', 'owner', 'founder', 'president', 'manager', 'director']
        if any(r in role for r in decision_maker_roles):
            score += 0.2
        
        return min(1.0, score)
    
    async def extract_contacts_from_text(self, text: str) -> Dict[str, List[str]]:
        """
        Extract contacts from text using free AI models
        Returns emails, phones, names, and roles
        """
        try:
            contacts = {
                "emails": [],
                "phones": [],
                "names": [],
                "roles": []
            }
            
            if self.models_loaded and hasattr(self, 'ner_model'):
                # Use NER model for extraction
                entities = self.ner_model(text)
                
                for entity in entities:
                    entity_text = entity['word']
                    entity_label = entity['entity_group']
                    
                    if entity_label == 'PER':  # Person
                        contacts["names"].append(entity_text)
                    elif entity_label == 'ORG':  # Organization
                        # Could be company names
                        pass
                    elif entity_label == 'MISC':  # Miscellaneous
                        # Could be roles or other info
                        pass
            
            # Always use regex as backup/primary method
            contacts["emails"].extend(self._extract_emails_regex(text))
            contacts["phones"].extend(self._extract_phones_regex(text))
            contacts["names"].extend(self._extract_names_regex(text))
            contacts["roles"].extend(self._extract_roles_regex(text))
            
            # Remove duplicates
            for key in contacts:
                contacts[key] = list(set(contacts[key]))
            
            return contacts
            
        except Exception as e:
            logger.error(f"Error extracting contacts: {e}")
            return {"emails": [], "phones": [], "names": [], "roles": []}
    
    def _extract_emails_regex(self, text: str) -> List[str]:
        """Extract emails using regex"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        return re.findall(email_pattern, text)
    
    def _extract_phones_regex(self, text: str) -> List[str]:
        """Extract phone numbers using regex"""
        phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'\+?1?[-.\s]?([0-9]{3})[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
        ]
        
        phones = []
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple):
                    phone = ''.join(match)
                else:
                    phone = match
                phones.append(phone)
        
        return phones
    
    def _extract_names_regex(self, text: str) -> List[str]:
        """Extract names using regex patterns"""
        # Simple name patterns (First Last, First M. Last, etc.)
        name_patterns = [
            r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',  # First Last
            r'\b[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+\b',  # First M. Last
            r'\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b'  # First Middle Last
        ]
        
        names = []
        for pattern in name_patterns:
            matches = re.findall(pattern, text)
            names.extend(matches)
        
        return names
    
    def _extract_roles_regex(self, text: str) -> List[str]:
        """Extract roles using regex patterns"""
        role_keywords = [
            'ceo', 'chief executive officer', 'president', 'owner', 'founder',
            'manager', 'director', 'supervisor', 'lead', 'head', 'vice president',
            'vp', 'coo', 'cfo', 'cto', 'cmo', 'sales manager', 'project manager'
        ]
        
        roles = []
        text_lower = text.lower()
        
        for role in role_keywords:
            if role in text_lower:
                roles.append(role.title())
        
        return roles
    
    async def analyze_market_trends(self, location: str, timeframe: str = "30d") -> Dict[str, Any]:
        """
        Analyze market trends for roofing contractors
        Uses free data sources and AI models
        """
        try:
            # This would integrate with free APIs like:
            # - Google Trends (free)
            # - Weather APIs (free tiers)
            # - Economic data APIs (free)
            
            # For now, return mock analysis
            return {
                "location": location,
                "timeframe": timeframe,
                "trend_score": 0.7,
                "key_insights": [
                    "Increased demand due to storm season",
                    "Growing population in area",
                    "Economic growth indicators positive"
                ],
                "recommendation": "High priority for lead generation",
                "confidence": 0.6,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing market trends: {e}")
            return {
                "location": location,
                "timeframe": timeframe,
                "trend_score": 0.5,
                "key_insights": ["Analysis unavailable"],
                "recommendation": "Standard priority",
                "confidence": 0.0,
                "timestamp": datetime.now().isoformat()
            }
    
    async def close(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()

# Global instance
free_ai_models = FreeAIModels()

