# Docker Deployment Guide

This project includes Docker containerization for both the frontend and backend services.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Docker Compose v3.8 or higher

## Quick Start

1. **Set up environment variables:**

   ```bash
   cp docker-compose.env.example .env
   ```

   Edit `.env` and fill in:

   - `MONGODB_URI`: Your MongoDB connection string (MongoDB Atlas or local)
   - `JWT_SECRET`: A strong secret key for JWT token signing
   - `PORT`: Backend port (default: 3001)

2. **Build and start containers:**

   ```bash
   docker-compose up --build
   ```

   Or run in detached mode:

   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**

   - Frontend: http://localhost
   - Backend API: http://localhost:3001

## Docker Commands

### Build images

```bash
docker-compose build
```

### Start services

```bash
docker-compose up
```

### Start in background

```bash
docker-compose up -d
```

### Stop services

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

### Restart a service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild after code changes

```bash
docker-compose up --build
```

### Remove containers and volumes

```bash
docker-compose down -v
```

## Architecture

- **Backend Container**: Node.js 22 Alpine, runs Express.js server on port 3001
- **Frontend Container**: Nginx Alpine, serves static React build files on port 80
- **Network**: Both containers communicate via Docker bridge network

## Environment Variables

Required environment variables (set in `.env` file):

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Backend server port (default: 3001)

## Development vs Production

For development, you may want to:

- Mount volumes for hot-reloading (not included in current setup)
- Use development dependencies
- Enable debug logging

For production:

- Use production dependencies only
- Optimize build sizes
- Set proper environment variables
- Use secrets management

## Troubleshooting

### Backend won't start

- Check MongoDB connection string in `.env`
- Verify `JWT_SECRET` is set
- Check logs: `docker-compose logs backend`

### Frontend shows 502 Bad Gateway

- Ensure backend is running: `docker-compose ps`
- Check backend logs for errors
- Verify network connectivity between containers

### Port already in use

- Change port mappings in `docker-compose.yml`
- Or stop the service using the port

### Build fails

- Ensure all required files are present
- Check Dockerfile syntax
- Review build logs: `docker-compose build --no-cache`

## Building Individual Images

### Backend only

```bash
cd back-end
docker build -t tickerpicker-backend .
docker run -p 3001:3001 --env-file ../.env tickerpicker-backend
```

### Frontend only

```bash
docker build -f front-end/Dockerfile -t tickerpicker-frontend .
docker run -p 80:80 tickerpicker-frontend
```

## Notes

- The frontend container proxies `/api` requests to the backend
- Both containers share a Docker network for internal communication
- Health checks are configured for the backend service
- The frontend uses Nginx for serving static files and API proxying
