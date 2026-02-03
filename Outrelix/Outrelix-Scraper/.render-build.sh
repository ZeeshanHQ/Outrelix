#!/bin/bash
# Build script for Render
# This ensures we're in the right directory and install dependencies

echo "🔨 Building Lead Engine..."

# Check if we're in Outrelix-Scraper directory
if [ -f "requirements.txt" ]; then
    echo "✅ Found requirements.txt, installing dependencies..."
    pip install -r requirements.txt
else
    echo "❌ requirements.txt not found in current directory"
    echo "📁 Current directory: $(pwd)"
    echo "📂 Contents: $(ls -la)"
    exit 1
fi

echo "✅ Build complete!"


