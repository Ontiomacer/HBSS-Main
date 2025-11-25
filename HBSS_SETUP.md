# HBSS LiveChat with Clerk Authentication - Setup Guide

## Overview
HBSS LiveChat is a real-time quantum-safe chat application using:
- **Clerk** for authentication (Google Sign-In + email/password)
- **HBSS** (Hash-Based Stateless Signatures) for post-quantum message signing
- **FastAPI** backend with WebSocket support
- **React** frontend with real-time updates

## Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- Clerk account (already configured)

## Environment Variables

### Frontend (.env)
Already configured in `enigma-forge-ui-main/.env`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bWVldC1sZW1taW5nLTE2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_it5QoWiXtOghCy65aUty724FDj0tUHInRPKWk4zOpb
```

### Backend (.env)
Already configured in `enigma-forge-ui-main/hbss-backend/.env`:
```
CLERK_SECRET_KEY=sk_test_it5QoWiXtOghCy65aUty724FDj0tUHInRPKWk4zOpb
```

## Installation & Running

### 1. Backend Setup
```bash
cd enigma-forge-ui-main/hbss-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

Backend will run on: **http://localhost:8000**

### 2. Frontend Setup
```bash
cd enigma-forge-ui-main

# Install dependencies (if not already done)
npm install

# Run the development server
npm run dev
```

Frontend will run on: **http://localhost:5174**

## Usage

1. **Navigate to HBSS Chat**
   - Open http://localhost:5174
   - Click on "HBSS LiveChat" card on the dashboard
   - Or go directly to http://localhost:5174/hbss

2. **Sign In with Clerk**
   - You'll be prompted to sign in
   - Use Google Sign-In or email/password
   - Clerk will handle authentication

3. **Chat Features**
   - All messages are signed with HBSS (quantum-resistant)
   - Real-time message delivery via WebSocket
   - Signature verification for all incoming messages
   - Online users list
   - Message history
   - Signature inspector to view cryptographic details

## Architecture

### Authentication Flow
1. User signs in via Clerk (frontend)
2. Clerk issues a JWT session token
3. Frontend syncs user data with backend (`/auth/sync`)
4. Backend verifies Clerk JWT using JWKS
5. User data stored in SQLite with HBSS public key

### Messaging Flow
1. User connects to WebSocket with Clerk token
2. Backend verifies token and loads user from database
3. User generates HBSS signature for each message
4. Message + signature sent via WebSocket
5. Backend stores message in database
6. Backend broadcasts to all connected clients
7. Each client verifies HBSS signature before displaying

### Database Schema
**Users Table:**
- id (primary key)
- clerk_id (unique, from Clerk)
- email
- name
- avatar
- commitment_array (HBSS public key)
- created_at
- last_login
- is_active

**Messages Table:**
- id (primary key)
- user_id (foreign key)
- content
- signature (HBSS signature JSON)
- created_at
- is_deleted

## API Endpoints

### Backend (http://localhost:8000)

**GET /**
- Health check and service info

**POST /auth/sync**
- Sync Clerk user to database
- Headers: `Authorization: Bearer <clerk_token>`
- Body: `{ name, email, avatar, commitment }`

**GET /users/me**
- Get current user info
- Headers: `Authorization: Bearer <clerk_token>`

**GET /stats**
- Get chat statistics (messages, online users)

**WebSocket /ws?token=<clerk_token>**
- Real-time chat connection
- Requires valid Clerk session token

## Security Features

1. **Clerk Authentication**
   - Industry-standard OAuth2/OIDC
   - JWT token verification
   - Secure session management

2. **HBSS Signatures**
   - Quantum-resistant cryptography
   - Hash-based signatures (SHA-512)
   - Stateless signature scheme
   - Each message cryptographically signed

3. **Transport Security**
   - WebSocket for real-time communication
   - Token-based authentication
   - CORS protection

## Troubleshooting

### Backend Issues
- **Database errors**: Delete `hbss_chat.db` and restart
- **Token verification fails**: Check Clerk secret key in `.env`
- **Port 8000 in use**: Change port in `main.py`

### Frontend Issues
- **Clerk not loading**: Check publishable key in `.env`
- **WebSocket connection fails**: Ensure backend is running
- **HBSS key generation slow**: Normal for first time (512 commitments)

## Development Notes

- HBSS keys are generated once and stored in localStorage
- Database is SQLite (file: `hbss_chat.db`)
- WebSocket reconnects automatically on disconnect
- Message history limited to last 20 messages
- Signature verification happens client-side

## Production Considerations

For production deployment:
1. Use PostgreSQL instead of SQLite
2. Add rate limiting
3. Implement message pagination
4. Add file upload support
5. Enable HTTPS/WSS
6. Configure Clerk production instance
7. Add monitoring and logging
8. Implement message encryption (in addition to signatures)
