# Multi-stage Dockerfile for BlackBerry Dynamics Messaging App

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY components.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY src ./src
COPY public ./public
COPY App.tsx ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy backend package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy backend source
COPY server/src ./src

# Build backend
RUN npm run build

# Stage 3: Production
FROM node:18-alpine

WORKDIR /app

# Install production dependencies for backend
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy built backend
COPY --from=backend-builder /app/server/dist ./server/dist

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p ./server/uploads

# Expose ports
EXPOSE 3001 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start backend server
CMD ["node", "server/dist/index.js"]
