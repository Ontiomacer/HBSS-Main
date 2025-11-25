# Quick Start Guide - BlackBerry Dynamics Messaging App

## Get Started in 5 Minutes

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Start the Application

Open two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
You should see: `Server listening on http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
You should see: `Local: http://localhost:5173`

### 3. Access the App

Open your browser and navigate to: **http://localhost:5173**

### 4. Navigate to Messaging

Click on the "Messaging" link or navigate to: **http://localhost:5173/messaging**

## Features You Can Try

### Send Messages
1. Type a message in the input field
2. Select encryption mode (AES, MDS, or Quantum)
3. Click "Send" or press Enter
4. Watch your message appear in the chat

### Real-time Communication
- Open the app in multiple browser tabs
- Send a message from one tab
- See it appear instantly in other tabs via WebSocket

### Encryption Modes
- **AES**: Standard BlackBerry Dynamics encryption
- **MDS (Hamming)**: Error correction for noisy channels
- **Quantum**: Quantum-resistant encryption simulation

### Check Connection Status
Look at the header to see:
- **GD Status**: BlackBerry Dynamics runtime status
- **Transport Status**: WebSocket connection state

## Project Structure

```
enigma-forge-ui-main/
├── src/
│   ├── pages/Messaging.tsx          # Main messaging UI
│   ├── contexts/GdContext.tsx       # BlackBerry Dynamics context
│   ├── hooks/useRealtimeChat.ts     # WebSocket hook
│   └── services/blackberry/         # BlackBerry services
│       ├── GdInit.ts                # SDK initialization
│       ├── GdHttpRequest.ts         # Secure HTTP
│       ├── GdStorage.ts             # Encrypted storage
│       └── GdMessaging.ts           # Messaging service
└── server/
    └── src/index.ts                 # Express + WebSocket server
```

## Common Commands

```bash
# Development
npm run dev              # Start frontend dev server
cd server && npm run dev # Start backend dev server

# Build
npm run build            # Build frontend for production
cd server && npm run build # Build backend for production

# Lint
npm run lint             # Check code quality

# Preview production build
npm run preview          # Preview production build locally
```

## Troubleshooting

### Backend not starting?
- Check if port 3001 is available
- Make sure you're in the `server` directory
- Run `npm install` in the server directory

### Frontend not connecting to backend?
- Verify backend is running on port 3001
- Check browser console for errors
- Ensure WebSocket URL is correct in `useRealtimeChat.ts`

### Messages not sending?
- Check if both frontend and backend are running
- Look for errors in browser console
- Verify WebSocket connection status in the UI

### BlackBerry Dynamics not initializing?
- This is expected in development without UEM server
- The app will fall back to standard encryption
- For production, configure UEM server in `GdInit.ts`

## Next Steps

1. **Read the full guide**: See `BLACKBERRY_IMPLEMENTATION_GUIDE.md`
2. **Customize the UI**: Edit components in `src/components/`
3. **Add features**: Extend services in `src/services/blackberry/`
4. **Configure for production**: Set up BlackBerry UEM server
5. **Deploy**: Build and deploy to your infrastructure

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes auto-refresh in browser
- Backend: Server auto-restarts on file changes

### Debug Mode
Enable detailed logging:
```typescript
// In src/services/blackberry/GdInit.ts
GdApp.on('log', (info) => {
  console.log('[GD DEBUG]', info);
});
```

### Test WebSocket
Open browser DevTools → Network → WS to see WebSocket messages

### Mock Data
The app includes mock contacts and conversations for testing

## Architecture Overview

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │◄──────────────────────────►│                 │
│  React Frontend │                            │  Express Server │
│  (Port 5173)    │         REST API           │  (Port 3001)    │
│                 │◄──────────────────────────►│                 │
└─────────────────┘                            └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│  BlackBerry     │                            │  BlackBerry     │
│  Dynamics SDK   │                            │  GD Services    │
│  (Client)       │                            │  (Server)       │
└─────────────────┘                            └─────────────────┘
```

## Support

- **Documentation**: See `BLACKBERRY_IMPLEMENTATION_GUIDE.md`
- **Issues**: Check browser console and server logs
- **BlackBerry Support**: https://support.blackberry.com

Happy coding! 🚀
