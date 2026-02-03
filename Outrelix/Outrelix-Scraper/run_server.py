#!/usr/bin/env python3
"""
Wrapper script for Render deployment
Handles PORT environment variable from Render
"""
import os
import sys

# Render uses $PORT, set it to SERVER_PORT for compatibility with start_server.py
if 'PORT' in os.environ and 'SERVER_PORT' not in os.environ:
    os.environ['SERVER_PORT'] = os.environ['PORT']

# Ensure we're in the right directory (should be Outrelix-Scraper)
# This helps if Render changes working directory
if os.path.basename(os.getcwd()) != 'Outrelix-Scraper':
    scraper_dir = os.path.join(os.getcwd(), 'Outrelix-Scraper')
    if os.path.exists(scraper_dir):
        os.chdir(scraper_dir)
        sys.path.insert(0, scraper_dir)

# Import and run the actual server
from start_server import main

if __name__ == "__main__":
    main()


