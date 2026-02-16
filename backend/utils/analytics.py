"""Advanced analytics and insights for the Outrelix Lead Engine SaaS platform."""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import pandas as pd

logger = logging.getLogger(__name__)


class LeadAnalytics:
    """Enterprise-grade lead analytics and insights engine."""
    
    def __init__(self):
        self.performance_metrics = {}
        self.lead_quality_scores = {}
        self.source_performance = {}
    
    def calculate_advanced_lead_score(self, company_data: Dict) -> Dict[str, float]:
        """Calculate comprehensive lead score using multiple factors."""
        score = 0.0
        factors = {}
        
        # Website Quality (25%)
        website_score = self._score_website(company_data.get("website_url", ""))
        score += website_score * 0.25
        factors["website_quality"] = website_score
        
        # Email Validation (20%)
        email_score = self._score_emails(company_data.get("emails_found", []))
        score += email_score * 0.20
        factors["email_quality"] = email_score
        
        # Phone Validation (15%)
        phone_score = 100.0 if company_data.get("phone_valid") else 0.0
        score += phone_score * 0.15
        factors["phone_quality"] = phone_score
        
        # Company Enrichment (20%)
        enrichment_score = self._score_enrichment(company_data)
        score += enrichment_score * 0.20
        factors["enrichment_quality"] = enrichment_score
        
        # Source Reliability (10%)
        source_score = self._score_source_reliability(company_data.get("source_tags", []))
        score += source_score * 0.10
        factors["source_reliability"] = source_score
        
        # Industry Match (10%)
        industry_score = self._score_industry_match(company_data.get("enrichment_industry", ""))
        score += industry_score * 0.10
        factors["industry_match"] = industry_score
        
        return {
            "total_score": round(score, 2),
            "factors": factors,
            "grade": self._get_grade(score),
            "priority": self._get_priority(score)
        }
    
    def _score_website(self, website: str) -> float:
        """Score website quality based on domain characteristics."""
        if not website:
            return 0.0
        
        score = 50.0  # Base score
        
        # Domain age indicators
        if any(tld in website.lower() for tld in ['.com', '.org', '.net']):
            score += 20.0
        
        # Professional indicators
        if any(word in website.lower() for word in ['saas', 'software', 'tech', 'digital']):
            score += 15.0
        
        # Length and complexity
        if len(website) > 20:
            score += 15.0
        
        return min(score, 100.0)
    
    def _score_emails(self, emails: List[Dict]) -> float:
        """Score email quality based on validation and source."""
        if not emails:
            return 0.0
        
        valid_emails = [e for e in emails if e.get("validation", {}).get("is_valid")]
        if not valid_emails:
            return 0.0
        
        score = 0.0
        for email in valid_emails:
            validation = email.get("validation", {})
            
            # Base validation score
            if validation.get("is_valid"):
                score += 30.0
            
            # MX record score
            if validation.get("mx_found"):
                score += 20.0
            
            # Deliverability score
            deliverability = validation.get("deliverability", "unknown")
            if deliverability == "high":
                score += 25.0
            elif deliverability == "medium":
                score += 15.0
            
            # Source priority
            source = email.get("source", "")
            if source == "contact_page_extractor":
                score += 15.0
            elif source == "hunter":
                score += 10.0
        
        return min(score / len(emails), 100.0)
    
    def _score_enrichment(self, company_data: Dict) -> float:
        """Score company enrichment data quality."""
        score = 0.0
        
        if company_data.get("enrichment_industry"):
            score += 25.0
        
        if company_data.get("enrichment_employee_count"):
            score += 25.0
        
        if company_data.get("enrichment_linkedin_url"):
            score += 25.0
        
        if company_data.get("enrichment_founded_year"):
            score += 25.0
        
        return score
    
    def _score_source_reliability(self, source_tags: List[str]) -> float:
        """Score source reliability based on tag quality."""
        if not source_tags:
            return 50.0
        
        score = 0.0
        for tag in source_tags:
            if "google_maps" in tag.lower():
                score += 40.0
            elif "yelp" in tag.lower():
                score += 30.0
            elif "yellowpages" in tag.lower():
                score += 20.0
        
        return min(score / len(source_tags), 100.0)
    
    def _score_industry_match(self, industry: str) -> float:
        """Score industry relevance to B2B/SaaS."""
        if not industry:
            return 50.0
        
        b2b_keywords = [
            "software", "technology", "saas", "enterprise", "business", 
            "marketing", "sales", "crm", "analytics", "cloud", "digital"
        ]
        
        industry_lower = industry.lower()
        matches = sum(1 for keyword in b2b_keywords if keyword in industry_lower)
        
        if matches >= 3:
            return 100.0
        elif matches >= 2:
            return 80.0
        elif matches >= 1:
            return 60.0
        else:
            return 30.0
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade."""
        if score >= 90:
            return "A+"
        elif score >= 80:
            return "A"
        elif score >= 70:
            return "B+"
        elif score >= 60:
            return "B"
        elif score >= 50:
            return "C+"
        elif score >= 40:
            return "C"
        else:
            return "D"
    
    def _get_priority(self, score: float) -> str:
        """Convert score to priority level."""
        if score >= 85:
            return "HIGH"
        elif score >= 70:
            return "MEDIUM"
        elif score >= 50:
            return "LOW"
        else:
            return "REJECT"
    
    def generate_performance_report(self, pipeline_data: List[Dict]) -> Dict:
        """Generate comprehensive performance report."""
        total_companies = len(pipeline_data)
        if total_companies == 0:
            return {"error": "No data to analyze"}
        
        # Lead quality distribution
        quality_distribution = {"A+": 0, "A": 0, "B+": 0, "B": 0, "C+": 0, "C": 0, "D": 0}
        priority_distribution = {"HIGH": 0, "MEDIUM": 0, "LOW": 0, "REJECT": 0}
        
        # Source performance
        source_stats = {}
        
        # Industry breakdown
        industry_stats = {}
        
        total_score = 0.0
        
        for company in pipeline_data:
            # Calculate advanced lead score
            lead_score_data = self.calculate_advanced_lead_score(company)
            total_score += lead_score_data["total_score"]
            
            # Update distributions
            grade = lead_score_data["grade"]
            priority = lead_score_data["priority"]
            quality_distribution[grade] += 1
            priority_distribution[priority] += 1
            
            # Source statistics
            for source in company.get("source_tags", []):
                if source not in source_stats:
                    source_stats[source] = {"count": 0, "avg_score": 0.0, "total_score": 0.0}
                source_stats[source]["count"] += 1
                source_stats[source]["total_score"] += lead_score_data["total_score"]
            
            # Industry statistics
            industry = company.get("enrichment_industry", "Unknown")
            if industry not in industry_stats:
                industry_stats[industry] = {"count": 0, "avg_score": 0.0, "total_score": 0.0}
            industry_stats[industry]["count"] += 1
            industry_stats[industry]["total_score"] += lead_score_data["total_score"]
        
        # Calculate averages
        avg_lead_score = total_score / total_companies
        
        # Update source and industry averages
        for source in source_stats.values():
            source["avg_score"] = round(source["total_score"] / source["count"], 2)
        
        for industry in industry_stats.values():
            industry["avg_score"] = round(industry["total_score"] / industry["count"], 2)
        
        return {
            "summary": {
                "total_companies": total_companies,
                "average_lead_score": round(avg_lead_score, 2),
                "total_lead_score": round(total_score, 2)
            },
            "quality_distribution": quality_distribution,
            "priority_distribution": priority_distribution,
            "source_performance": source_stats,
            "industry_breakdown": industry_stats,
            "recommendations": self._generate_recommendations(quality_distribution, avg_lead_score)
        }
    
    def _generate_recommendations(self, quality_dist: Dict, avg_score: float) -> List[str]:
        """Generate actionable recommendations based on analysis."""
        recommendations = []
        
        # Quality-based recommendations
        low_quality_count = quality_dist.get("C", 0) + quality_dist.get("D", 0)
        if low_quality_count > 0:
            recommendations.append(f"Focus on improving {low_quality_count} low-quality leads (C/D grade)")
        
        if avg_score < 70:
            recommendations.append("Overall lead quality is below target. Review sourcing criteria and validation processes.")
        
        # Source optimization
        if quality_dist.get("A+", 0) > quality_dist.get("A", 0):
            recommendations.append("Excellent lead quality achieved. Consider expanding successful source channels.")
        
        return recommendations
    
    def export_analytics_report(self, report_data: Dict, output_path: str) -> bool:
        """Export analytics report to JSON file."""
        try:
            report_data["generated_at"] = datetime.now().isoformat()
            report_data["version"] = "1.0.0"
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, default=str)
            
            logger.info(f"Analytics report exported to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to export analytics report: {e}")
            return False


def create_analytics_engine() -> LeadAnalytics:
    """Create and return a new analytics engine instance."""
    return LeadAnalytics()

