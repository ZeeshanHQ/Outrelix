# Outrelix - AI-Powered Lead Generation Engine

Welcome to the organized Outrelix codebase. The project has been restructured for clarity, maintainability, and high performance.

## 🏗️ Architecture

The project is divided into two primary directories:

### 1. `backend/`
This is the heart of the platform, containing the **AI Lead Generation Engine** and the **FastAPI Server**.
- `api/`: FastAPI endpoints, AI services, and email handlers.
- `core/`: The neural lead extraction engine (pipeline, models, etc.).
- `extractors/`: Highly targeted scraper APIs (Google Maps, YellowPages, Yelp, etc.).
- `services/`: Business logic for outreach campaigns and smart reply detection.
- `main.py`: The backend entry point.
- `requirements.txt`: Consolidated Python dependencies.

### 2. `frontend/`
A self-contained React frontend built with Tailwind CSS and Framer Motion.
- `src/`: Modern, "Obsidian Elite" themed React components and pages.
- `public/`: Static assets and icons.
- `package.json`: Frontend-specific Node dependencies and scripts.

## 🚀 Getting Started

### Backend
1. Navigate to `backend/`
2. Install dependencies: `pip install -r requirements.txt`
3. Start the server: `python main.py`

### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install` (if node_modules not present)
3. Start the dev server: `npm start`

## ⚙️ Core Components
- **Neural Lead Extraction**: Bypasses traditional scrapers using AI agents.
- **Smart Outreach**: Automated follow-ups with empathy-driven AI icebreakers.
- **Obsidian Theme**: A high-performance, elite dark aesthetic.

---
*Organized for Excellence.*
