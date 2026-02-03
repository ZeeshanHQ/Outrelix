# ⚡ Quick Start Guide - See All Errors in Terminal

## 🎯 How to Run UI & See Errors

### **Method 1: Easy Way (Recommended)**

```bash
# 1. Set environment variables (REQUIRED)
export OUTRELIX_JWT_SECRET="your-secret-key-here-min-32-chars"
export OUTRELIX_ADMIN_EMAIL="admin@example.com"
export OUTRELIX_ADMIN_PASSWORD="YourPassword123!"

# 2. Start server (shows all errors clearly)
python start_server.py
```

**All errors appear in the terminal!** ✅

### **Method 2: Direct uvicorn**

```bash
# 1. Set environment variables
export OUTRELIX_JWT_SECRET="your-secret-key"
export OUTRELIX_ADMIN_EMAIL="admin@example.com"
export OUTRELIX_ADMIN_PASSWORD="YourPassword123!"

# 2. Start server
uvicorn src.server.app:app --reload --host 0.0.0.0 --port 8000
```

**All errors appear in the terminal!** ✅

## 📍 Where Errors Show Up

### **ALL ERRORS APPEAR IN THE TERMINAL WHERE YOU RUN THE COMMAND**

1. **Startup Errors** → Show immediately when you run `python start_server.py` or `uvicorn`
2. **Runtime Errors** → Show while server is running (API calls, pipeline errors, etc.)
3. **Log Format:** `YYYY-MM-DD HH:MM:SS | LEVEL | module | message`

## 🔍 Example Error Output

### ✅ Success (No Errors):
```
2024-12-19 10:30:45 | INFO | src.server.app | ✅ Security configuration validated
2024-12-19 10:30:45 | INFO | uvicorn | Started server process
2024-12-19 10:30:45 | INFO | uvicorn | Uvicorn running on http://0.0.0.0:8000
```

### ❌ Error Example:
```
2024-12-19 10:30:45 | ERROR | src.server.app | OUTRELIX_JWT_SECRET must be set to a strong secret.
RuntimeError: OUTRELIX_JWT_SECRET must be set to a strong secret.
```

## 🛠️ Common Errors & Quick Fixes

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: No module named 'fastapi'` | `pip install -r requirements.txt` |
| `OUTRELIX_JWT_SECRET must be set` | `export OUTRELIX_JWT_SECRET="your-secret"` |
| `Address already in use` | Change port: `export SERVER_PORT=8001` |
| `Port 8000 is already in use` | Kill process or use different port |

## 🌐 Access UI After Starting

1. Open browser: **http://localhost:8000**
2. Login with: `OUTRELIX_ADMIN_EMAIL` / `OUTRELIX_ADMIN_PASSWORD`
3. Fill form and run lead generation

## 💡 Pro Tips

- **Use `start_server.py`** - It checks everything before starting
- **Watch terminal** - All errors/logs appear there
- **Check logs** - Look for `ERROR` or `WARNING` messages
- **Test health** - `curl http://localhost:8000/health` to verify server is up

## 🛑 Stop Server

Press `Ctrl+C` in the terminal

---

**Remember: All errors show in the terminal where you run the command!** 🎯

