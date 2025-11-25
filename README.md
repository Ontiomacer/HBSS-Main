# BlackBerry Dynamics Secure Messaging App

A production-ready secure messaging application built with **BlackBerry Dynamics SDK v13.0.0.21**, featuring end-to-end encryption, real-time communication, and enterprise-grade security.

## 🚀 Quick Start

Get up and running in 5 minutes! See [QUICKSTART.md](./QUICKSTART.md)

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start backend (Terminal 1)
cd server && npm run dev

# Start frontend (Terminal 2)
npm run dev

# Open http://localhost:5173/messaging
```

## ✨ Features

### 🔐 Security
- **End-to-end encryption** with AES-256-GCM
- **BlackBerry Dynamics SDK** integration
- **Secure storage** for sensitive data
- **Message signing** and verification
- **Certificate pinning** and TLS 1.3

### 💬 Messaging
- **Real-time chat** via WebSocket
- **Direct messaging** (1-on-1)
- **Group conversations** with admin controls
- **File sharing** with encryption
- **Delivery status** tracking (sent, delivered, read)
- **Message editing** and deletion

### 🎨 User Experience
- **Modern UI** with shadcn/ui components
- **Dark mode** optimized
- **Responsive design** for all devices
- **Auto-scroll** with smart detection
- **Typing indicators** and presence
- **Unread message counters**

### 🔬 Advanced Features
- **Multiple encryption modes**: AES, MDS (Hamming), Quantum
- **Error correction** for noisy channels
- **Quantum-resistant** encryption simulation
- **Network simulation** tools
- **Automatic reconnection** with exponential backoff

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get started in 5 minutes
- **[Implementation Guide](./BLACKBERRY_IMPLEMENTATION_GUIDE.md)** - Complete technical documentation
- **[API Reference](#api-reference)** - REST and WebSocket API docs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Messaging  │  │  Components  │  │    Hooks     │      │
│  │     Pages    │  │   (shadcn)   │  │  (Realtime)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │   GdContext     │                        │
│                   │  (BB Dynamics)  │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐       │
│    │ GdInit  │      │ GdHttp    │     │ GdStorage │       │
│    │         │      │ Request   │     │           │       │
│    └─────────┘      └───────────┘     └───────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                    WebSocket + REST
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express + WebSocket)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Express    │  │  WebSocket   │  │  GD Services │      │
│  │   Server     │  │   Server     │  │   Wrapper    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Authentication │                        │
│                   │   Middleware    │                        │
│                   └─────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **WebSocket (ws)** - Real-time communication
- **TypeScript** - Type safety

### Security
- **BlackBerry Dynamics SDK v13.0.0.21**
- **AES-256-GCM** encryption
- **TLS 1.3** transport security
- **JWT** authentication

## 📦 Project Structure

```
enigma-forge-ui-main/
├── src/
│   ├── components/          # UI components
│   │   ├── BlackBerrySecureChat.tsx
│   │   ├── SecureMessenger.tsx
│   │   └── ui/             # shadcn components
│   ├── contexts/
│   │   └── GdContext.tsx   # BlackBerry Dynamics context
│   ├── hooks/
│   │   ├── useRealtimeChat.ts
│   │   └── useBlackBerryMessaging.ts
│   ├── pages/
│   │   └── Messaging.tsx   # Main messaging interface
│   ├── services/
│   │   └── blackberry/     # BlackBerry Dynamics services
│   │       ├── GdInit.ts
│   │       ├── GdHttpRequest.ts
│   │       ├── GdStorage.ts
│   │       └── GdMessaging.ts
│   └── types/
│       └── blackberry-dynamics.d.ts
├── server/
│   └── src/
│       ├── index.ts        # Express + WebSocket server
│       └── services/
│           ├── gdWrapper.ts
│           └── quantum/
├── BlackBerry_Dynamics_SDK_for_React_Native_v13.0.0.21/
├── QUICKSTART.md
├── BLACKBERRY_IMPLEMENTATION_GUIDE.md
└── README.md
```

## 🔧 Configuration

### Environment Setup

1. **Copy environment files**:
```bash
cp .env.example .env.local
cp server/.env.example server/.env
```

2. **Update configuration**:
   - Set your BlackBerry UEM server URL
   - Configure application ID and version
   - Set encryption keys and secrets

3. **BlackBerry UEM Configuration**:
   - Create application in UEM console
   - Configure entitlements and policies
   - Generate application credentials

See [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md) for detailed configuration instructions.

## 🧪 Development

### Prerequisites
- Node.js 18+ and npm
- BlackBerry Dynamics entitlement (for production)
- BlackBerry UEM server access (for production)

### Commands

```bash
# Development
npm run dev              # Start frontend dev server
cd server && npm run dev # Start backend dev server

# Build
npm run build            # Build frontend for production
cd server && npm run build # Build backend for production

# Lint
npm run lint             # Check code quality

# Preview
npm run preview          # Preview production build
```

## 📡 API Reference

### REST API

#### POST /messages
Send a new message
```typescript
POST /messages
Authorization: Bearer <token>

{
  "text": "Message content",
  "mode": "GD" | "QuantumMDS",
  "clientTs": 1234567890
}
```

#### GET /messages
Retrieve message history
```typescript
GET /messages?since=<timestamp>
Authorization: Bearer <token>

Response: {
  "messages": [...]
}
```

### WebSocket API

#### Connection
```typescript
ws://localhost:3001/rt/messages?token=<gd_token>
```

#### Send Message
```typescript
{
  "type": "chat",
  "text": "Message content",
  "mode": "GD"
}
```

#### Receive Messages
```typescript
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

## 🚢 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Build backend
cd server && npm run build
```

### Docker
```bash
docker build -t messaging-app .
docker run -p 3001:3001 -p 5173:5173 messaging-app
```

### Environment Checklist
- [ ] Configure production UEM server
- [ ] Enable WSS (secure WebSocket)
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Enable monitoring and logging
- [ ] Set up backup and recovery
- [ ] Configure rate limiting
- [ ] Enable security headers

## 🔒 Security Best Practices

1. **Never log sensitive data** (tokens, keys, message content)
2. **Validate all inputs** on client and server
3. **Use secure random** for IDs and IVs
4. **Implement rate limiting** on API endpoints
5. **Regular security audits** and penetration testing
6. **Keep SDK updated** to latest version
7. **Follow BlackBerry security guidelines**

## 🐛 Troubleshooting

### Common Issues

**GD Runtime not starting?**
- Check UEM server connectivity
- Verify application credentials
- Check device/browser compatibility

**WebSocket connection failing?**
- Verify backend server is running
- Check firewall/proxy settings
- Ensure token is valid

**Messages not encrypting?**
- Verify GD runtime is initialized
- Check encryption key availability
- Review error logs

See [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md) for detailed troubleshooting.

## 📖 Resources

- [BlackBerry Dynamics SDK Documentation](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk)
- [React Native Integration Guide](https://docs.blackberry.com/en/development-tools/blackberry-dynamics-sdk/current/blackberry-dynamics-sdk-for-react-native)
- [UEM Administration Guide](https://docs.blackberry.com/en/unified-endpoint-management)

## 🤝 Support

- **BlackBerry Developer Support**: https://support.blackberry.com
- **Community Forums**: https://supportforums.blackberry.com
- **Documentation**: See [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md)

## 📄 License

Proprietary - BlackBerry Dynamics SDK requires valid license and entitlement.

---

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/270beef2-942b-4dc5-b779-7679a6bd3739

This project was initially created with Lovable and enhanced with BlackBerry Dynamics SDK integration.

### Technologies
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- BlackBerry Dynamics SDK v13.0.0.21
