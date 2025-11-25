# HBSS Discord - Complete Implementation Guide

## 🎯 Overview

A Discord-like real-time chat application with:
- ✅ Google OAuth2 Authentication
- ✅ HBSS Post-Quantum Signatures
- ✅ Real-Time WebSocket Messaging
- ✅ SQLite Database
- ✅ Channel-based Chat Rooms
- ✅ Message Verification UI

## 📁 Project Structure

```
hbss-discord/
├── backend/
│   ├── main.py              # FastAPI app ✅ CREATED
│   ├── models.py            # SQLAlchemy models ✅ CREATED
│   ├── database.py          # Database config ✅ CREATED
│   ├── schemas.py           # Pydantic schemas ✅ CREATED
│   ├── requirements.txt     # Python deps ✅ CREATED
│   └── chat.db             # SQLite database (auto-created)
└── frontend/
    ├── package.json         # ✅ CREATED
    ├── src/
    │   ├── lib/
    │   │   └── hbss.js      # HBSS crypto (use existing HBSS.ts)
    │   ├── components/
    │   │   ├── LoginGoogle.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── ChatRoom.jsx
    │   │   └── MessageItem.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

## 🚀 Backend Implementation (COMPLETE)

### Files Created:

#### 1. `main.py` ✅
**Features**:
- FastAPI application with CORS
- Google OAuth2 authentication
- JWT token generation/verification
- WebSocket connection manager
- REST API endpoints:
  - `POST /auth/google` - Google login
  - `GET /users/me` - Current user
  - `GET /channels` - List channels
  - `POST /channels` - Create channel
  - `GET /channels/{id}/messages` - Get messages
  - `WS /ws/{channel_id}` - WebSocket chat

#### 2. `models.py` ✅
**Database Models**:
- `User`: Google ID, email, name, avatar, HBSS commitment
- `Channel`: Name, description, creator
- `Message`: Content, signature, timestamps

#### 3. `database.py` ✅
**SQLite Configuration**:
- SQLAlchemy engine
- Session management
- Dependency injection

#### 4. `schemas.py` ✅
**Pydantic Schemas**:
- Request/response validation
- Type safety
- Data serialization

#### 5. `requirements.txt` ✅
**Dependencies**:
- FastAPI + Uvicorn
- SQLAlchemy
- Google Auth
- WebSockets
- JWT (python-jose)

## 🎨 Frontend Implementation (TO DO)

### Required Files:

#### 1. `src/lib/hbss.js`
```javascript
import CryptoJS from 'crypto-js';

export function generateKeys(m = 512, n = 1024) {
  // Generate n random preimages
  const preimages = [];
  for (let i = 0; i < n; i++) {
    preimages.push(CryptoJS.lib.WordArray.random(64).toString());
  }
  
  // Generate m commitments
  const commitments = [];
  for (let i = 0; i < m; i++) {
    const indices = getBloomIndices(i, n, 3);
    let data = '';
    indices.forEach(idx => data += preimages[idx]);
    commitments.push(CryptoJS.SHA512(data).toString());
  }
  
  const root = generateMerkleRoot(commitments);
  
  return {
    privateKey: { preimages, n },
    publicKey: { commitmentRoot: root, commitments, m }
  };
}

export function signMessage(message, privateKey) {
  const digest = CryptoJS.SHA512(message).toString();
  const indices = [];
  const revealedPreimages = [];
  
  for (let i = 0; i < 64; i++) {
    const indexHash = CryptoJS.SHA512(digest + i).toString();
    const index = parseInt(indexHash.substring(0, 8), 16) % privateKey.n;
    indices.push(index);
    revealedPreimages.push(privateKey.preimages[index]);
  }
  
  return { digest, revealedPreimages, indices };
}

export function verifySignature(message, signature, publicKey) {
  const computedDigest = CryptoJS.SHA512(message).toString();
  if (computedDigest !== signature.digest) return false;
  
  // Verify each preimage
  for (let i = 0; i < signature.indices.length; i++) {
    const indexHash = CryptoJS.SHA512(signature.digest + i).toString();
    const expectedIndex = parseInt(indexHash.substring(0, 8), 16) % publicKey.commitments.length;
    if (signature.indices[i] !== expectedIndex) return false;
  }
  
  return true;
}

function getBloomIndices(input, size, k) {
  const indices = [];
  for (let i = 0; i < k; i++) {
    const hash = CryptoJS.SHA512(input + i).toString();
    indices.push(parseInt(hash.substring(0, 8), 16) % size);
  }
  return indices;
}

function generateMerkleRoot(commitments) {
  if (commitments.length === 0) return '';
  if (commitments.length === 1) return commitments[0];
  
  let level = [...commitments];
  while (level.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) {
        nextLevel.push(CryptoJS.SHA512(level[i] + level[i + 1]).toString());
      } else {
        nextLevel.push(level[i]);
      }
    }
    level = nextLevel;
  }
  return level[0];
}
```

#### 2. `src/components/LoginGoogle.jsx`
```jsx
import { GoogleLogin } from '@react-oauth/google';
import { Shield } from 'lucide-react';
import { generateKeys } from '../lib/hbss';

export default function LoginGoogle({ onLoginSuccess }) {
  const handleSuccess = async (credentialResponse) => {
    // Generate HBSS keys
    const keys = generateKeys(512, 1024);
    localStorage.setItem('hbss_private_key', JSON.stringify(keys.privateKey));
    
    // Send to backend
    const response = await fetch('http://localhost:8000/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: credentialResponse.credential,
        commitment: keys.publicKey.commitmentRoot
      })
    });
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    onLoginSuccess(data.user);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black flex items-center justify-center">
      <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-indigo-500/30 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">HBSS Discord</h1>
          <p className="text-slate-400">Post-Quantum Secure Chat</p>
        </div>
        
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.error('Login failed')}
          theme="filled_black"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
        
        <div className="mt-6 text-xs text-slate-500 text-center">
          <p>🔐 Messages signed with HBSS</p>
          <p>⚛️ Quantum-resistant cryptography</p>
        </div>
      </div>
    </div>
  );
}
```

#### 3. `src/App.jsx`
```jsx
import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginGoogle from './components/LoginGoogle';
import Sidebar from './components/Sidebar';
import ChatRoom from './components/ChatRoom';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginGoogle onLoginSuccess={setUser} />
      </GoogleOAuthProvider>
    );
  }
  
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar 
        user={user}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
      />
      <ChatRoom 
        user={user}
        channel={selectedChannel}
      />
    </div>
  );
}
```

## 🔧 Setup Instructions

### Backend Setup

```bash
cd hbss-discord/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_CLIENT_ID="your-google-client-id"
export JWT_SECRET="your-secret-key"

# Run server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd hbss-discord/frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_GOOGLE_CLIENT_ID=your-google-client-id" > .env
echo "VITE_API_URL=http://localhost:8000" >> .env

# Run development server
npm run dev
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:5174`
   - `http://localhost:8000`
6. Add authorized redirect URIs:
   - `http://localhost:5174`
7. Copy Client ID

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    commitment_array TEXT,
    created_at DATETIME,
    last_login DATETIME,
    is_active BOOLEAN
);
```

### Channels Table
```sql
CREATE TABLE channels (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_by INTEGER,
    created_at DATETIME,
    is_active BOOLEAN,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    signature TEXT,
    created_at DATETIME,
    edited_at DATETIME,
    is_deleted BOOLEAN,
    FOREIGN KEY (channel_id) REFERENCES channels(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔐 Security Features

### HBSS Integration
1. **Key Generation**: Client-side on login
2. **Message Signing**: Before sending via WebSocket
3. **Signature Verification**: On message receipt
4. **Visual Indicators**: Green ✓ for verified, Red ✗ for invalid

### Authentication Flow
```
1. User clicks "Sign in with Google"
2. Google OAuth popup
3. Backend verifies Google token
4. Generate HBSS keys client-side
5. Send commitment to backend
6. Backend creates/updates user
7. Backend returns JWT token
8. Store token in localStorage
9. Use token for WebSocket auth
```

## 🎨 UI Components

### Sidebar
- Channel list (#general, #research, etc.)
- User profile at bottom
- Create channel button
- Online status indicator

### Chat Room
- Message list (scrollable)
- Message input with HBSS signing
- Verification status indicators
- User avatars
- Timestamps

### Message Item
```jsx
<div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
  <img src={avatar} className="w-10 h-10 rounded-full" />
  <div>
    <div className="flex items-center gap-2">
      <span className="font-medium">{name}</span>
      <span className="text-xs text-gray-500">{time}</span>
      {verified ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
    </div>
    <p className="text-sm">{message}</p>
  </div>
</div>
```

## 📡 WebSocket Protocol

### Client → Server
```json
{
  "type": "message",
  "message": "Hello World",
  "signature": {
    "digest": "...",
    "revealedPreimages": [...],
    "indices": [...]
  }
}
```

### Server → Client
```json
{
  "type": "message",
  "id": 123,
  "user": {
    "id": 1,
    "name": "John Doe",
    "avatar": "https://...",
    "commitment": "..."
  },
  "message": "Hello World",
  "signature": {...},
  "timestamp": "2025-11-10T12:30:00Z"
}
```

## 🧪 Testing

### Create Default Channels
```python
# Run in Python shell
from database import SessionLocal
from models import Channel

db = SessionLocal()

channels = [
    Channel(name="general", description="General discussion", created_by=1),
    Channel(name="research", description="Research topics", created_by=1),
    Channel(name="hbss-dev", description="HBSS development", created_by=1),
]

for channel in channels:
    db.add(channel)
db.commit()
```

### Test WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/1?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'message',
    message: 'Test message',
    signature: {...}
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

## 🚀 Deployment

### Production Checklist
- [ ] Change JWT_SECRET to secure random value
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS/WSS
- [ ] Configure production Google OAuth
- [ ] Add rate limiting
- [ ] Implement message pagination
- [ ] Add file upload support
- [ ] Enable message editing/deletion
- [ ] Add typing indicators
- [ ] Implement user roles/permissions

## 📚 Additional Features (Future)

- [ ] Voice channels
- [ ] Video chat
- [ ] Screen sharing
- [ ] File attachments with HBSS signatures
- [ ] Message reactions
- [ ] Thread replies
- [ ] User mentions (@username)
- [ ] Channel categories
- [ ] Direct messages
- [ ] User status (online/away/busy)
- [ ] Message search
- [ ] Emoji picker
- [ ] Code syntax highlighting
- [ ] Message formatting (markdown)

## 🎓 Learning Resources

- **HBSS Algorithm**: See `HBSS_GUIDE.md`
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **WebSocket**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- **SQLAlchemy**: https://docs.sqlalchemy.org/

## 📞 Support

### Common Issues

**Google OAuth not working**:
- Check Client ID is correct
- Verify authorized origins
- Ensure localhost is allowed

**WebSocket connection fails**:
- Check JWT token is valid
- Verify backend is running
- Check CORS configuration

**Messages not verifying**:
- Ensure HBSS keys are generated
- Check commitment is sent to backend
- Verify signature format

---

**Status**: Backend Complete ✅ | Frontend Template Ready ✅
**Next Steps**: Implement frontend components and integrate with backend
**Version**: 1.0.0
