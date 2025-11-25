"""
HBSS LiveChat Backend Server
FastAPI + WebSocket for real-time post-quantum secure messaging
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
from datetime import datetime

app = FastAPI(title="HBSS LiveChat Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections with user info
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, Dict] = {}  # username -> {websocket, user_info}

    async def register_user(self, websocket: WebSocket, username: str, user_info: dict):
        """Register a user after websocket is already accepted"""
        self.user_connections[username] = {
            "websocket": websocket,
            "user_info": user_info
        }
        print(f"✓ User {username} registered. Total connections: {len(self.active_connections)}")
        
        # Broadcast user joined
        await self.broadcast({
            "type": "system",
            "message": f"{username} joined the chat",
            "timestamp": datetime.now().isoformat()
        }, exclude=websocket)
        
        # Send online users list to new user
        online_users = list(self.user_connections.keys())
        await self.send_personal_message({
            "type": "users",
            "users": online_users
        }, websocket)

    def disconnect(self, websocket: WebSocket, username: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if username and username in self.user_connections:
            del self.user_connections[username]
        
        print(f"✗ User disconnected. Total connections: {len(self.active_connections)}")
        
        # Broadcast user left
        if username:
            import asyncio
            asyncio.create_task(self.broadcast({
                "type": "system",
                "message": f"{username} left the chat",
                "timestamp": datetime.now().isoformat()
            }))

    async def broadcast(self, message: dict, exclude: WebSocket = None):
        """Broadcast message to all connected clients except sender"""
        disconnected = []
        for connection in self.active_connections:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending to client: {e}")
                    disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")

manager = ConnectionManager()

# Message history (in-memory)
message_history: List[Dict] = []
MAX_HISTORY = 100

@app.get("/")
async def root():
    return {
        "service": "HBSS LiveChat Backend",
        "version": "2.0.0",
        "status": "running",
        "active_connections": len(manager.active_connections),
        "endpoints": {
            "websocket": "/ws",
            "health": "/health",
            "stats": "/stats"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "active_connections": len(manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/stats")
async def get_stats():
    return {
        "total_messages": len(message_history),
        "active_users": len(manager.user_connections),
        "active_connections": len(manager.active_connections),
        "users_online": list(manager.user_connections.keys())
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for HBSS LiveChat
    
    Message format:
    {
        "type": "join" | "message" | "leave",
        "sender": "username",
        "message": "text content",
        "signature": {...},  # HBSS signature object
        "commitment": "...", # Public key commitment root
        "timestamp": 1234567890
    }
    """
    username = None
    
    try:
        await websocket.accept()
        print(f"✓ WebSocket connection accepted")
        
        # Add to active connections immediately
        manager.active_connections.append(websocket)
        
        # Send welcome message
        await websocket.send_json({
            "type": "system",
            "message": "Connected to HBSS LiveChat",
            "timestamp": datetime.now().timestamp()
        })
        
        # Send recent message history
        if message_history:
            await websocket.send_json({
                "type": "history",
                "messages": message_history[-20:]  # Last 20 messages
            })
        
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            message_type = data.get("type", "message")
            
            if message_type == "join":
                # User joining
                username = data.get("sender")
                if username:
                    user_info = {
                        "name": username,
                        "commitment": data.get("commitment", "")
                    }
                    manager.user_connections[username] = {
                        "websocket": websocket,
                        "user_info": user_info
                    }
                    print(f"✓ User {username} joined. Total connections: {len(manager.active_connections)}")
                    
                    # Broadcast user joined
                    await manager.broadcast({
                        "type": "system",
                        "message": f"{username} joined the chat",
                        "timestamp": datetime.now().isoformat()
                    }, exclude=websocket)
                    
                    # Send online users list
                    online_users = list(manager.user_connections.keys())
                    await websocket.send_json({
                        "type": "users",
                        "users": online_users
                    })
            
            elif message_type == "message":
                # Regular chat message with HBSS signature
                sender = data.get("sender", "Anonymous")
                message_text = data.get("message", "")
                signature = data.get("signature", {})
                commitment = data.get("commitment", "")
                
                # Create message object
                chat_message = {
                    "type": "message",
                    "id": data.get("id", str(datetime.now().timestamp())),
                    "sender": sender,
                    "senderAvatar": data.get("senderAvatar", ""),
                    "message": message_text,
                    "signature": signature,
                    "commitment": commitment,
                    "timestamp": data.get("timestamp", datetime.now().timestamp())
                }
                
                # Store in history
                message_history.append(chat_message)
                if len(message_history) > MAX_HISTORY:
                    message_history.pop(0)
                
                # Broadcast to all other clients
                await manager.broadcast(chat_message, exclude=websocket)
                
                print(f"📨 Message from {sender}: {message_text[:50]}...")
            
            elif message_type == "leave":
                # User leaving
                username = data.get("sender")
                if username:
                    manager.disconnect(websocket, username)
    
    except WebSocketDisconnect:
        if username:
            manager.disconnect(websocket, username)
        print(f"✗ WebSocket disconnected")
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        if username:
            manager.disconnect(websocket, username)

@app.on_event("startup")
async def startup_event():
    print("=" * 60)
    print("🚀 HBSS LiveChat Backend Server Starting...")
    print("=" * 60)
    print("📡 WebSocket endpoint: ws://localhost:8000/ws")
    print("🌐 HTTP endpoint: http://localhost:8000")
    print("📊 Stats endpoint: http://localhost:8000/stats")
    print("💚 Health check: http://localhost:8000/health")
    print("=" * 60)
    print("✓ Server ready for connections")
    print("=" * 60)

@app.on_event("shutdown")
async def shutdown_event():
    print("\n" + "=" * 60)
    print("🛑 HBSS LiveChat Backend Server Shutting Down...")
    print("=" * 60)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
