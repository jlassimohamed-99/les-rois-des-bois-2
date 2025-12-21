# Docker Deployment Guide

## Quick Start

### 1. Build the Docker Image

```bash
docker build -t les-rois-des-bois .
```

### 2. Run the Container

```bash
docker run -d \
  --name les-rois-des-bois \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/backend/uploads:/app/backend/uploads \
  les-rois-des-bois
```

### 3. Using Docker Compose (Recommended)

```bash
# Make sure .env file exists with required variables
docker-compose up -d
```

## Environment Variables

Create a `.env` file in the project root with:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
MONGO_URI=mongodb://localhost:27017/les-rois-des-bois
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/les-rois-des-bois
JWT_EXPIRES_IN=7d
```

## Dockerfile Structure

The Dockerfile uses a **multi-stage build**:

1. **Stage 1 (frontend-builder)**: Builds the React frontend
   - Installs frontend dependencies
   - Builds frontend to `/app/dist`

2. **Stage 2 (production)**: Production runtime
   - Installs only backend production dependencies
   - Copies built frontend from Stage 1
   - Copies backend code and server.js
   - Runs the unified server

## Volume Mounts

The `uploads` directory is mounted as a volume to persist uploaded files:

```yaml
volumes:
  - ./backend/uploads:/app/backend/uploads
```

## Health Check

The container includes a health check that pings `/api/health`:

```bash
# Check container health
docker ps
# Look for "healthy" status
```

## Troubleshooting

### Build fails with "dist not found"
- Check that `frontend/vite.config.js` has `outDir: '../dist'`
- Verify frontend build completes successfully

### Container exits immediately
- Check logs: `docker logs les-rois-des-bois`
- Verify MongoDB connection string is correct
- Ensure all required environment variables are set

### Port already in use
- Change the port mapping: `-p 3000:5000`
- Or stop the service using port 5000

### Uploads not persisting
- Ensure the volume mount path is correct
- Check file permissions on the host directory

## Production Deployment

### On EasyPanel / VPS

1. **Build on server**:
   ```bash
   git clone <your-repo>
   cd les-rois-des-bois-2
   docker build -t les-rois-des-bois .
   ```

2. **Create .env file**:
   ```bash
   nano .env
   # Add all required variables
   ```

3. **Run with docker-compose**:
   ```bash
   docker-compose up -d
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f
   ```

### Using Docker Hub

1. **Tag and push**:
   ```bash
   docker tag les-rois-des-bois yourusername/les-rois-des-bois:latest
   docker push yourusername/les-rois-des-bois:latest
   ```

2. **Pull and run on server**:
   ```bash
   docker pull yourusername/les-rois-des-bois:latest
   docker run -d --name app -p 5000:5000 --env-file .env yourusername/les-rois-des-bois:latest
   ```

## Commands Reference

```bash
# Build
docker build -t les-rois-des-bois .

# Run
docker run -d --name app -p 5000:5000 --env-file .env les-rois-des-bois

# Stop
docker stop app

# Start
docker start app

# Logs
docker logs -f app

# Shell access
docker exec -it app sh

# Remove
docker rm -f app

# Using docker-compose
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose logs -f        # View logs
docker-compose restart        # Restart
```


