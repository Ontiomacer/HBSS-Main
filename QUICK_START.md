# 🚀 HBSS LiveChat - Quick Start Guide

## Prerequisites
- Node.js 18+
- Python 3.9+

## Start in 3 Steps

### 1️⃣ Start Backend (Terminal 1)
```bash
cd enigma-forge-ui-main/hbss-backend

# Windows
start.bat

# Mac/Linux
chmod +x start.sh && ./start.sh
```
✅ Backend running on **http://localhost:8000**

### 2️⃣ Start Frontend (Terminal 2)
```bash
cd enigma-forge-ui-main
npm run dev
```
✅ Frontend running on **http://localhost:5174**

### 3️⃣ Access the App
1. Open **http://localhost:5174**
2. Click **"HBSS LiveChat"** card
3. Sign in with **Clerk** (Google or email)
4. Start chatting! 🎉

---

## What You Get

✅ **Clerk Authentication** - Google Sign-In + email/password  
✅ **Quantum-Safe Signatures** - HBSS post-quantum cryptography  
✅ **Real-Time Chat** - WebSocket messaging  
✅ **User Avatars** - From Clerk profile  
✅ **Message Verification** - Every message cryptographically verified  
✅ **Online Users** - See who's online with avatars  
✅ **Message History** - Last 20 messages loaded  
✅ **Signature Inspector** - View cryptographic details  

---

## Troubleshooting

### Backend won't start?
```bash
cd enigma-forge-ui-main/hbss-backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python main.py
```

### Frontend won't start?
```bash
cd enigma-forge-ui-main
npm install
npm run dev
```

### Can't connect to chat?
1. Make sure backend is running (http://localhost:8000)
2. Check browser console for errors
3. Try signing out and back in

---

## Environment Variables

Already configured! ✅

**Frontend** (`.env`):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bWVldC1sZW1taW5nLTE2LmNsZXJrLmFjY291bnRzLmRldiQ
```

**Backend** (`hbss-backend/.env`):
```
CLERK_SECRET_KEY=sk_test_it5QoWiXtOghCy65aUty724FDj0tUHInRPKWk4zOpb
```

---

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser   │ ◄─────► │   Clerk      │         │   FastAPI    │
│  (React)    │         │   Auth       │         │   Backend    │
│             │         │              │         │              │
│  - Sign In  │         │  - Google    │         │  - JWT       │
│  - HBSS     │         │  - Email/PW  │         │    Verify    │
│  - WebSocket│         │  - JWT       │         │  - WebSocket │
│             │         │              │         │  - SQLite    │
└─────────────┘         └──────────────┘         └──────────────┘
       │                                                  │
       └──────────────── WebSocket ─────────────────────┘
                    (Authenticated with JWT)
```

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Clerk React SDK
- WebSocket API
- HBSS Crypto (SHA-512)
- Tailwind CSS + shadcn/ui

**Backend:**
- FastAPI (Python)
- SQLAlchemy + SQLite
- WebSocket
- PyJWT (Clerk verification)
- HTTPX (JWKS fetching)

---

## Next Steps

📖 Read **HBSS_SETUP.md** for detailed setup  
📖 Read **CLERK_MIGRATION_COMPLETE.md** for architecture details  
🔧 Customize the UI in `src/pages/HBSSLiveChat.tsx`  
🔧 Add features in `hbss-backend/main.py`  

---

## Support

- **Clerk Docs**: https://clerk.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **HBSS Info**: See signature inspector in the app

---

**Enjoy your quantum-safe chat! 🔐✨**
