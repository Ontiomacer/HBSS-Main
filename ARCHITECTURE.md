# HBSS LiveChat - System Architecture

## Overview
HBSS LiveChat is a real-time quantum-safe chat application combining Clerk authentication with HBSS (Hash-Based Stateless Signatures) for post-quantum message integrity.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐         ┌──────────────────┐                     │
│  │  Clerk Provider  │         │  HBSS Crypto     │                     │
│  │                  │         │                  │                     │
│  │  - useUser()     │         │  - hbssKeygen()  │                     │
│  │  - useAuth()     │         │  - hbssSign()    │                     │
│  │  - getToken()    │         │  - hbssVerify()  │                     │
│  │  - SignIn UI     │         │  - SHA-512       │                     │
│  └────────┬─────────┘         └────────┬─────────┘                     │
│           │                            │                                │
│           └────────────┬───────────────┘                                │
│                        │                                                │
│              ┌─────────▼──────────┐                                     │
│              │  HBSSLiveChat.tsx  │                                     │
│              │                    │                                     │
│              │  - User State      │                                     │
│              │  - Messages        │                                     │
│              │  - WebSocket       │                                     │
│              │  - UI Components   │                                     │
│              └─────────┬──────────┘                                     │
│                        │                                                │
└────────────────────────┼────────────────────────────────────────────────┘
                         │
                         │ HTTP/WebSocket
                         │
┌────────────────────────▼────────────────────────────────────────────────┐
│                      CLERK AUTH SERVICE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Authentication                                                   │  │
│  │  - Google OAuth                                                   │  │
│  │  - Email/Password                                                 │  │
│  │  - JWT Token Generation                                           │  │
│  │  - JWKS Endpoint (/.well-known/jwks.json)                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                         │
                         │ JWT Token
                         │
┌────────────────────────▼────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware                                        │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  1. Extract JWT from Authorization header                  │ │  │
│  │  │  2. Fetch JWKS from Clerk                                   │ │  │
│  │  │  3. Verify JWT signature                                    │ │  │
│  │  │  4. Extract user ID (sub claim)                             │ │  │
│  │  │  5. Load user from database                                 │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  REST API Endpoints                                               │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  POST /auth/sync                                            │ │  │
│  │  │  - Sync Clerk user to database                              │ │  │
│  │  │  - Store HBSS public key commitment                         │ │  │
│  │  │                                                              │ │  │
│  │  │  GET /users/me                                              │ │  │
│  │  │  - Get current user info                                    │ │  │
│  │  │                                                              │ │  │
│  │  │  GET /stats                                                 │ │  │
│  │  │  - Get chat statistics                                      │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  WebSocket Manager                                                │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  WS /ws?token=<jwt>                                         │ │  │
│  │  │                                                              │ │  │
│  │  │  1. Verify JWT token                                        │ │  │
│  │  │  2. Load user from database                                 │ │  │
│  │  │  3. Accept WebSocket connection                             │ │  │
│  │  │  4. Send message history                                    │ │  │
│  │  │  5. Send online users list                                  │ │  │
│  │  │  6. Listen for messages                                     │ │  │
│  │  │  7. Broadcast to all clients                                │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Database (SQLAlchemy + SQLite)                                   │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │  Users Table                                                │ │  │
│  │  │  - id, clerk_id, email, name, avatar                        │ │  │
│  │  │  - commitment_array (HBSS public key)                       │ │  │
│  │  │  - created_at, last_login, is_active                        │ │  │
│  │  │                                                              │ │  │
│  │  │  Messages Table                                             │ │  │
│  │  │  - id, user_id, content                                     │ │  │
│  │  │  - signature (HBSS signature JSON)                          │ │  │
│  │  │  - created_at, is_deleted                                   │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌────────┐                ┌────────┐                ┌────────┐
│ Client │                │ Clerk  │                │Backend │
└───┬────┘                └───┬────┘                └───┬────┘
    │                         │                         │
    │  1. Click Sign In       │                         │
    ├────────────────────────►│                         │
    │                         │                         │
    │  2. Show Sign In UI     │                         │
    │◄────────────────────────┤                         │
    │                         │                         │
    │  3. Enter Credentials   │                         │
    ├────────────────────────►│                         │
    │                         │                         │
    │  4. Verify & Issue JWT  │                         │
    │◄────────────────────────┤                         │
    │                         │                         │
    │  5. POST /auth/sync     │                         │
    │  (with JWT token)       │                         │
    ├─────────────────────────┼────────────────────────►│
    │                         │                         │
    │                         │  6. Verify JWT          │
    │                         │◄────────────────────────┤
    │                         │                         │
    │                         │  7. Return user info    │
    │                         │─────────────────────────┤
    │                         │                         │
    │  8. Create/Update User  │                         │
    │◄────────────────────────┼─────────────────────────┤
    │                         │                         │
    │  9. Store user data     │                         │
    │  in state               │                         │
    │                         │                         │
```

---

## Message Flow

```
┌────────┐                                              ┌────────┐
│Client A│                                              │Client B│
└───┬────┘                                              └───┬────┘
    │                                                       │
    │  1. Type message                                     │
    │                                                       │
    │  2. Sign with HBSS                                   │
    │  (hbssSign)                                          │
    │                                                       │
    │  3. Send via WebSocket                               │
    │  { type: "message",                                  │
    │    message: "Hello",                                 │
    │    signature: {...} }                                │
    ├──────────────────────────┐                          │
    │                          │                          │
    │                          ▼                          │
    │                    ┌──────────┐                     │
    │                    │ Backend  │                     │
    │                    │          │                     │
    │                    │ 4. Save  │                     │
    │                    │ to DB    │                     │
    │                    │          │                     │
    │                    │ 5. Broad-│                     │
    │                    │ cast      │                     │
    │                    └────┬─────┘                     │
    │                         │                           │
    │  6. Receive message     │  7. Receive message       │
    │  (own message)          │  (from Client A)          │
    │◄────────────────────────┼──────────────────────────►│
    │                         │                           │
    │  8. Display             │  9. Verify HBSS signature │
    │  immediately            │  (hbssVerify)             │
    │                         │                           │
    │                         │  10. Display if verified  │
    │                         │                           │
```

---

## HBSS Signature Process

### Key Generation (Once per user)
```
1. Generate 1024 random preimages (256-bit each)
2. Hash each preimage 512 times to create commitments
3. Build Merkle tree from commitments
4. Store commitment root as public key
5. Store preimages as private key
```

### Signing a Message
```
1. Hash message with SHA-512 → digest
2. Select preimages based on digest bits
3. Reveal selected preimages
4. Create signature: { digest, indices, revealedPreimages }
```

### Verifying a Signature
```
1. Hash message with SHA-512 → digest
2. For each revealed preimage:
   a. Hash it 512 times
   b. Check if it matches commitment at index
3. Verify all commitments match public key
4. Signature valid if all checks pass
```

---

## Data Models

### User Model
```typescript
interface User {
  id: number;
  clerk_id: string;        // Unique Clerk user ID
  email: string;
  name: string;
  avatar: string;          // URL from Clerk
  commitment_array: string; // HBSS public key (commitment root)
  created_at: DateTime;
  last_login: DateTime;
  is_active: boolean;
}
```

### Message Model
```typescript
interface Message {
  id: number;
  user_id: number;
  content: string;
  signature: string;       // JSON: { digest, indices, revealedPreimages }
  created_at: DateTime;
  is_deleted: boolean;
}
```

### WebSocket Message Format
```typescript
// Outgoing (Client → Server)
{
  type: "message",
  message: string,
  signature: HBSSSignature
}

// Incoming (Server → Client)
{
  type: "message" | "history" | "online_users" | "user_joined" | "user_left",
  user?: {
    id: number,
    name: string,
    avatar: string,
    commitment: string
  },
  message?: string,
  signature?: HBSSSignature,
  timestamp?: number,
  messages?: Message[],
  users?: User[]
}
```

---

## Security Layers

### Layer 1: Transport Security
- HTTPS (production)
- WSS (WebSocket Secure in production)
- CORS protection

### Layer 2: Authentication
- Clerk JWT tokens
- Token verification via JWKS
- Automatic token refresh
- Session management

### Layer 3: Authorization
- Protected WebSocket connections
- User-specific data access
- Database-level user isolation

### Layer 4: Message Integrity
- HBSS quantum-resistant signatures
- Client-side signature generation
- Client-side signature verification
- Tamper detection

---

## Performance Considerations

### HBSS Performance
- **Key Generation**: ~2-5 seconds (one-time)
- **Signing**: ~50-100ms per message
- **Verification**: ~50-100ms per message
- **Key Storage**: ~500KB per user (localStorage)

### WebSocket Performance
- **Connection**: Persistent, low latency
- **Message Delivery**: <100ms typical
- **Broadcast**: O(n) where n = connected users
- **Reconnection**: Automatic with exponential backoff

### Database Performance
- **SQLite**: Suitable for <100 concurrent users
- **Message History**: Limited to 20 messages
- **Queries**: Indexed on user_id and created_at

---

## Scalability Path

### Current (Development)
- SQLite database
- In-memory WebSocket connections
- Single server instance

### Production (Recommended)
- PostgreSQL database
- Redis for session management
- Load balancer
- Multiple backend instances
- WebSocket sticky sessions
- Message queue (RabbitMQ/Redis)
- CDN for static assets

---

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Auth**: @clerk/clerk-react
- **UI**: Tailwind CSS + shadcn/ui
- **Crypto**: Web Crypto API (SHA-512)
- **WebSocket**: Native WebSocket API
- **State**: React Hooks
- **Build**: Vite

### Backend
- **Framework**: FastAPI (Python)
- **Auth**: PyJWT + httpx (Clerk verification)
- **Database**: SQLAlchemy + SQLite
- **WebSocket**: FastAPI WebSocket
- **Async**: asyncio
- **Server**: Uvicorn

### Infrastructure
- **Development**: localhost
- **Database**: SQLite (file-based)
- **Environment**: python-dotenv

---

## Deployment Architecture (Production)

```
                    ┌──────────────┐
                    │   Clerk      │
                    │   Auth       │
                    └──────┬───────┘
                           │
┌──────────────────────────┼──────────────────────────┐
│                          │                          │
│  ┌───────────────────────▼────────────────────┐   │
│  │         Load Balancer (Nginx)              │   │
│  └───────────────────┬────────────────────────┘   │
│                      │                             │
│         ┌────────────┼────────────┐               │
│         │            │            │               │
│    ┌────▼───┐   ┌───▼────┐  ┌───▼────┐          │
│    │FastAPI │   │FastAPI │  │FastAPI │          │
│    │Instance│   │Instance│  │Instance│          │
│    │   1    │   │   2    │  │   3    │          │
│    └────┬───┘   └───┬────┘  └───┬────┘          │
│         │           │           │                │
│         └───────────┼───────────┘                │
│                     │                            │
│         ┌───────────▼───────────┐               │
│         │   PostgreSQL          │               │
│         │   (Primary + Replica) │               │
│         └───────────────────────┘               │
│                                                  │
│         ┌───────────────────────┐               │
│         │   Redis               │               │
│         │   (Sessions + Cache)  │               │
│         └───────────────────────┘               │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

### Metrics to Track
- Active WebSocket connections
- Messages per second
- HBSS signature time (avg/p95/p99)
- Database query time
- JWT verification time
- Error rates
- User sign-ups
- Message delivery latency

### Logging
- Authentication events
- WebSocket connections/disconnections
- Message sends/receives
- Errors and exceptions
- Performance metrics

### Tools (Recommended)
- **APM**: Sentry, DataDog
- **Logs**: ELK Stack, CloudWatch
- **Metrics**: Prometheus + Grafana
- **Uptime**: UptimeRobot, Pingdom

---

## Future Enhancements

### Short Term
- [ ] Message pagination
- [ ] Typing indicators
- [ ] Read receipts
- [ ] User presence (online/offline/away)
- [ ] Message reactions
- [ ] File uploads

### Medium Term
- [ ] End-to-end encryption (in addition to signatures)
- [ ] Voice messages
- [ ] Video calls
- [ ] Screen sharing
- [ ] Message search
- [ ] User profiles

### Long Term
- [ ] Mobile apps (React Native)
- [ ] Desktop apps (Electron)
- [ ] Group chats
- [ ] Channels
- [ ] Bots and integrations
- [ ] Analytics dashboard

---

**Architecture designed for security, scalability, and quantum resistance! 🔐**
