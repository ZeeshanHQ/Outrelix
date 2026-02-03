# 🚀 How to Start the UI Server & See Errors

## Quick Start

### 1. Set Required Environment Variables

Create a `.env` file in the project root OR export them:

```bash
# REQUIRED - Set these before starting!
export OUTRELIX_JWT_SECRET="your-strong-secret-key-min-32-chars"
export OUTRELIX_ADMIN_EMAIL="admin@yourdomain.com"
export OUTRELIX_ADMIN_PASSWORD="your-strong-password"

# OPTIONAL - Recommended
export ENABLE_OVERPASS="true"
export ENABLE_EMBED_SCORING="true"
export ENABLE_EMBED_DEDUPE="true"
```

**Example values (CHANGE THESE!):**
```bash
OUTRELIX_JWT_SECRET="sk_live_abc123xyz789secretkey456def"
OUTRELIX_ADMIN_EMAIL="admin@outrelix.com"
OUTRELIX_ADMIN_PASSWORD="SecurePass123!@#"
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt

# For AI features (optional but recommended):
pip install sentence-transformers
```

### 3. Start Server (Easy Way)

```bash
python start_server.py
```

This script will:
- ✅ Check if dependencies are installed
- ✅ Check if environment variables are set
- ✅ Show clear error messages if something is wrong
- ✅ Start the server with proper logging

### 4. Start Server (Manual Way)

```bash
uvicorn src.server.app:app --reload --host 0.0.0.0 --port 8000
```

## 📍 Where to See Errors

### **All errors appear in the terminal where you run uvicorn/start_server.py**

1. **Startup Errors** - Appear immediately when you run the command
   - Missing packages
   - Missing environment variables
   - Port already in use
   - Import errors

2. **Runtime Errors** - Appear while server is running
   - API request errors
   - Pipeline errors
   - Database errors

3. **Log Format:**
   ```
   YYYY-MM-DD HH:MM:SS | LEVEL | module | message
   ```

### Example Error Output:

```
2024-12-19 10:30:45 | ERROR | src.server.app | Missing OUTRELIX_JWT_SECRET
2024-12-19 10:30:45 | ERROR | src.server.app | Server startup failed
```

## 🔍 Common Errors & Fixes

### Error: "ModuleNotFoundError: No module named 'fastapi'"
**Fix:** `pip install -r requirements.txt`

### Error: "Address already in use"
**Fix:** Change port: `export SERVER_PORT=8001` or kill process using port 8000

### Error: "OUTRELIX_JWT_SECRET must be set"
**Fix:** Set environment variable before starting:
```bash
export OUTRELIX_JWT_SECRET="your-secret-here"
python start_server.py
```

### Error: "Port 8000 is already in use"
**Fix:** 
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

## 🌐 Access the UI

Once started successfully, open:
- **URL:** http://localhost:8000
- **Login:** Use the email/password you set in `OUTRELIX_ADMIN_EMAIL` and `OUTRELIX_ADMIN_PASSWORD`

## 📊 Check Server Status

The terminal will show:
- ✅ Server started successfully
- 🌐 URL to access
- 📝 All API requests and errors
- 🔄 Pipeline run progress

## 🛑 Stop the Server

Press `Ctrl+C` in the terminal where uvicorn is running

## 💡 Debugging Tips

1. **Check terminal output** - All errors appear there
2. **Use `--reload` flag** - Auto-restarts on code changes
3. **Check logs** - Look for ERROR or WARNING messages
4. **Test API directly** - `curl http://localhost:8000/health`

## 📝 Example .env File

Create `.env` in project root:

```env
# Security (REQUIRED)
OUTRELIX_JWT_SECRET=sk_live_your_secret_key_here_min_32_chars
OUTRELIX_ADMIN_EMAIL=admin@yourdomain.com
OUTRELIX_ADMIN_PASSWORD=YourSecurePassword123!

# Features (OPTIONAL)
ENABLE_OVERPASS=true
ENABLE_EMBED_SCORING=true
ENABLE_EMBED_DEDUPE=true

# Server (OPTIONAL)
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
SERVER_RELOAD=true
```



