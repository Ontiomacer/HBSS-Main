# Frequently Asked Questions (FAQ)

## General Questions

### What is this application?
This is a secure messaging application built with BlackBerry Dynamics SDK v13.0.0.21. It provides end-to-end encrypted messaging, real-time communication, and enterprise-grade security features suitable for government, healthcare, financial, and enterprise deployments.

### Who should use this application?
- **Enterprises** requiring secure internal communication
- **Healthcare organizations** needing HIPAA-compliant messaging
- **Financial institutions** requiring secure client communication
- **Government agencies** needing classified communication
- **Legal firms** requiring attorney-client privilege protection

### What makes this different from other messaging apps?
- **BlackBerry Dynamics SDK** integration for enterprise security
- **End-to-end encryption** with AES-256-GCM
- **Enterprise management** via BlackBerry UEM
- **Compliance ready** (HIPAA, GDPR, SOC 2, etc.)
- **On-premises deployment** option
- **No third-party data sharing**

## Technical Questions

### What technologies are used?
**Frontend:**
- React 18 + TypeScript
- Vite build tool
- shadcn/ui components
- Tailwind CSS
- WebSocket for real-time

**Backend:**
- Node.js + Express
- WebSocket server
- BlackBerry Dynamics SDK

### What are the system requirements?

**Development:**
- Node.js 18+
- 4GB RAM minimum
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

**Production:**
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ storage
- Linux/Windows Server

### What browsers are supported?
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile browsers have limited functionality; native apps are recommended.

### Can I use this on mobile devices?
The web app works on mobile browsers with limited functionality. For full mobile support, native iOS/Android apps are recommended (planned for Phase 2).

## BlackBerry Dynamics Questions

### Do I need a BlackBerry UEM server?
Yes, for production deployment. BlackBerry UEM (Unified Endpoint Management) is required to:
- Manage application entitlements
- Configure security policies
- Provision users
- Monitor compliance

For development, the app includes fallback mechanisms.

### How much does BlackBerry Dynamics cost?
BlackBerry Dynamics licensing is enterprise-based. Contact BlackBerry Sales for pricing:
- https://www.blackberry.com/us/en/products/blackberry-dynamics

### Can I use this without BlackBerry Dynamics?
The application is designed for BlackBerry Dynamics. While it includes fallback mechanisms for development, production use requires:
- Valid BlackBerry Dynamics SDK license
- BlackBerry UEM server
- Enterprise agreement with BlackBerry

### What is the difference between BlackBerry Dynamics and regular encryption?
BlackBerry Dynamics provides:
- **Enterprise management** via UEM
- **Policy enforcement** (data loss prevention, compliance)
- **Secure container** for data isolation
- **Certificate management**
- **Compliance certifications** (FIPS 140-2, Common Criteria)
- **Integration** with enterprise systems

## Setup and Installation

### How do I get started?
See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide:

```bash
npm install
cd server && npm install && cd ..
cd server && npm run dev  # Terminal 1
npm run dev               # Terminal 2
```

### What if I get "port already in use" error?
```bash
# Find process using port 3001
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change port in server/.env
PORT=3002
```

### How do I configure BlackBerry UEM?
See [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md) section "BlackBerry UEM Configuration" for detailed steps.

### Where do I get BlackBerry Dynamics SDK?
Download from BlackBerry Developer Portal:
- https://developers.blackberry.com

You'll need:
- BlackBerry Developer account
- Valid entitlement
- Signed license agreement

## Features and Functionality

### What encryption modes are available?
1. **AES Mode**: Standard AES-256-GCM encryption via BlackBerry Dynamics
2. **MDS Mode**: Hamming code error correction for noisy channels
3. **Quantum Mode**: Quantum-resistant encryption simulation

### Can I send files?
Yes, the app supports file sharing with encryption:
- Images (JPEG, PNG, GIF)
- Videos (MP4, MOV)
- Audio (MP3, WAV)
- Documents (PDF, DOCX, etc.)

Default limit: 10MB per file (configurable)

### Does it support group chats?
Yes, group conversations are supported with:
- Multiple participants
- Admin controls
- Group naming
- Member management

### Can I edit or delete messages?
Yes:
- **Edit**: Click on your message and select "Edit"
- **Delete**: Click on your message and select "Delete"

Note: Deleted messages are removed for all participants.

### How does real-time messaging work?
The app uses WebSocket for real-time bidirectional communication:
- Instant message delivery
- Automatic reconnection
- Fallback to REST API if WebSocket unavailable
- Message backlog synchronization

### What happens if I lose connection?
The app automatically:
- Detects connection loss
- Attempts reconnection with exponential backoff
- Queues messages locally
- Syncs when connection restored
- Shows connection status in UI

## Security Questions

### How secure is the messaging?
Very secure:
- **End-to-end encryption** with AES-256-GCM
- **Message signing** for authenticity
- **TLS 1.3** for transport
- **Certificate pinning**
- **Secure storage** via BlackBerry Dynamics
- **No third-party access**

### Can BlackBerry read my messages?
No. Messages are end-to-end encrypted. Only the sender and recipient can decrypt messages. BlackBerry provides the security infrastructure but cannot access message content.

### What compliance standards are met?
- **FIPS 140-2**: Cryptographic module validation
- **Common Criteria**: Security evaluation
- **HIPAA**: Healthcare data protection
- **GDPR**: European data privacy
- **SOC 2**: Service organization controls
- **PCI DSS**: Payment card security

### How are encryption keys managed?
- Keys are generated per message
- Stored in BlackBerry Dynamics secure container
- Managed by BlackBerry UEM
- Automatic rotation
- Never transmitted in plain text

### What if my device is lost or stolen?
BlackBerry UEM can:
- Remotely wipe application data
- Revoke access
- Lock the secure container
- Audit access attempts

### Can messages be recovered if deleted?
Depends on your backup configuration:
- **Client-side**: Deleted messages are removed locally
- **Server-side**: Depends on retention policy
- **Backup**: May be recoverable from backups

Configure retention policies in server/.env

## Deployment Questions

### How do I deploy to production?
See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive guide. Options:
1. **Docker Compose** (recommended)
2. **Manual deployment** with PM2
3. **Cloud platforms** (AWS, Azure, GCP)
4. **Kubernetes** for scalability

### What infrastructure do I need?
**Minimum:**
- 1 server (2 CPU, 4GB RAM)
- SSL certificate
- Domain name

**Recommended:**
- 2+ servers (load balanced)
- Database server (PostgreSQL)
- Redis server (caching)
- CDN for static assets
- Monitoring solution

### Can I deploy on-premises?
Yes, the application supports on-premises deployment:
- Full control over data
- No cloud dependencies
- Integration with internal systems
- Custom security policies

### What about scaling?
The application supports horizontal scaling:
- Multiple backend instances
- Load balancing
- Redis pub/sub for WebSocket
- Database clustering
- CDN for static assets

See [DEPLOYMENT.md](./DEPLOYMENT.md) "Scaling" section.

### How do I set up SSL/TLS?
```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com

# Configure Nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) "SSL/TLS Configuration" section.

## Troubleshooting

### Backend won't start
**Check:**
1. Port 3001 is available
2. Node.js version is 18+
3. Dependencies are installed: `cd server && npm install`
4. Environment variables are set
5. Review logs for errors

### Frontend can't connect to backend
**Check:**
1. Backend is running: `curl http://localhost:3001/health`
2. VITE_API_URL is correct in .env.local
3. CORS is configured in server/.env
4. Firewall allows connections
5. Browser console for errors

### WebSocket connection fails
**Check:**
1. Backend WebSocket server is running
2. VITE_WS_URL is correct
3. Firewall allows WebSocket connections
4. Proxy configuration (if behind proxy)
5. Try different browser

### Messages not encrypting
**Check:**
1. BlackBerry Dynamics runtime initialized
2. GD_APP_ID and GD_APP_VERSION are correct
3. UEM server is accessible
4. Valid entitlement
5. Review GD initialization logs

### "Unauthorized" errors
**Check:**
1. Valid authentication token
2. Token not expired
3. UEM server accessible
4. User has proper entitlements
5. Application configured in UEM

### High memory usage
**Solutions:**
1. Enable message pagination
2. Clear old messages from cache
3. Increase Node.js memory: `--max-old-space-size=2048`
4. Optimize database queries
5. Enable Redis caching

### Slow performance
**Solutions:**
1. Enable Gzip compression
2. Use CDN for static assets
3. Optimize images
4. Enable caching
5. Scale horizontally
6. Optimize database indexes

## Development Questions

### How do I contribute?
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes
4. Write tests
5. Submit pull request

### How do I run tests?
```bash
# Frontend tests
npm run test

# Backend tests
cd server && npm run test

# Coverage
npm run test:coverage
```

### How do I add a new feature?
1. Review [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md)
2. Create feature branch
3. Implement feature
4. Add tests
5. Update documentation
6. Submit pull request

### Where is the documentation?
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Technical Guide**: [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Project Overview**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- **Setup Checklist**: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)

### How do I debug issues?
**Frontend:**
```typescript
// Enable debug logging in GdInit.ts
GdApp.on('log', (info) => {
  console.log('[GD DEBUG]', info);
});
```

**Backend:**
```bash
# Set log level in server/.env
LOG_LEVEL=debug

# View logs
docker-compose logs -f backend
# or
pm2 logs messaging-backend
```

**Browser:**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests
- Check WS tab for WebSocket messages

## Performance Questions

### What are the performance targets?
- **Message Latency**: < 100ms (WebSocket)
- **API Response**: < 200ms (95th percentile)
- **Concurrent Users**: 10,000+ per instance
- **Messages/Second**: 1,000+ per instance
- **Uptime**: 99.9%

### How many users can it support?
**Single instance:**
- 1,000-5,000 concurrent users
- 10,000+ total users

**Scaled deployment:**
- 10,000+ concurrent users
- 100,000+ total users

Depends on hardware and configuration.

### How do I optimize performance?
1. Enable caching (Redis)
2. Use CDN for static assets
3. Optimize database queries
4. Enable connection pooling
5. Scale horizontally
6. Use load balancing

See [DEPLOYMENT.md](./DEPLOYMENT.md) "Performance Optimization" section.

## Cost Questions

### What are the costs?
**Software:**
- BlackBerry Dynamics license (contact BlackBerry Sales)
- BlackBerry UEM license (if not already owned)

**Infrastructure:**
- Server hosting ($50-500/month depending on scale)
- Domain name ($10-50/year)
- SSL certificate ($0-200/year, free with Let's Encrypt)
- Optional: Database, Redis, CDN

**Development:**
- Developer time for customization
- Ongoing maintenance

### Is there a free tier?
No free tier for production use. BlackBerry Dynamics requires enterprise licensing.

For development/testing, you can use the fallback mechanisms without UEM server.

### Can I use open-source alternatives?
The application uses BlackBerry Dynamics SDK which requires licensing. However, you could:
- Replace with other encryption libraries (loses enterprise features)
- Use open-source messaging protocols (Matrix, XMPP)
- Build custom solution (significant development effort)

## Support Questions

### Where can I get help?
1. **Documentation**: Check guides in this repository
2. **BlackBerry Support**: https://support.blackberry.com
3. **Community Forums**: https://supportforums.blackberry.com
4. **GitHub Issues**: Report bugs and request features
5. **Stack Overflow**: Tag `blackberry-dynamics`

### How do I report a bug?
1. Check if already reported in GitHub Issues
2. Gather information:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages/logs
   - Environment details
3. Create detailed issue report
4. Include screenshots if applicable

### How do I request a feature?
1. Check roadmap in [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Search existing feature requests
3. Create new issue with:
   - Use case description
   - Expected behavior
   - Benefits
   - Priority

### Is there commercial support available?
Contact BlackBerry for enterprise support options:
- https://www.blackberry.com/us/en/support

### How often is the app updated?
- **Security patches**: As needed
- **Bug fixes**: Monthly
- **Feature updates**: Quarterly
- **Major versions**: Annually

Check GitHub releases for update history.

## Licensing Questions

### What license is this under?
Proprietary software requiring:
- Valid BlackBerry Dynamics SDK license
- BlackBerry UEM entitlement
- Enterprise agreement with BlackBerry

### Can I modify the code?
Yes, you can modify the code for your organization's use, subject to:
- BlackBerry Dynamics SDK license terms
- Your enterprise agreement
- Compliance requirements

### Can I redistribute this?
No, redistribution requires:
- Separate licensing agreement
- BlackBerry approval
- Compliance with SDK terms

### Can I use this for commercial purposes?
Yes, with proper licensing:
- BlackBerry Dynamics SDK license
- BlackBerry UEM subscription
- Enterprise agreement

Contact BlackBerry Sales for commercial licensing.

## Migration Questions

### Can I migrate from another messaging platform?
Yes, you can migrate from:
- Slack
- Microsoft Teams
- WhatsApp Business
- Custom solutions

Migration involves:
1. Export data from old platform
2. Transform to compatible format
3. Import into new system
4. User training

### How do I import existing messages?
Create import script:
```typescript
// Import messages from JSON
import { gdMessaging } from './services/blackberry/GdMessaging';

async function importMessages(messages: any[]) {
  for (const msg of messages) {
    await gdMessaging.sendMessage(
      msg.recipientId,
      msg.content,
      'text'
    );
  }
}
```

### Can I integrate with existing systems?
Yes, the app provides REST API for integration:
- User provisioning
- Message sending
- Status monitoring
- Analytics

See [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md) "API Endpoints" section.

## Future Plans

### What's on the roadmap?
**Phase 2 (Planned):**
- Voice and video calling
- Screen sharing
- Message reactions and threads
- Advanced search
- Message translation

**Phase 3 (Future):**
- Mobile apps (iOS/Android)
- Desktop apps (Electron)
- AI-powered features
- Advanced analytics

See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) "Roadmap" section.

### When will mobile apps be available?
Mobile apps are planned for Phase 2. Timeline depends on:
- Resource availability
- User demand
- BlackBerry SDK updates

### Can I request custom features?
Yes, for custom development:
1. Contact your account manager
2. Describe requirements
3. Get quote for development
4. Schedule implementation

---

## Still Have Questions?

**Documentation:**
- [Quick Start Guide](./QUICKSTART.md)
- [Implementation Guide](./BLACKBERRY_IMPLEMENTATION_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Project Summary](./PROJECT_SUMMARY.md)
- [Setup Checklist](./SETUP_CHECKLIST.md)

**Support:**
- BlackBerry Support: https://support.blackberry.com
- Community Forums: https://supportforums.blackberry.com
- GitHub Issues: [Report bugs and request features]

**Contact:**
- BlackBerry Sales: https://www.blackberry.com/us/en/company/contact-us
- Developer Portal: https://developers.blackberry.com

---

**Last Updated**: November 2025
