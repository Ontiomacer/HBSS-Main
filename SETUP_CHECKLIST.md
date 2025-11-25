# Setup Checklist - BlackBerry Dynamics Messaging App

Use this checklist to ensure your messaging app is properly configured and ready for deployment.

## ✅ Prerequisites

### Development Environment
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command line access

### BlackBerry Requirements
- [ ] BlackBerry UEM server access
- [ ] BlackBerry Dynamics entitlement
- [ ] Application credentials from UEM console
- [ ] Valid BlackBerry Dynamics SDK license

### Optional Tools
- [ ] Docker and Docker Compose (for containerized deployment)
- [ ] PostgreSQL (for production database)
- [ ] Redis (for session management and caching)
- [ ] Nginx (for reverse proxy)

## ✅ Initial Setup

### 1. Clone and Install
```bash
# Clone repository
[ ] git clone <repository-url>
[ ] cd enigma-forge-ui-main

# Install frontend dependencies
[ ] npm install

# Install backend dependencies
[ ] cd server
[ ] npm install
[ ] cd ..
```

### 2. Environment Configuration

#### Frontend Environment
```bash
[ ] Copy .env.example to .env.local
[ ] Update VITE_API_URL (default: http://localhost:3001)
[ ] Update VITE_WS_URL (default: ws://localhost:3001/rt/messages)
[ ] Set VITE_GD_APP_ID (your BlackBerry app ID)
[ ] Set VITE_GD_APP_VERSION (your app version)
[ ] Set VITE_GD_SERVER_URL (your UEM server URL)
```

#### Backend Environment
```bash
[ ] Copy server/.env.example to server/.env
[ ] Set PORT (default: 3001)
[ ] Set NODE_ENV (development or production)
[ ] Set GD_SERVER_URL (your UEM server URL)
[ ] Set GD_APP_ID (your BlackBerry app ID)
[ ] Set GD_APP_VERSION (your app version)
[ ] Generate and set JWT_SECRET (use: openssl rand -base64 32)
[ ] Generate and set ENCRYPTION_KEY (use: openssl rand -base64 32)
[ ] Set CORS_ORIGIN (frontend URL)
```

### 3. BlackBerry Dynamics SDK Setup

```bash
[ ] Verify SDK is extracted to BlackBerry_Dynamics_SDK_for_React_Native_v13.0.0.21/
[ ] Check SDK modules are present
[ ] Review SDK documentation
[ ] Configure GdInit.ts with your app credentials
```

### 4. Verify Installation

```bash
# Check frontend
[ ] npm run dev (should start on port 5173)
[ ] Open http://localhost:5173 in browser
[ ] Verify no console errors

# Check backend
[ ] cd server && npm run dev (should start on port 3001)
[ ] curl http://localhost:3001/health (should return {"status":"ok"})
[ ] Check server logs for errors
```

## ✅ Development Setup

### 1. Code Editor Configuration

#### VS Code Extensions (Recommended)
- [ ] ESLint
- [ ] Prettier
- [ ] TypeScript and JavaScript Language Features
- [ ] Tailwind CSS IntelliSense
- [ ] Docker (if using containers)

#### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 2. Git Configuration

```bash
[ ] git config user.name "Your Name"
[ ] git config user.email "your.email@company.com"
[ ] Review .gitignore file
[ ] Create feature branch: git checkout -b feature/your-feature
```

### 3. Development Workflow

```bash
# Start development servers
[ ] Terminal 1: cd server && npm run dev
[ ] Terminal 2: npm run dev
[ ] Browser: http://localhost:5173/messaging

# Verify functionality
[ ] Can access messaging page
[ ] Can see connection status
[ ] Can type in message input
[ ] WebSocket connects successfully
```

## ✅ BlackBerry UEM Configuration

### 1. UEM Console Setup

```bash
[ ] Log in to BlackBerry UEM console
[ ] Navigate to Apps section
[ ] Create new application entry
[ ] Set application name and description
[ ] Generate application credentials
[ ] Configure entitlements
[ ] Set security policies
[ ] Assign to user groups
```

### 2. Application Configuration

```bash
[ ] Set App ID (must match VITE_GD_APP_ID)
[ ] Set App Version (must match VITE_GD_APP_VERSION)
[ ] Configure authentication settings
[ ] Set data loss prevention policies
[ ] Configure network settings
[ ] Enable required features (messaging, file sharing)
```

### 3. User Provisioning

```bash
[ ] Create test users in UEM
[ ] Assign application to test users
[ ] Configure user permissions
[ ] Test user authentication
```

## ✅ Testing

### 1. Unit Tests

```bash
[ ] npm run test (frontend)
[ ] cd server && npm run test (backend)
[ ] Review test coverage
[ ] Fix any failing tests
```

### 2. Integration Tests

```bash
[ ] Test message sending
[ ] Test message receiving
[ ] Test file upload
[ ] Test group conversations
[ ] Test encryption modes
```

### 3. Manual Testing

```bash
[ ] Open app in browser
[ ] Navigate to /messaging
[ ] Send a test message
[ ] Verify message appears
[ ] Test in multiple tabs (real-time sync)
[ ] Test different encryption modes
[ ] Test file upload
[ ] Test connection recovery (stop/start backend)
```

### 4. Security Testing

```bash
[ ] Verify HTTPS/WSS in production
[ ] Test authentication flow
[ ] Verify message encryption
[ ] Test token validation
[ ] Check for XSS vulnerabilities
[ ] Test CORS configuration
[ ] Verify rate limiting
```

## ✅ Production Preparation

### 1. Build Configuration

```bash
[ ] Update .env with production values
[ ] Update server/.env with production values
[ ] Set NODE_ENV=production
[ ] Configure production API URLs
[ ] Set secure JWT_SECRET
[ ] Set secure ENCRYPTION_KEY
```

### 2. Security Hardening

```bash
[ ] Enable HTTPS/TLS
[ ] Configure SSL certificates
[ ] Enable WSS (secure WebSocket)
[ ] Set up firewall rules
[ ] Configure rate limiting
[ ] Enable security headers
[ ] Set up DDoS protection
[ ] Configure CORS properly
```

### 3. Performance Optimization

```bash
[ ] Enable Gzip compression
[ ] Configure CDN for static assets
[ ] Set up Redis caching
[ ] Optimize database queries
[ ] Enable connection pooling
[ ] Configure load balancing
```

### 4. Monitoring Setup

```bash
[ ] Set up application monitoring (PM2, New Relic, etc.)
[ ] Configure log aggregation
[ ] Set up error tracking (Sentry, etc.)
[ ] Configure health checks
[ ] Set up uptime monitoring
[ ] Configure alerting
```

### 5. Backup Configuration

```bash
[ ] Set up database backups
[ ] Configure file storage backups
[ ] Set up configuration backups
[ ] Test restore procedures
[ ] Document backup schedule
```

## ✅ Deployment

### Docker Deployment

```bash
[ ] Review Dockerfile
[ ] Review docker-compose.yml
[ ] Build images: docker-compose build
[ ] Start services: docker-compose up -d
[ ] Verify health: docker-compose ps
[ ] Check logs: docker-compose logs -f
[ ] Test application functionality
```

### Manual Deployment

```bash
[ ] Build frontend: npm run build
[ ] Build backend: cd server && npm run build
[ ] Copy files to server
[ ] Install production dependencies
[ ] Configure Nginx
[ ] Start backend with PM2
[ ] Test application
[ ] Configure SSL
```

### Cloud Deployment

#### AWS
```bash
[ ] Set up EC2 instances or ECS
[ ] Configure security groups
[ ] Set up load balancer
[ ] Configure Route 53 DNS
[ ] Set up CloudFront CDN
[ ] Configure S3 for file storage
[ ] Set up RDS for database
[ ] Configure CloudWatch monitoring
```

#### Azure
```bash
[ ] Create App Service
[ ] Configure application settings
[ ] Set up Azure CDN
[ ] Configure Azure Storage
[ ] Set up Azure Database
[ ] Configure Application Insights
```

#### Google Cloud
```bash
[ ] Set up Cloud Run or App Engine
[ ] Configure Cloud Load Balancing
[ ] Set up Cloud CDN
[ ] Configure Cloud Storage
[ ] Set up Cloud SQL
[ ] Configure Cloud Monitoring
```

## ✅ Post-Deployment

### 1. Verification

```bash
[ ] Access production URL
[ ] Test user authentication
[ ] Send test messages
[ ] Verify real-time functionality
[ ] Test file uploads
[ ] Check all features work
[ ] Verify SSL/TLS
[ ] Test on different devices/browsers
```

### 2. Monitoring

```bash
[ ] Check application logs
[ ] Verify monitoring dashboards
[ ] Test alerting
[ ] Review error rates
[ ] Check performance metrics
[ ] Monitor resource usage
```

### 3. Documentation

```bash
[ ] Update README with production URLs
[ ] Document deployment process
[ ] Create runbook for operations
[ ] Document troubleshooting steps
[ ] Create user guide
[ ] Document API endpoints
```

### 4. Training

```bash
[ ] Train operations team
[ ] Train support team
[ ] Train end users
[ ] Create training materials
[ ] Schedule training sessions
```

## ✅ Maintenance

### Daily Tasks
```bash
[ ] Check application logs
[ ] Monitor error rates
[ ] Verify backup completion
[ ] Check system resources
```

### Weekly Tasks
```bash
[ ] Review security logs
[ ] Update dependencies
[ ] Check disk space
[ ] Review performance metrics
[ ] Test backup restoration
```

### Monthly Tasks
```bash
[ ] Security audit
[ ] Performance review
[ ] Update SSL certificates (if needed)
[ ] Review and update documentation
[ ] Plan feature updates
```

## ✅ Troubleshooting Checklist

### Backend Not Starting
```bash
[ ] Check if port 3001 is available
[ ] Verify Node.js version
[ ] Check environment variables
[ ] Review error logs
[ ] Verify dependencies installed
```

### Frontend Not Connecting
```bash
[ ] Verify backend is running
[ ] Check API URL configuration
[ ] Check CORS settings
[ ] Review browser console errors
[ ] Verify network connectivity
```

### WebSocket Issues
```bash
[ ] Check WebSocket URL
[ ] Verify backend WebSocket server
[ ] Check firewall rules
[ ] Review proxy configuration
[ ] Test with different browsers
```

### BlackBerry Dynamics Issues
```bash
[ ] Verify UEM server connectivity
[ ] Check application credentials
[ ] Review GD initialization logs
[ ] Verify entitlements
[ ] Check device/browser compatibility
```

## 📚 Additional Resources

- [ ] Read [QUICKSTART.md](./QUICKSTART.md)
- [ ] Review [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md)
- [ ] Study [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- [ ] Visit BlackBerry Developer Portal
- [ ] Join BlackBerry Community Forums

## ✅ Sign-off

### Development Team
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Security review done

### Operations Team
- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Backups tested
- [ ] Runbook created

### Security Team
- [ ] Security audit complete
- [ ] Penetration testing done
- [ ] Compliance verified
- [ ] Certificates configured

### Management
- [ ] Budget approved
- [ ] Timeline confirmed
- [ ] Resources allocated
- [ ] Go-live approved

---

**Checklist Version**: 1.0  
**Last Updated**: November 2025  
**Status**: Ready for Production ✅
