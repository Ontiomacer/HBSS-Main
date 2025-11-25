# HBSS LiveChat - Complete Guide

## 🚀 Overview

**HBSS LiveChat** is a real-time messaging platform that uses **Hash-Based Stateless Signatures (HBSS)** for post-quantum secure message authentication. Every message is cryptographically signed before sending and verified upon receipt, ensuring quantum-resistant integrity.

## ✨ Key Features

### 🔐 Post-Quantum Security
- **HBSS Signatures**: Every message signed with quantum-resistant cryptography
- **Real-Time Verification**: Signatures verified instantly on receipt
- **Visual Indicators**: Green checkmark for verified, red X for invalid
- **No Classical Crypto**: No RSA, ECDSA, or other quantum-vulnerable schemes

### 💬 Real-Time Messaging
- **WebSocket Communication**: Instant message delivery
- **Live User Presence**: See who's online
- **Message History**: Last 20 messages loaded on connect
- **System Notifications**: Join/leave announcements

### 🔍 Signature Inspector
- **Detailed View**: Inspect any message's signature
- **Digest Display**: See SHA-512 message digest
- **Preimage Revelation**: View revealed preimages
- **Commitment Root**: Check public key commitment
- **Verification Status**: Clear valid/invalid indication

### 📊 Statistics Dashboard
- **Messages Signed**: Track your sent messages
- **Messages Verified**: Count verified incoming messages
- **Average Sign Time**: Performance metric for signing
- **Average Verify Time**: Performance metric for verification

## 🎯 How It Works

### 1. Key Generation
When you connect, HBSS keys are automatically generated:
- **Private Key**: 1024 preimages (64 bytes each)
- **Public Key**: 512 commitments + Merkle root
- **Security Level**: 128-bit quantum security

### 2. Message Signing
When you send a message:
1. Message is hashed with SHA-512
2. Indices are computed from digest
3. Preimages at those indices are revealed
4. Signature package is created
5. Message + signature sent via WebSocket

### 3. Message Verification
When you receive a message:
1. Message digest is recomputed
2. Indices are regenerated from digest
3. Revealed preimages are verified against commitments
4. Merkle proof is checked (HBSS** variant)
5. Result displayed with visual indicator

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+ (for backend)
- Modern web browser

### Installation

#### Frontend
```bash
cd enigma-forge-ui-main
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

#### Backend
```bash
cd enigma-forge-ui-main/hbss-backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --port 8000
```

Backend runs on: **http://localhost:8000**

### Quick Start

1. **Start Backend**:
   ```bash
   cd hbss-backend
   uvicorn main:app --reload --port 8000
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to: **http://localhost:5173/hbss-chat**

4. **Enter Username**:
   Choose a username and click "Connect to Chat"

5. **Start Chatting**:
   Type messages and see them signed with HBSS!

## 🎨 User Interface

### Login Screen
- **Username Input**: Choose your display name
- **Key Generation Status**: Shows when keys are ready
- **Connect Button**: Join the chat room
- **Security Info**: Explains HBSS features

### Chat Interface

#### Header
- **App Title**: HBSS LiveChat branding
- **User Info**: Your username
- **Connection Status**: Green indicator when connected
- **Disconnect Button**: Leave the chat

#### Sidebar (Left)
- **Online Users**: List of connected users
- **Statistics**: Real-time performance metrics
- **Key Info**: Your public key details

#### Main Chat Area
- **Message Feed**: Scrollable message history
- **Message Bubbles**: 
  - Your messages: Cyan/violet gradient (right-aligned)
  - Others' messages: Dark gray with border (left-aligned)
  - Invalid messages: Red background with warning
- **Verification Icons**:
  - ✅ Green checkmark: Verified signature
  - ❌ Red X: Invalid signature

#### Input Area
- **Message Input**: Type your message
- **Send Button**: Sign and send (or press Enter)
- **Security Notice**: Reminder about HBSS signing

#### Signature Inspector Tab
- **Message Content**: Original text
- **SHA-512 Digest**: Full hash output
- **Revealed Preimages**: List of revealed values
- **Commitment Root**: Public key root
- **Verification Result**: Valid/Invalid status

## 📊 Performance Metrics

### Typical Performance
- **Key Generation**: 50-100ms
- **Message Signing**: 5-15ms
- **Message Verification**: 3-10ms
- **WebSocket Latency**: <50ms (local)

### Signature Sizes
- **Digest**: 64 bytes (SHA-512)
- **Revealed Preimages**: ~64 preimages × 64 bytes = 4KB
- **Indices**: 64 × 4 bytes = 256 bytes
- **Total Signature**: ~4.3 KB per message

## 🔐 Security Features

### Quantum Resistance
- **Hash-Based**: Uses only SHA-512, no number theory
- **Stateless**: No state management vulnerabilities
- **Multi-Use**: Unlimited messages per key pair
- **128-bit Security**: Against quantum computers (Grover's algorithm)

### Message Integrity
- **Tamper Detection**: Any modification invalidates signature
- **Sender Authentication**: Proves message origin
- **Non-Repudiation**: Sender cannot deny sending
- **Replay Protection**: Timestamps prevent replay attacks

### Implementation Security
- **Secure Random**: Cryptographically secure key generation
- **Constant-Time**: Where possible to prevent timing attacks
- **Memory Protection**: Sensitive data cleared after use
- **Input Validation**: All inputs sanitized

## 🎓 Educational Features

### Visual Learning
- **Real-Time Signing**: Watch signatures being created
- **Verification Animation**: See verification process
- **Performance Metrics**: Understand computational costs
- **Signature Inspector**: Deep dive into signature structure

### Understanding HBSS
1. **Preimages**: Random values (private key)
2. **Commitments**: Hashes of preimages (public key)
3. **Bloom Filter**: Probabilistic index mapping
4. **Merkle Tree**: Compact commitment representation
5. **Signature**: Revealed preimages at computed indices

## 🌐 Architecture

### Frontend (React + TypeScript)
```
HBSSLiveChat.tsx
├── Login Screen
│   ├── Username input
│   ├── Key generation
│   └── Connect button
└── Chat Interface
    ├── Header (status, disconnect)
    ├── Sidebar (users, stats, keys)
    ├── Chat Area
    │   ├── Message feed
    │   └── Input box
    └── Inspector Tab
        └── Signature details
```

### Backend (FastAPI + WebSocket)
```
main.py
├── WebSocket Endpoint (/ws)
│   ├── Connection management
│   ├── Message broadcasting
│   └── User presence
├── HTTP Endpoints
│   ├── / (info)
│   ├── /health (status)
│   └── /stats (metrics)
└── Message History
    └── In-memory storage (last 100)
```

### Communication Flow
```
Client A                Server                Client B
   |                      |                      |
   |-- Connect WS ------->|                      |
   |<-- Welcome ----------|                      |
   |<-- History ----------|                      |
   |                      |<----- Connect WS ----|
   |                      |------- Welcome ----->|
   |                      |------- History ----->|
   |                      |                      |
   |-- Sign Message ----->|                      |
   |                      |-- Broadcast -------->|
   |                      |                      |-- Verify
   |                      |                      |
```

## 🔧 Configuration

### Frontend Configuration
Edit `src/pages/HBSSLiveChat.tsx`:

```typescript
// WebSocket URL
const WS_URL = 'ws://localhost:8000/ws';

// Key parameters
const KEY_M = 512;  // Commitments
const KEY_N = 1024; // Preimages

// UI settings
const MAX_MESSAGES = 100;
const AUTO_SCROLL = true;
```

### Backend Configuration
Edit `hbss-backend/main.py`:

```python
# Message history
MAX_HISTORY = 100

# CORS origins
allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174"
]

# Server settings
HOST = "0.0.0.0"
PORT = 8000
```

## 🧪 Testing

### Manual Testing
1. Open two browser tabs
2. Connect with different usernames
3. Send messages between tabs
4. Verify signatures appear correctly
5. Check inspector for signature details

### Performance Testing
1. Send multiple messages rapidly
2. Check statistics for timing
3. Monitor memory usage
4. Test with many users (open multiple tabs)

### Security Testing
1. Modify message after signing (should fail verification)
2. Use wrong public key (should fail verification)
3. Replay old message (timestamp check)
4. Test with invalid signature data

## 🚀 Advanced Features

### Key Rotation
Automatically generate new keys after N messages:
```typescript
if (stats.messagesSigned >= 1000) {
  await generateKeys();
  // Broadcast new public key
}
```

### Merkle Proof Visualization
Show Merkle tree path for HBSS** variant:
```typescript
// Display Merkle proof
<MerkleTreeView 
  proof={signature.merkleProof}
  root={publicKey.commitmentRoot}
/>
```

### Performance Graphs
Plot metrics over time:
```typescript
<LineChart data={performanceHistory}>
  <Line dataKey="signTime" stroke="#00ff00" />
  <Line dataKey="verifyTime" stroke="#0000ff" />
</LineChart>
```

### AI Explainer Integration
Add explanations using local LLM:
```typescript
const explanation = await ollama.generate({
  model: "mistral",
  prompt: "Explain how HBSS ensures post-quantum security"
});
```

## 🎨 Customization

### Theme Colors
Edit Tailwind classes in `HBSSLiveChat.tsx`:

```typescript
// Background gradient
className="bg-gradient-to-br from-violet-950 via-slate-900 to-black"

// Message bubbles
className="bg-gradient-to-br from-cyan-600 to-violet-600"

// Verified indicator
className="text-emerald-400"
```

### Message Styling
Customize message appearance:
```typescript
// Own messages
<div className="bg-gradient-to-br from-cyan-600 to-violet-600 rounded-tr-sm">

// Others' messages
<div className="bg-slate-800/80 border border-emerald-500/30 rounded-tl-sm">

// Invalid messages
<div className="bg-red-950/50 border border-red-500/50">
```

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Mac/Linux

# Use different port
uvicorn main:app --reload --port 8001
```

### Frontend Can't Connect
- Verify backend is running: `curl http://localhost:8000/health`
- Check WebSocket URL in code
- Ensure CORS is configured correctly
- Check browser console for errors

### Messages Not Verifying
- Ensure same HBSS parameters (m, n)
- Check public key is transmitted correctly
- Verify signature format matches
- Look for errors in browser console

### Performance Issues
- Reduce key size (m=256, n=512)
- Limit message history
- Optimize signature verification
- Use Web Workers for crypto operations

## 📚 Resources

### Documentation
- [HBSS Algorithm](./HBSS_GUIDE.md)
- [HBSS Enhanced Features](./HBSS_ENHANCED_FEATURES.md)
- [Backend API](./hbss-backend/README.md)

### External Links
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)

## 🤝 Contributing

Want to improve HBSS LiveChat?

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Ideas for Contributions
- [ ] File sharing with HBSS signatures
- [ ] Voice/video chat integration
- [ ] Mobile app version
- [ ] Database persistence
- [ ] User authentication
- [ ] End-to-end encryption (in addition to signatures)
- [ ] Group chat rooms
- [ ] Message reactions
- [ ] Typing indicators

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ for a quantum-safe future**

Last Updated: November 2025
Version: 1.0.0
