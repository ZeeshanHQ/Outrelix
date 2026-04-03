# -*- coding: utf-8 -*-
import os
import sys

# Add backend to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.main_api import app

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print("="*50)
    print(" OUTRELIX BACKEND - LEAD ENGINE STARTED ")
    print("="*50)
    print(f" Server running on: http://{host}:{port}")
    print(" AI Lead Engine: ACTIVE")
    print(" Email Automation: READY")
    print(" Scraper APIs: LOADED")
    print("")
    
    import logging
    # Configure logging for uvicorn and our app
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("outreach.log", encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    
    uvicorn.run(
        "api.main_api:app",
        host=host,
        port=port,
        reload=os.environ.get("ENV", "production") != "production",
        log_level="info"
    )
