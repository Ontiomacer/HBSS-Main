# HBSS Discord - Post-Quantum Secure Chat

A Discord-like real-time messaging application with Google OAuth and HBSS (Hash-Based Stateless Signatures) for quantum-resistant message authentication.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Google Cloud OAuth credentials

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_CLIENT_ID="your-google-client-id"
export JWT_SECRET="your-secret-key"

# Run server
uvicorn main:app --reload --port 8000
```

Backend runs on: **http://localhost:8000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env
echo "VITE_GOOGLE_CLIENT_ID=your-google-client-id" > .env

# Run development server
npm run dev
```

Frontend runs on: **http://localhost:5174**

## ✨ Features

- ✅ **Google OAuth2 Login**: Secure authentication
- ✅ **HBSS Signatures**: Post-quantum message signing
- ✅ **Real-Time Chat**: WebSocket-based messaging
- ✅ **Channel System**: Discord-like channels
- ✅ **Message Verification**: Visual signature validation
- ✅ **SQLite Database**: Persistent message storage
- ✅ **User Profiles**: Google avatar and name

## 🔐 Security

### HBSS Integration
- Keys generated client-side on login
- Messages signed before sending
- Signatures verified on receipt
- Visual indicators for verification status

### Authentication
- Google OAuth2 for user identity
- JWT tokens for API/WebSocket auth
- Secure token storage in localStorage

## 📊 Architecture

```
Frontend (React)          Backend (FastAPI)         Database (SQLite)
     |                          |                          |
     |-- Google Login --------->|                          |
     |<-- JWT Token ------------|                          |
     |                          |                          |
     |-- WebSocket Connect ---->|                          |
     |<-- Message History -------|<-- Query Messages ------|
     |                          |                          |
     |-- Send Message --------->|-- Save Message --------->|
     |<-- Broadcast ------------|                          |
```

## 🎨 UI Components

### Login Screen
- Google Sign-In button
- HBSS key generation
- Security information

### Main Interface
- **Sidebar**: Channel list, user profile
- **Chat Area**: Message feed, input box
- **Message Items**: Avatar, name, timestamp, verification status

## 📡 API Endpoints

### REST API
- `POST /auth/google` - Authenticate with Google
- `GET /users/me` - Get current user
- `GET /channels` - List all channels
- `POST /channels` - Create new channel
- `GET /channels/{id}/messages` - Get channel messages

### WebSocket
- `WS /ws/{channel_id}?token={jwt}` - Real-time messaging

## 🗄️ Database Schema

### Users
- Google ID, email, name, avatar
- HBSS commitment array (public key)
- Timestamps

### Channels
- Name, description
- Creator, timestamps

### Messages
- Content, HBSS signature
- User, channel references
- Timestamps

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:5174`, `http://localhost:8000`
6. Copy Client ID

### Environment Variables

**Backend** (`.env` or export):
```bash
GOOGLE_CLIENT_ID=your-google-client-id
JWT_SECRET=your-secret-key-change-in-production
```

**Frontend** (`.env`):
```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

### Create Test Channels
```python
from database import SessionLocal
from models import Channel

db = SessionLocal()
channels = [
    Channel(name="general", description="General chat", created_by=1),
    Channel(name="research", description="Research topics", created_by=1),
]
for c in channels:
    db.add(c)
db.commit()
```

### Test WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/1?token=YOUR_TOKEN');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 📚 Documentation

- **Complete Guide**: See `../HBSS_DISCORD_IMPLEMENTATION.md`
- **HBSS Algorithm**: See `../HBSS_GUIDE.md`
- **API Reference**: See backend `main.py` docstrings

## 🐛 Troubleshooting

**Backend won't start**:
- Check Python version (3.8+)
- Verify all dependencies installed
- Check port 8000 is available

**Google login fails**:
- Verify Client ID is correct
- Check authorized origins in Google Console
- Ensure localhost is allowed

**WebSocket connection fails**:
- Check JWT token is valid
- Verify backend is running
- Check browser console for errors

**Messages not verifying**:
- Ensure HBSS keys generated on login
- Check commitment sent to backend
- Verify signature format matches

## 🚀 Production Deployment

### Checklist
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS/WSS
- [ ] Configure production OAuth
- [ ] Set secure JWT_SECRET
- [ ] Add rate limiting
- [ ] Enable logging
- [ ] Set up monitoring
- [ ] Configure backups

## 📄 License

MIT License

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

**Built with ❤️ for a quantum-safe future**

Last Updated: November 2025
Version: 1.0.0
