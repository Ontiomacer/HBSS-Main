# HBSS LiveChat Backend with Clerk Authentication

FastAPI backend server for HBSS LiveChat with Clerk authentication, WebSocket support, and SQLite database.

## Features

- ✅ Clerk JWT token verification
- ✅ Real-time WebSocket communication
- ✅ SQLite database for users and messages
- ✅ HBSS signature storage and retrieval
- ✅ User presence tracking
- ✅ Message history
- ✅ CORS enabled for local development

## Installation

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file:

```
CLERK_SECRET_KEY=sk_test_it5QoWiXtOghCy65aUty724FDj0tUHInRPKWk4zOpb
```

## Running

```bash
python main.py
```

Server will start on `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register/update user from Clerk
- `GET /users/me` - Get current authenticated user

### Server Info
- `GET /` - Server info and endpoints
- `GET /health` - Health check with connection stats
- `GET /stats` - Server statistics

### WebSocket
- `WebSocket /ws?token=<clerk_token>` - Real-time chat connection

## Database Schema

### Users Table
- `id`, `clerk_id`, `email`, `name`, `avatar`
- `commitment_array` (HBSS public key)
- `created_at`, `last_login`, `is_active`

### Messages Table
- `id`, `user_id`, `content`
- `signature` (HBSS signature JSON)
- `created_at`, `is_deleted`

## Security

- JWT tokens verified using Clerk's public JWKS
- RS256 algorithm for token verification
- WebSocket connections require valid tokens
- SQL injection protection via parameterized queries
