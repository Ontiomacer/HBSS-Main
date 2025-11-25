"""
HBSS Discord Backend
FastAPI + WebSocket + Google OAuth + SQLite
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import json
import jwt
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os

from database import get_db, engine
from models import Base, User, Channel, Message
from schemas import UserCreate, ChannelCreate, MessageCreate, UserResponse, ChannelResponse, MessageResponse

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HBSS Discord Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id")

security = HTTPBearer()

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, channel_id: str, user_id: str):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []
        self.active_connections[channel_id].append(websocket)
        self.user_connections[user_id] = websocket
        print(f"✓ User {user_id} connected to channel {channel_id}")

    def disconnect(self, websocket: WebSocket, channel_id: str, user_id: str):
        if channel_id in self.active_connections:
            if websocket in self.active_connections[channel_id]:
                self.active_connections[channel_id].remove(websocket)
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        print(f"✗ User {user_id} disconnected from channel {channel_id}")

    async def broadcast(self, message: dict, channel_id: str, exclude: WebSocket = None):
        """Broadcast message to all clients in a channel"""
        if channel_id not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[channel_id]:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting: {e}")
                    disconnected.append(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            if conn in self.active_connections[channel_id]:
                self.active_connections[channel_id].remove(conn)

manager = ConnectionManager()

# JWT Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@app.get("/")
async def root():
    return {
        "service": "HBSS Discord Backend",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/auth/google",
            "channels": "/channels",
            "websocket": "/ws/{channel_id}"
        }
    }

@app.post("/auth/google")
async def google_auth(token: dict, db: Session = Depends(get_db)):
    """
    Authenticate user with Google OAuth token
    """
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token["credential"],
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        # Extract user info
        google_id = idinfo["sub"]
        email = idinfo["email"]
        name = idinfo.get("name", email)
        avatar = idinfo.get("picture", "")
        
        # Check if user exists
        user = db.query(User).filter(User.google_id == google_id).first()
        
        if not user:
            # Create new user
            user = User(
                google_id=google_id,
                email=email,
                name=name,
                avatar=avatar,
                commitment_array=token.get("commitment", "")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update user info
            user.name = name
            user.avatar = avatar
            user.last_login = datetime.utcnow()
            if token.get("commitment"):
                user.commitment_array = token["commitment"]
            db.commit()
        
        # Create JWT token
        access_token = create_access_token({"sub": str(user.id), "email": user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "avatar": user.avatar,
                "commitment": user.commitment_array
            }
        }
    
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")

@app.get("/users/me")
async def get_current_user(payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """Get current user info"""
    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)

@app.get("/channels", response_model=List[ChannelResponse])
async def get_channels(db: Session = Depends(get_db), payload: dict = Depends(verify_token)):
    """Get all channels"""
    channels = db.query(Channel).all()
    return channels

@app.post("/channels", response_model=ChannelResponse)
async def create_channel(
    channel: ChannelCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token)
):
    """Create a new channel"""
    user_id = int(payload["sub"])
    
    # Check if channel exists
    existing = db.query(Channel).filter(Channel.name == channel.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Channel already exists")
    
    new_channel = Channel(
        name=channel.name,
        description=channel.description,
        created_by=user_id
    )
    db.add(new_channel)
    db.commit()
    db.refresh(new_channel)
    return new_channel

@app.get("/channels/{channel_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    channel_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_token)
):
    """Get messages from a channel"""
    messages = db.query(Message).filter(
        Message.channel_id == channel_id
    ).order_by(Message.created_at.desc()).limit(limit).all()
    
    # Reverse to get chronological order
    messages.reverse()
    
    return messages

@app.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: str, db: Session = Depends(get_db)):
    """
    WebSocket endpoint for real-time messaging
    """
    user_id = None
    
    try:
        # Get token from query params
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=4001, reason="No token provided")
            return
        
        # Verify token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload["sub"]
        except jwt.JWTError:
            await websocket.close(code=4001, reason="Invalid token")
            return
        
        # Get user
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            await websocket.close(code=4004, reason="User not found")
            return
        
        # Connect
        await manager.connect(websocket, channel_id, user_id)
        
        # Send recent messages
        recent_messages = db.query(Message).filter(
            Message.channel_id == int(channel_id)
        ).order_by(Message.created_at.desc()).limit(20).all()
        
        recent_messages.reverse()
        
        await websocket.send_json({
            "type": "history",
            "messages": [
                {
                    "id": msg.id,
                    "user": {
                        "id": msg.user.id,
                        "name": msg.user.name,
                        "avatar": msg.user.avatar,
                        "commitment": msg.user.commitment_array
                    },
                    "message": msg.content,
                    "signature": json.loads(msg.signature) if msg.signature else {},
                    "timestamp": msg.created_at.isoformat()
                }
                for msg in recent_messages
            ]
        })
        
        # Listen for messages
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "message":
                # Save message to database
                message = Message(
                    channel_id=int(channel_id),
                    user_id=int(user_id),
                    content=data.get("message", ""),
                    signature=json.dumps(data.get("signature", {}))
                )
                db.add(message)
                db.commit()
                db.refresh(message)
                
                # Broadcast to all clients in channel
                broadcast_data = {
                    "type": "message",
                    "id": message.id,
                    "user": {
                        "id": user.id,
                        "name": user.name,
                        "avatar": user.avatar,
                        "commitment": user.commitment_array
                    },
                    "message": data.get("message", ""),
                    "signature": data.get("signature", {}),
                    "timestamp": message.created_at.isoformat()
                }
                
                await manager.broadcast(broadcast_data, channel_id, exclude=websocket)
    
    except WebSocketDisconnect:
        if user_id:
            manager.disconnect(websocket, channel_id, user_id)
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        if user_id:
            manager.disconnect(websocket, channel_id, user_id)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "active_channels": len(manager.active_connections),
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
