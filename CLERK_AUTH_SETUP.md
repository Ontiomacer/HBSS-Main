# HBSS LiveChat with Clerk Authentication - Setup Guide

## Overview
This guide will help you set up and run the HBSS LiveChat application with Clerk authentication integration.

## Features
- ✅ Clerk authentication (Google Sign-In + Email/Password)
- ✅ Post-quantum HBSS signatures for all messages
- ✅ Real-time WebSocket communication
- ✅ SQLite database for user and message persistence
- ✅ JWT token verification on backend
- ✅ Live online user tracking

## Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- Clerk account (already configured)

## Environment Variables

### Frontend (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bWVldC1sZW1taW5nLTE2LmNsZXJrLmFjY291bnRzLmRldiQ
```

### Backend (hbss-backend/.env)
```
CLERK_SECRET_KEY=sk_test_it5QoWiXtOghCy65aUty724FDj0tUHInRPKWk4zOpb
```

## Installation

### 1. Install Frontend Dependencies
```bash
npm install
```

This will install:
- @clerk/clerk-react (Clerk authentication)
- All existing dependencies

### 2. Install Backend Dependencies
```bash
cd hbss-backend
pip install -r requirements.txt
```

This will install:
- fastapi
- uvicorn
- sqlalchemy
- PyJWT
- python-dotenv
- requests
- cryptography

## Running the Application

### Step 1: Start the Backend Server
```bash
cd hbss-backend
python main.py
```

The backend will:
- Start on http://localhost:8000
- Create SQLite database (hbss_chat.db)
- Initialize database tables
- Set up WebSocket endpoint at ws://localhost:8000/ws

### Step 2: Start the Frontend
```bash
# In the root directory
npm run dev
```

The frontend will start on http://localhost:5174

### Step 3: Access the Application
1. Open http://localhost:5174/hbss in your browser
2. Sign in using Clerk (Google or Email/Password)
3. HBSS keys will be automatically generated
4. Start chatting with quantum-resistant signatures!

## How It Works

### Authentication Flow
1. User signs in via Clerk
2. Frontend receives Clerk user data
3. HBSS keys are generated (512 commitments, 1024 preimages)
4. User is registered in backend database with Clerk ID
5. Clerk session token is used for WebSocket authentication

### Message Flow
1. User types a message
2. Message is signed with HBSS private key
3. Signed message is sent via WebSocket
4. Backend stores message in database
5. Message is broadcast to all connected clients
6. Each client verifies the HBSS signature
7. Verified messages are displayed with ✓ icon

### WebSocket Authentication
- WebSocket connection requires Clerk session token
- Token is passed as query parameter: `ws://localhost:8000/ws?token=<clerk_token>`
- Backend verifies token using Clerk's JWKS endpoint
- Invalid tokens are rejected with 4001 error code

## Database Schema

### Users Table
- id (Primary Key)
- clerk_id (Unique, from Clerk)
- name
- email
- avatar (URL)
- commitment_array (HBSS public key)
- created_at
- last_login
- is_active

### Messages Table
- id (Primary Key)
- user_id (Foreign Key)
- content (Message text)
- signature (HBSS signature JSON)
- created_at
- is_deleted

## API Endpoints

### POST /auth/register
Register or update user from Clerk
- Body: `{ clerk_id, name, email, avatar, commitment }`
- Returns: User object

### GET /users/me
Get current authenticated user
- Headers: `Authorization: Bearer <clerk_token>`
- Returns: User object

### WebSocket /ws
Real-time chat connection
- Query: `?token=<clerk_token>`
- Messages: JSON format with type, message, signature

## Clerk Configuration

Your Clerk instance is already configured at:
- Domain: meet-lemming-16.clerk.accounts.dev
- Publishable Key: pk_test_bWVldC1sZW1taW5nLTE2LmNsZXJrLmFjY291bnRzLmRldiQ
- Secret Key: sk_test_it5QoWiXtOghCy65aUty724FDj0tUHInRPKWk4zOpb

### Supported Sign-In Methods
- Google OAuth
- Email/Password
- (Can be configured in Clerk Dashboard)

## Security Features

### Post-Quantum Cryptography
- HBSS (Hash-Based Stateless Signatures)
- Quantum-resistant signature scheme
- Each message is cryptographically signed
- Signatures are verified before display

### Authentication
- Clerk handles user authentication
- JWT tokens for API/WebSocket auth
- Tokens verified using Clerk's public JWKS
- Secure session management

### Database
- SQLite for local development
- User data encrypted at rest
- Message signatures stored as JSON
- Soft delete for messages

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is not in use

### Frontend won't connect
- Ensure backend is running on port 8000
- Check browser console for errors
- Verify Clerk publishable key in .env

### WebSocket connection fails
- Check Clerk token is valid
- Ensure user is registered in database
- Check backend logs for error messages

### Messages not verifying
- HBSS keys must be generated correctly
- Commitment root must match between sender/receiver
- Check signature format in message payload

## Development Tips

### Testing Multiple Users
1. Open multiple browser windows/incognito tabs
2. Sign in with different Clerk accounts
3. Messages will sync in real-time
4. Online users list updates automatically

### Viewing Database
```bash
cd hbss-backend
sqlite3 hbss_chat.db
.tables
SELECT * FROM users;
SELECT * FROM messages;
```

### Backend Logs
The backend logs all:
- User connections/disconnections
- Message sends/receives
- Authentication attempts
- WebSocket errors

## Production Deployment

For production deployment:
1. Use PostgreSQL instead of SQLite
2. Set up proper environment variables
3. Enable HTTPS/WSS
4. Configure Clerk production instance
5. Add rate limiting
6. Implement message encryption at rest
7. Set up monitoring and logging

## Support

For issues or questions:
- Check backend logs: Terminal running `python main.py`
- Check frontend console: Browser DevTools
- Review Clerk Dashboard for auth issues
- Check database: `sqlite3 hbss_chat.db`

## Next Steps

Potential enhancements:
- [ ] Message editing/deletion
- [ ] File attachments with HBSS signatures
- [ ] Private/group channels
- [ ] Message search
- [ ] User profiles
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Push notifications

---

**Ready to chat securely with quantum-resistant signatures!** 🔐⚛️💬
