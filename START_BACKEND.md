# Start Backend for Real-Time Communication

## Problem
Currently, users can't communicate with each other because the WebSocket is mocked (simulated locally in each browser).

## Solution
Start the FastAPI backend server to enable real WebSocket communication between users.

## Quick Start

### Step 1: Install Backend Dependencies

Open a terminal in the backend folder:

```bash
cd enigma-forge-ui-main/hbss-backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Start Backend Server

```bash
python main.py
```

You should see:
```
🚀 HBSS LiveChat Backend Server Starting...
📡 WebSocket endpoint: ws://localhost:8000/ws
✓ Server ready for connections
```

### Step 3: Update Frontend to Use Real WebSocket

The frontend is currently using a mock WebSocket. You need to connect to the real backend.

## What the Backend Does

✅ **Real WebSocket Server** - Broadcasts messages to all connected users  
✅ **Message History** - Stores last 20 messages  
✅ **User Management** - Tracks online users  
✅ **HBSS Verification** - Server-side signature storage  

## Current Setup (Mock)

```typescript
// This only works for single user (no real communication)
const mockWs = {
  send: (data: string) => {
    // Only echoes back to same user
    setTimeout(() => {
      handleIncomingMessage(parsed);
    }, 100);
  }
};
```

## Real Setup (Backend Required)

```typescript
// This enables real communication between users
const websocket = new WebSocket('ws://localhost:8000/ws');
websocket.onmessage = (event) => {
  // Receives messages from ALL users
  handleIncomingMessage(JSON.parse(event.data));
};
```

## Do You Want Me To:

1. **Update the frontend** to connect to the real backend?
2. **Keep it simple** with mock WebSocket (no backend needed, but no real communication)?

Let me know and I'll update the code accordingly!
