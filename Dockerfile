# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build frontend (outputs to ../dist relative to frontend dir, so /app/dist)
RUN npm run build

# Verify dist was created
RUN ls -la /app/dist || (echo "Build failed - dist not found" && exit 1)

# ============================================
# Stage 2: Production
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy root package.json
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Copy server.js
COPY server.js ./

# Create uploads directory (if needed)
RUN mkdir -p backend/uploads

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "server.js"]

