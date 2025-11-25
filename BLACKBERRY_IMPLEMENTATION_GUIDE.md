# BlackBerry Dynamics Messaging App - Implementation Guide

## Overview

This is a secure messaging application built with BlackBerry Dynamics SDK v13.0.0.21, React, TypeScript, and WebSocket for real-time communication.

## Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui with Radix UI components
- **Styling**: Tailwind CSS
- **State Management**: React Context API + React Query
- **Routing**: React Router v6

### Backend (Node.js + Express + WebSocket)
- **Server**: Express.js
- **Real-time**: WebSocket (ws library)
- **Security**: BlackBerry Dynamics authentication middleware

### BlackBerry Dynamics Integration
- **SDK Version**: 13.0.0.21 for React Native
- **Core Features**:
  - Secure HTTP requests (GdHttpRequest)
  - Encrypted storage (GdStorage)
  - Secure messaging (GdMessaging)
  - Runtime initialization (GdInit)

## Project Structure

```
enigma-forge-ui-main/
├── src/
│   ├── components/          # UI components
│   │   ├── BlackBerrySecureChat.tsx
│   │   ├── SecureMessenger.tsx
│   │   └── FloatAlertBell.tsx
│   ├── contexts/
│   │   └── GdContext.tsx    # BlackBerry Dynamics context provider
│   ├── hooks/
│   │   ├── useRealtimeChat.ts
│   │   └── useBlackBerryMessaging.ts
│   ├── pages/
│   │   ├── Messaging.tsx    # Main messaging interface
│   │   └── BlackBerryMessaging.tsx
│   ├── services/
│   │   └── blackberry/
│   │       ├── GdInit.ts           # SDK initialization
│   │       ├── GdHttpRequest.ts    # Secure HTTP
│   │       ├── GdStorage.ts        # Encrypted storage
│   │       └── GdMessaging.ts      # Messaging service
│   └── types/
│       └── blackberry-dynamics.d.ts
├── server/
│   └── src/
│       ├── index.ts         # Express + WebSocket server
│       └── services/
│           ├── gdWrapper.ts
│           └── quantum/
└── BlackBerry_Dynamics_SDK_for_React_Native_v13.0.0.21/
```

## Key Features

### 1. Secure Messaging
- **End-to-end encryption** using AES-256-GCM or ChaCha20-Poly1305
- **Message signing** for authenticity verification
- **Delivery status tracking** (sending, sent, delivered, read, failed)
- **Multiple message types**: text, file, image, video, audio

### 2. Real-time Communication
- **WebSocket connection** for instant message delivery
- **Automatic reconnection** with exponential backoff
- **Fallback to REST API** when WebSocket unavailable
- **Message backlog** synchronization on connect

### 3. Encryption Modes
- **AES Mode**: Standard AES-256 encryption via BlackBerry Dynamics
- **MDS Mode**: Hamming code error correction for noisy channels
- **Quantum Mode**: Quantum-resistant encryption simulation

### 4. Conversation Management
- **Direct messaging** (1-on-1)
- **Group conversations** with admin controls
- **Unread message counters**
- **Conversation search and filtering**

### 5. Contact Management
- **Contact list** with status indicators (online, offline, away, busy)
- **Contact search** by name, email, or department
- **Public key exchange** for encryption

### 6. File Sharing
- **Secure file upload/download** via encrypted channels
- **File type detection** (image, video, audio, document)
- **File metadata** (name, size, MIME type)
- **Thumbnail generation** for images

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- BlackBerry Dynamics entitlement
- BlackBerry UEM server access (for production)

### Installation

1. **Install dependencies**:
```bash
cd enigma-forge-ui-main
npm install

cd server
npm install
```

2. **Configure BlackBerry Dynamics**:
   - Extract SDK to `BlackBerry_Dynamics_SDK_for_React_Native_v13.0.0.21/`
   - Update `GdInit.ts` with your application ID and version
   - Configure UEM server settings

3. **Start development servers**:

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend
cd ..
npm run dev
```

4. **Access the app**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - WebSocket: ws://localhost:3001/rt/messages

## BlackBerry Dynamics Services

### GdInit.ts - SDK Initialization
```typescript
import { GdApp } from 'blackberry-dynamics-sdk';

export async function startGd(): Promise<void> {
  return new Promise((resolve, reject) => {
    GdApp.start(
      {},
      () => resolve(),
      (err) => reject(err)
    );
  });
}
```

### GdHttpRequest.ts - Secure HTTP
```typescript
export async function gdGet(url: string): Promise<GdResponse>
export async function gdPost(url: string, body: any): Promise<GdResponse>
```

### GdStorage.ts - Encrypted Storage
```typescript
export async function gdGetItem(key: string): Promise<string | null>
export async function gdSetItem(key: string, value: string): Promise<void>
export async function gdRemoveItem(key: string): Promise<void>
```

### GdMessaging.ts - Messaging Service
```typescript
class GdMessagingService {
  async sendMessage(recipientId: string, content: string): Promise<SecureMessage>
  async receiveMessages(conversationId: string): Promise<SecureMessage[]>
  async sendFile(recipientId: string, file: File): Promise<SecureMessage>
  async createGroupConversation(name: string, participantIds: string[]): Promise<Conversation>
}
```

## Usage Examples

### Sending a Message
```typescript
import { useGd } from '@/contexts/GdContext';
import { gdMessaging } from '@/services/blackberry/GdMessaging';

function MyComponent() {
  const { gdReady } = useGd();

  async function sendMessage() {
    if (!gdReady) return;
    
    const message = await gdMessaging.sendMessage(
      'recipient_id',
      'Hello, secure world!',
      'text'
    );
    
    console.log('Message sent:', message.id);
  }
}
```

### Real-time Chat Hook
```typescript
import useRealtimeChat from '@/hooks/useRealtimeChat';

function ChatComponent() {
  const { messages, sendMessage, transport } = useRealtimeChat();

  return (
    <div>
      <div>Status: {transport.connected ? 'Connected' : 'Disconnected'}</div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.text}</div>
      ))}
      <button onClick={() => sendMessage('Hello!', 'AES')}>Send</button>
    </div>
  );
}
```

### Using GD Context
```typescript
import { useGd } from '@/contexts/GdContext';

function SecureComponent() {
  const { gdReady, http, storage } = useGd();

  useEffect(() => {
    if (gdReady) {
      // Make secure HTTP request
      http.get('/api/data').then(response => {
        console.log(response.body);
      });

      // Store encrypted data
      storage.setItem('user_pref', 'dark_mode');
    }
  }, [gdReady]);
}
```

## Security Features

### 1. Authentication
- BlackBerry Dynamics token-based authentication
- Token validation middleware on backend
- Automatic token refresh

### 2. Encryption
- **Transport Layer**: TLS 1.3 for all network communication
- **Message Encryption**: AES-256-GCM with unique IV per message
- **Storage Encryption**: BlackBerry Dynamics secure container
- **Key Management**: Automatic key generation and rotation

### 3. Data Protection
- **Secure storage** for sensitive data (tokens, keys, preferences)
- **Memory protection** via BlackBerry Dynamics runtime
- **Screen capture prevention** (mobile platforms)
- **Clipboard protection** for sensitive content

### 4. Network Security
- **Certificate pinning** for API endpoints
- **Man-in-the-middle protection**
- **Secure WebSocket** (WSS) in production
- **Request signing** for API calls

## API Endpoints

### REST API

#### POST /messages
Send a new message
```json
{
  "text": "Message content",
  "mode": "GD" | "QuantumMDS",
  "clientTs": 1234567890
}
```

#### GET /messages?since=timestamp
Retrieve message history
```json
{
  "messages": [
    {
      "id": "msg_123",
      "text": "Message content",
      "senderId": "user_1",
      "mode": "GD",
      "ts": 1234567890
    }
  ]
}
```

#### GET /health
Server health check
```json
{
  "status": "ok",
  "gdStatus": "available",
  "uptime": 12345
}
```

### WebSocket API

#### Connection
```
ws://localhost:3001/rt/messages?token=<gd_token>
```

#### Message Format
```json
{
  "type": "chat",
  "text": "Message content",
  "mode": "GD"
}
```

#### Server Events
```json
// Backlog on connect
{
  "type": "backlog",
  "messages": [...]
}

// New message
{
  "type": "message",
  "message": {...}
}
```

## Configuration

### Environment Variables
```bash
# Backend
PORT=3001
GD_SERVER_URL=https://your-uem-server.com
GD_APP_ID=com.yourcompany.app
GD_APP_VERSION=1.0.0

# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/rt/messages
```

### BlackBerry UEM Configuration
1. Create application in UEM console
2. Configure entitlements and policies
3. Generate application credentials
4. Update `GdInit.ts` with credentials

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Deployment

### Production Build
```bash
# Frontend
npm run build

# Backend
cd server
npm run build
```

### Docker Deployment
```bash
docker build -t messaging-app .
docker run -p 3001:3001 -p 5173:5173 messaging-app
```

### Environment Setup
- Configure production UEM server
- Enable WSS (secure WebSocket)
- Set up SSL certificates
- Configure firewall rules
- Enable monitoring and logging

## Troubleshooting

### Common Issues

1. **GD Runtime not starting**
   - Check UEM server connectivity
   - Verify application credentials
   - Check device/browser compatibility

2. **WebSocket connection failing**
   - Verify backend server is running
   - Check firewall/proxy settings
   - Ensure token is valid

3. **Messages not encrypting**
   - Verify GD runtime is initialized
   - Check encryption key availability
   - Review error logs

### Debug Mode
Enable debug logging:
```typescript
// In GdInit.ts
GdApp.on('log', (info) => {
  console.log('[GD DEBUG]', info);
});
```

## Performance Optimization

1. **Message Caching**: Local cache for recent messages
2. **Lazy Loading**: Load conversations on demand
3. **Virtual Scrolling**: For large message lists
4. **Image Optimization**: Compress images before upload
5. **Connection Pooling**: Reuse WebSocket connections

## Security Best Practices

1. **Never log sensitive data** (tokens, keys, message content)
2. **Validate all inputs** on client and server
3. **Use secure random** for IDs and IVs
4. **Implement rate limiting** on API endpoints
5. **Regular security audits** and penetration testing
6. **Keep SDK updated** to latest version
7. **Follow BlackBerry security guidelines**

## Resources

- [BlackBerry Dynamics SDK Documentation](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk)
- [React Native Integration Guide](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk/current/blackberry-dynamics-sdk-for-react-native)
- [UEM Administration Guide](https://docs.blackberry.com/en/unified-endpoint-management)

## Support

For issues and questions:
- BlackBerry Developer Support: https://support.blackberry.com
- Community Forums: https://supportforums.blackberry.com
- GitHub Issues: [Your repository]

## License

Proprietary - BlackBerry Dynamics SDK requires valid license and entitlement.
