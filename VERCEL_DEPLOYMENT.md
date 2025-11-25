# Vercel Deployment Guide

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the project directory:
```bash
cd enigma-forge-ui-main
vercel
```

4. Follow the prompts and deploy!

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Vite configuration
6. Click "Deploy"

## 📋 Environment Variables

You need to configure these environment variables in Vercel:

### Required Variables:
- `VITE_API_URL` - Your backend API URL (e.g., https://your-api.com)
- `VITE_WS_URL` - Your WebSocket URL (e.g., wss://your-api.com/rt/messages)

### Optional Variables:
- `VITE_GD_APP_ID` - BlackBerry Dynamics App ID
- `VITE_GD_APP_VERSION` - BlackBerry Dynamics App Version
- `VITE_GD_SERVER_URL` - BlackBerry UEM Server URL
- `VITE_ENABLE_QUANTUM_MODE` - Enable quantum-resistant features (default: true)
- `VITE_ENABLE_FILE_SHARING` - Enable file sharing (default: true)
- `VITE_ENABLE_GROUP_CHAT` - Enable group chat (default: true)
- `VITE_DEBUG_MODE` - Enable debug mode (default: false)
- `VITE_LOG_LEVEL` - Logging level (default: info)

### Setting Environment Variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable with its value
4. Select which environments (Production, Preview, Development)
5. Click "Save"

## 🔧 Build Configuration

The project is configured with:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher (recommended)

## 🌐 Custom Domain

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## 🔄 Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches
- **Pull Requests**: Automatic preview deployments

## 📦 Backend Deployment

Note: This deployment only covers the frontend. For the backend:

### Option 1: Deploy Backend to Vercel Serverless
- Convert Express backend to Vercel serverless functions
- See: https://vercel.com/docs/functions

### Option 2: Deploy Backend Separately
- Use Railway, Render, or Heroku for the Python backend
- Update `VITE_API_URL` and `VITE_WS_URL` accordingly

### Option 3: Use Vercel Edge Functions
- Implement WebSocket proxy using Vercel Edge Functions
- See: https://vercel.com/docs/functions/edge-functions

## ✅ Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Backend API accessible
- [ ] WebSocket connection working
- [ ] CORS configured on backend
- [ ] Custom domain configured (if applicable)
- [ ] SSL/HTTPS enabled (automatic with Vercel)
- [ ] Test all features in production

## 🐛 Troubleshooting

### Build Fails
- Check Node version (use 18.x or higher)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

### API Connection Issues
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is deployed and accessible

### WebSocket Issues
- Verify `VITE_WS_URL` uses `wss://` (not `ws://`)
- Check WebSocket support on backend hosting
- Some platforms require specific WebSocket configuration

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Redeploy after adding new variables
- Check variable values in Vercel dashboard

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)
