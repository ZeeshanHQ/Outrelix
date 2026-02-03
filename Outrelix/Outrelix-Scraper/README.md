# 🚀 Outrelix Lead Engine - Roofing Contractor Lead Generation Platform

> **The Most Powerful Lead Generation Platform for Roofing Contractors in the United States**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code Quality](https://img.shields.io/badge/code%20quality-A%2B-brightgreen)](https://github.com/your-org/outrelix-lead-engine)

## 🌟 **Why Outrelix Lead Engine?**

**Outrelix Lead Engine** is not just another lead generator - it's a **comprehensive roofing contractor intelligence platform** that transforms how roofing companies discover, validate, and engage with high-quality homeowner prospects.

### ✨ **Enterprise Features**
- 🔍 **Multi-Source Intelligence**: Google Maps, Yelp, Yellow Pages integration for roofing contractors
- 📧 **Advanced Contact Discovery**: Contact page extraction + Hunter.io fallback for homeowner leads
- ✅ **Professional Validation**: ARJOS Tech email validation + phone normalization
- 🤖 **AI-Powered Enrichment**: OpenRouter integration for data cleaning and personalization
- 📊 **Advanced Analytics**: Lead scoring, quality grading, and performance insights for roofing leads
- 🚀 **Google Sheets Integration**: Real-time data sync and collaboration
- 🎯 **Smart Deduplication**: Fuzzy matching with configurable thresholds
- 📈 **Performance Metrics**: Source reliability, roofing industry breakdown, actionable recommendations

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Sources  │    │  Processing     │    │   Output &      │
│                 │    │   Pipeline      │    │   Analytics     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Google Maps   │    │ • Source Merge  │    │ • CSV/Excel     │
│ • Yelp Fusion   │    │ • Email Extract │    │ • Google Sheets │
│ • Yellow Pages  │    │ • Validation    │    │ • Analytics     │
│ • Contact Pages │    │ • AI Enrichment │    │ • Reports       │
│ • Hunter.io     │    │ • Deduplication │    │                 │
│ • Clearbit      │    │ • Lead Scoring  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### 1. **Installation**
```bash
git clone https://github.com/your-org/outrelix-lead-engine.git
cd outrelix-lead-engine
pip install -r requirements.txt
```

### 2. **Configuration**
```bash
cp .env.example .env
# Edit .env with your API keys and Google Sheets configuration
```

### 3. **Run Lead Generation**
```bash
# Dry-run mode (recommended for testing)
python main.py --queries "SaaS,CRM,Marketing Software" --geo "USA" --category "B2B SaaS" --limit 100 --enable_yelp true --enable_clearbit true --push_to_gsheets true --dry_run true

# Production mode
python main.py --queries "SaaS,CRM,Marketing Software" --geo "USA" --category "B2B SaaS" --limit 100 --enable_yelp true --enable_clearbit true --push_to_gsheets true --dry_run false
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GSHEETS_SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/...

# API Keys
RAPIDAPI_KEY=your_rapidapi_key
YELP_API_KEY=your_yelp_key
HUNTER_API_KEY=your_hunter_key
CLEARBIT_API_KEY=your_clearbit_key
OPENROUTER_API_KEY=your_openrouter_key

# Features
PUSH_TO_GSHEETS=true
ENABLE_YELP=true
ENABLE_CLEARBIT=true
DRY_RUN=false
```

### **CLI Options**
```bash
--queries "SaaS,CRM,Marketing Software"  # Search terms
--geo "USA"                              # Geographic filter
--category "B2B SaaS"                    # Industry category
--limit 1000                             # Max leads per run
--enable_yelp true                       # Enable Yelp integration
--enable_clearbit true                   # Enable Clearbit enrichment
--push_to_gsheets true                   # Push to Google Sheets
--dry_run true                           # Test mode (no external calls)
```

## 📊 **Advanced Analytics & Insights**

### **Lead Quality Scoring System**
- **A+ (90-100)**: Premium leads with complete data
- **A (80-89)**: High-quality leads with minor gaps
- **B+ (70-79)**: Good leads with validation
- **B (60-69)**: Acceptable leads
- **C+ (50-59)**: Basic leads requiring attention
- **C (40-49)**: Low-quality leads
- **D (0-39)**: Rejected leads

### **Performance Metrics**
- **Source Reliability**: Track which data sources perform best
- **Industry Breakdown**: Analyze lead distribution by sector
- **Quality Distribution**: Monitor lead quality trends
- **Actionable Recommendations**: AI-powered optimization suggestions

## 🎯 **Use Cases**

### **Sales Teams**
- Generate qualified B2B leads for outbound campaigns
- Validate prospect contact information
- Score leads by quality and priority
- Track lead generation performance

### **Marketing Agencies**
- Build prospect lists for client campaigns
- Validate and enrich contact databases
- Generate industry-specific lead reports
- Scale lead generation operations

### **Enterprises**
- Build comprehensive prospect databases
- Integrate with existing CRM systems
- Generate executive-level insights
- Optimize lead generation ROI

## 🔌 **API Integrations**

| Service | Purpose | Status |
|---------|---------|---------|
| **Google Maps Extractor** | Business discovery | ✅ Active |
| **Yelp Fusion** | Alternative business data | ✅ Active |
| **Yellow Pages** | Extended business coverage | ✅ Active |
| **Contact Page Extractor** | Email discovery | ✅ Active |
| **Hunter.io** | Professional email search | ✅ Active |
| **Clearbit** | Company enrichment | ✅ Active |
| **ARJOS Tech** | Email validation | ✅ Active |
| **OpenRouter** | AI enrichment | ✅ Active |
| **Google Sheets** | Data export | ✅ Active |

## 📈 **Performance & Scalability**

- **Async Processing**: Concurrent API calls for maximum speed
- **Rate Limiting**: Intelligent backoff and retry mechanisms
- **Batch Processing**: Handle thousands of leads per run
- **Memory Efficient**: Streamlined data processing
- **Error Handling**: Graceful degradation and logging

## 🧪 **Testing & Quality Assurance**

```bash
# Run all tests
python -m unittest discover -s tests -v

# Linting
ruff check .

# Type checking
mypy .

# Smoke tests
python -m unittest tests.test_smoke_exports_and_determinism
```

## 🚀 **Deployment Options**

### **Local Development**
```bash
python main.py --dry_run true
```

### **Production Server**
```bash
# Set DRY_RUN=false in .env
python main.py --queries "your,queries" --geo "target_region"
```

### **Docker Deployment**
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

### **Cloud Deployment**
- **AWS Lambda**: Serverless execution
- **Google Cloud Run**: Containerized deployment
- **Azure Functions**: Event-driven processing
- **Heroku**: Simple web deployment

## 📊 **Output Structure**

```
output/
├── run_20250830_044745/
│   ├── raw_businesses.csv          # Raw business data
│   ├── raw_contacts.csv            # Contact information
│   ├── validated_emails.csv        # Validated email data
│   ├── verified_leads.xlsx         # Final lead database
│   ├── summary.json                # Run summary
│   ├── advanced_analytics.json     # Analytics report
│   └── run.log                     # Detailed execution log
```

## 🔒 **Security & Compliance**

- **API Key Management**: Secure environment variable handling
- **Data Privacy**: No data storage beyond local processing
- **Rate Limiting**: Respectful API usage
- **Audit Logging**: Complete execution tracking
- **Dry-Run Mode**: Safe testing without external calls

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
```bash
git clone https://github.com/your-org/outrelix-lead-engine.git
cd outrelix-lead-engine
pip install -r requirements.txt
pip install -r requirements-dev.txt
pre-commit install
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support & Community**

- **Documentation**: [docs.outrelix.com](https://docs.outrelix.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/outrelix-lead-engine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/outrelix-lead-engine/discussions)
- **Email**: support@outrelix.com

## 🎉 **Success Stories**

> *"Outrelix Lead Engine helped us increase our qualified lead pipeline by 300% in just 3 months!"* - **Sales Director, TechCorp**

> *"The advanced analytics and lead scoring have transformed how we prioritize prospects."* - **Marketing Manager, GrowthAgency**

> *"Finally, a lead generation tool that actually delivers quality, not just quantity."* - **CEO, StartupXYZ**

---

**Built with ❤️ by the Outrelix Team**

*Transform your lead generation. Scale your sales. Dominate your market.*

