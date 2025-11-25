# Deployment Guide - BlackBerry Dynamics Messaging App

## Overview

This guide covers deploying the BlackBerry Dynamics Messaging App to production environments.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose (for containerized deployment)
- BlackBerry UEM server configured
- SSL certificates for HTTPS/WSS
- Domain name (for production)

## Deployment Options

### Option 1: Docker Compose (Recommended)

#### 1. Prepare Environment

```bash
# Copy environment files
cp .env.example .env
cp server/.env.example server/.env

# Update with production values
nano .env
nano server/.env
```

#### 2. Build and Start

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 3. Verify Deployment

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost:5173
```

### Option 2: Manual Deployment

#### 1. Build Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output will be in ./dist
```

#### 2. Build Backend

```bash
# Install dependencies
cd server
npm install

# Build for production
npm run build

# Output will be in ./server/dist
```

#### 3. Deploy to Server

```bash
# Copy files to server
scp -r dist/ user@server:/var/www/messaging-app/
scp -r server/dist/ user@server:/var/www/messaging-app/server/
scp -r server/node_modules/ user@server:/var/www/messaging-app/server/

# SSH to server
ssh user@server

# Start backend with PM2
cd /var/www/messaging-app/server
pm2 start dist/index.js --name messaging-backend

# Configure Nginx for frontend
sudo nano /etc/nginx/sites-available/messaging-app
```

### Option 3: Cloud Platforms

#### AWS Deployment

**Using Elastic Beanstalk:**

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p node.js-18 messaging-app

# Create environment
eb create messaging-production

# Deploy
eb deploy
```

**Using ECS (Docker):**

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t messaging-app .
docker tag messaging-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/messaging-app:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/messaging-app:latest

# Deploy to ECS using task definition
aws ecs update-service --cluster messaging-cluster --service messaging-service --force-new-deployment
```

#### Azure Deployment

```bash
# Login to Azure
az login

# Create resource group
az group create --name messaging-rg --location eastus

# Create App Service plan
az appservice plan create --name messaging-plan --resource-group messaging-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group messaging-rg --plan messaging-plan --name messaging-app --runtime "NODE|18-lts"

# Deploy
az webapp deployment source config-zip --resource-group messaging-rg --name messaging-app --src dist.zip
```

#### Google Cloud Platform

```bash
# Initialize gcloud
gcloud init

# Deploy to App Engine
gcloud app deploy

# Or deploy to Cloud Run
gcloud run deploy messaging-app --source . --platform managed --region us-central1
```

## Production Configuration

### 1. Environment Variables

**Frontend (.env):**
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/rt/messages
VITE_GD_APP_ID=com.yourcompany.messaging
VITE_GD_APP_VERSION=1.0.0
VITE_GD_SERVER_URL=https://your-uem-server.com
```

**Backend (server/.env):**
```bash
NODE_ENV=production
PORT=3001
GD_SERVER_URL=https://your-uem-server.com
GD_APP_ID=com.yourcompany.messaging
GD_APP_VERSION=1.0.0
JWT_SECRET=<strong-random-secret>
ENCRYPTION_KEY=<strong-random-key>
CORS_ORIGIN=https://yourdomain.com
```

### 2. SSL/TLS Configuration

**Generate SSL Certificate:**

```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Or use your certificate provider
```

**Nginx SSL Configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}
```

### 3. WebSocket SSL (WSS)

Update backend to support WSS:

```typescript
// server/src/index.ts
import https from 'https';
import fs from 'fs';

const server = https.createServer({
  cert: fs.readFileSync('/path/to/cert.pem'),
  key: fs.readFileSync('/path/to/key.pem')
}, app);

const wss = new WebSocketServer({ server });
```

### 4. Database Setup (Optional)

If using PostgreSQL:

```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb messaging_db

# Create user
sudo -u postgres createuser messaging_user

# Grant privileges
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE messaging_db TO messaging_user;
```

Update server/.env:
```bash
DATABASE_URL=postgresql://messaging_user:password@localhost:5432/messaging_db
```

### 5. Redis Setup (Optional)

For session management and caching:

```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

Update server/.env:
```bash
REDIS_URL=redis://localhost:6379
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow backend port (if not behind reverse proxy)
sudo ufw allow 3001/tcp

# Enable firewall
sudo ufw enable
```

### 2. Rate Limiting

Add to Nginx configuration:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=ws_limit:10m rate=5r/s;

server {
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        # ... rest of config
    }

    location /rt/ {
        limit_req zone=ws_limit burst=10 nodelay;
        # ... rest of config
    }
}
```

### 3. Security Headers

Already configured in nginx.conf:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy

### 4. DDoS Protection

Consider using:
- Cloudflare
- AWS Shield
- Azure DDoS Protection
- Google Cloud Armor

## Monitoring and Logging

### 1. Application Monitoring

**Using PM2:**

```bash
# Install PM2
npm install -g pm2

# Start with monitoring
pm2 start server/dist/index.js --name messaging-backend

# Monitor
pm2 monit

# View logs
pm2 logs messaging-backend

# Setup startup script
pm2 startup
pm2 save
```

**Using Docker:**

```bash
# View logs
docker-compose logs -f backend

# Monitor resources
docker stats
```

### 2. Log Management

**Configure log rotation:**

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/messaging-app

# Add configuration
/var/www/messaging-app/server/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Health Checks

**Setup monitoring service:**

```bash
# Using UptimeRobot, Pingdom, or custom script
curl -f http://localhost:3001/health || exit 1
```

**Kubernetes health checks:**

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Backup and Recovery

### 1. Database Backup

```bash
# PostgreSQL backup
pg_dump messaging_db > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/messaging"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump messaging_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### 2. File Backup

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz server/uploads/

# Sync to S3
aws s3 sync server/uploads/ s3://your-bucket/uploads/ --delete
```

### 3. Configuration Backup

```bash
# Backup environment files
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env server/.env
```

## Scaling

### 1. Horizontal Scaling

**Using PM2 Cluster Mode:**

```bash
pm2 start server/dist/index.js -i max --name messaging-backend
```

**Using Docker Swarm:**

```bash
docker swarm init
docker stack deploy -c docker-compose.yml messaging-stack
docker service scale messaging-stack_backend=3
```

**Using Kubernetes:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: messaging-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: messaging-backend
  template:
    metadata:
      labels:
        app: messaging-backend
    spec:
      containers:
      - name: backend
        image: messaging-app:latest
        ports:
        - containerPort: 3001
```

### 2. Load Balancing

**Nginx Load Balancer:**

```nginx
upstream backend_servers {
    least_conn;
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

server {
    location /api/ {
        proxy_pass http://backend_servers;
    }
}
```

### 3. WebSocket Scaling

For WebSocket scaling, use Redis pub/sub:

```typescript
// server/src/index.ts
import Redis from 'ioredis';

const pub = new Redis(process.env.REDIS_URL);
const sub = new Redis(process.env.REDIS_URL);

sub.subscribe('messages');
sub.on('message', (channel, message) => {
  broadcast(JSON.parse(message));
});

function broadcast(obj: any) {
  pub.publish('messages', JSON.stringify(obj));
  // ... local broadcast
}
```

## Troubleshooting

### Common Issues

**1. WebSocket connection fails in production**
- Ensure WSS is configured
- Check firewall rules
- Verify SSL certificates
- Check proxy configuration

**2. High memory usage**
- Enable Node.js memory limits: `--max-old-space-size=2048`
- Implement message pagination
- Clear old messages from cache

**3. Slow response times**
- Enable Redis caching
- Optimize database queries
- Use CDN for static assets
- Enable Gzip compression

**4. SSL certificate errors**
- Verify certificate chain
- Check certificate expiration
- Ensure proper domain configuration

## Rollback Procedure

### Docker Deployment

```bash
# List previous images
docker images

# Rollback to previous version
docker-compose down
docker tag messaging-app:previous messaging-app:latest
docker-compose up -d
```

### Manual Deployment

```bash
# Keep previous version
mv dist dist.backup
mv server/dist server/dist.backup

# Rollback if needed
mv dist.backup dist
mv server/dist.backup server/dist

# Restart services
pm2 restart messaging-backend
```

## Performance Optimization

### 1. Enable Caching

```nginx
# Nginx caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
}
```

### 2. CDN Integration

Use CloudFront, Cloudflare, or similar:

```bash
# Upload static assets to S3
aws s3 sync dist/ s3://your-bucket/

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name your-bucket.s3.amazonaws.com
```

### 3. Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM messages WHERE conversation_id = 'conv_123';
```

## Maintenance

### Regular Tasks

**Daily:**
- Check application logs
- Monitor error rates
- Verify backup completion

**Weekly:**
- Review security logs
- Update dependencies
- Check disk space

**Monthly:**
- Security audit
- Performance review
- Update SSL certificates (if needed)

### Update Procedure

```bash
# 1. Backup current version
tar -czf backup_$(date +%Y%m%d).tar.gz dist/ server/dist/

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install
cd server && npm install && cd ..

# 4. Build
npm run build
cd server && npm run build && cd ..

# 5. Test
npm run test

# 6. Deploy
docker-compose down
docker-compose up -d --build

# 7. Verify
curl http://localhost:3001/health
```

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- Review documentation: [BLACKBERRY_IMPLEMENTATION_GUIDE.md](./BLACKBERRY_IMPLEMENTATION_GUIDE.md)
- Contact BlackBerry Support: https://support.blackberry.com

---

**Last Updated**: November 2025
