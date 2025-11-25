# ✅ Enable Real-Time Communication Between Users

## Current Status
The frontend is now configured to connect to the real WebSocket backend, enabling communication between different users/browsers.

## Quick Start

### Step 1: Start the Backend

Open a **new terminal** and run:

```bash
cd enigma-forge-ui-main/hbss-backend

# Windows
start.bat

# Mac/Linux
chmod +x start.sh
./start.sh
```

Or manually:

```bash
cd enigma-forge-ui-main/hbss-backend

# Create virtual environment (first time only)
python -m venv venv

# Activate it
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies (first time only)
pip install -r requirements.txt

# Start server
python main.py
```

You should see:
```
========================================
🚀 HBSS LiveChat Backend Server Starting...
========================================
📡 WebSocket endpoint: ws://localhost:8000/ws
🌐 HTTP endpoint: http://localhost:8000
✓ Server ready for connections
========================================
```

### Step 2: Start the Frontend

In another terminal:

```bash
cd enigma-forge-ui-main
npm run dev
```

### Step 3: Test Real Communication

1. Open **Browser 1**: http://localhost:5174/hbss
2. Sign in with Clerk (e.g., "User A")
3. Open **Browser 2** (or incognito): http://localhost:5174/hbss
4. Sign in with different Clerk account (e.g., "User B")
5. **Send messages** - they will appear in both browsers! 🎉

## How It Works

### With Backend Running ✅
```
User A Browser ──┐
                 │
                 ├──► WebSocket Server ──► Broadcasts to all
                 │    (localhost:8000)
User B Browser ──┘
```

Both users can see each other's messages in real-time!

### Without Backend ❌
```
User A Browser ──► Mock WebSocket ──► Only User A sees messages
User B Browser ──► Mock WebSocket ──► Only User B sees messages
```

Users can't communicate (current issue in your screenshot).

## Features Enabled

✅ **Real-time messaging** between multiple users  
✅ **Message history** - Last 20 messages loaded on connect  
✅ **Online users list** - See who's connected  
✅ **User join/leave notifications**  
✅ **HBSS signature verification** for all messages  
✅ **Automatic reconnection** if connection drops  

## Fallback Mode

If the backend is not running, the app will:
1. Try to connect to `ws://localhost:8000/ws`
2. If it fails, fall back to mock mode (single user only)
3. Show console warning: "⚠️ Backend not running"

## Backend Requirements

The backend needs these packages (already in requirements.txt):
- fastapi
- uvicorn
- websockets
- python-multipart

## Troubleshooting

### Issue: "WebSocket error" in console
**Solution**: Start the backend server (see Step 1)

### Issue: Port 8000 already in use
**Solution**: 
- Stop other services on port 8000
- Or change port in `hbss-backend/main.py` (line with `port=8000`)

### Issue: Users still can't see each other's messages
**Solution**:
- Make sure backend is running (check terminal)
- Check browser console for WebSocket connection status
- Refresh both browsers

### Issue: "Module not found" errors in backend
**Solution**:
```bash
cd enigma-forge-ui-main/hbss-backend
pip install -r requirements.txt
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│                                                         │
│  User A Browser          User B Browser                │
│       │                        │                        │
│       │  WebSocket             │  WebSocket            │
│       │  Connection            │  Connection           │
│       └────────┬───────────────┘                        │
│                │                                        │
└────────────────┼────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI)                          │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  WebSocket Server (ws://localhost:8000/ws)        │ │
│  │                                                   │ │
│  │  - Accepts connections                            │ │
│  │  - Broadcasts messages to all clients             │ │
│  │  - Tracks online users                            │ │
│  │  - Stores message history (last 20)               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Message History (In-Memory)                      │ │
│  │  - Last 20 messages                               │ │
│  │  - Sent to new users on connect                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Message Flow

1. **User A** types "Hello" and clicks send
2. **Frontend** signs message with HBSS
3. **WebSocket** sends to backend: `{ type: "message", sender: "User A", message: "Hello", signature: {...} }`
4. **Backend** receives and broadcasts to ALL connected clients
5. **User B's browser** receives message
6. **Frontend** verifies HBSS signature
7. **User B** sees "Hello" from User A ✅

---

**Now users can communicate in real-time with quantum-safe signatures! 🚀**
