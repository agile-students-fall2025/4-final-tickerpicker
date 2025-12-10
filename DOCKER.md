# Docker Deployment Guide

This project includes Docker containerization for both the frontend and backend services.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Docker Compose v3.8 or higher

## Quick Start

1. **Set up environment variables:**

   The `.env` file must be in the **root directory** (same directory as `docker-compose.yml`).

   ```bash
   cp docker-compose.env.example .env
   ```

   Edit `.env` and fill in:

   - `MONGODB_URI`: Your MongoDB connection string (MongoDB Atlas or local)
   - `JWT_SECRET`: A strong secret key for JWT token signing
   - `PORT`: Backend port (default: 3001)

   **Important:** The `.env` file location is critical:

   - ✅ **Correct**: `.env` in the root directory (where `docker-compose.yml` is)
   - ❌ **Wrong**: `.env` in `back-end/` directory (that's for local development only)

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

### File Location

The `.env` file for Docker Compose must be in the **root directory** of the project (same location as `docker-compose.yml`).

```
project-root/
├── docker-compose.yml
├── .env                    ← Docker Compose reads from here
├── docker-compose.env.example
├── back-end/
│   ├── .env               ← This is for local development only
│   └── ...
└── front-end/
    └── ...
```

### Required Variables

Required environment variables (set in root `.env` file):

- `MONGODB_URI`: MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/tickerpicker`)
- `JWT_SECRET`: Secret key for JWT authentication (use a strong random string)
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

If you see:

```
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:3001 -> 0.0.0.0:0: listen tcp 0.0.0.0:3001: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.
```

This means you have a local server running on that port. Options:

1. **Stop the local server** (recommended):

   - Stop any running `npm run dev` processes in your terminals
   - Or find and kill the process: `netstat -ano | findstr :3001` (Windows) or `lsof -i :3001` (Mac/Linux)

2. **Change Docker port mapping** in `docker-compose.yml`:
   ```yaml
   ports:
     - "3002:3001" # Use 3002 on host instead
   ```

### Build fails with package-lock.json errors

If you see errors like:

```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Invalid: lock file's mongoose@8.20.1 does not satisfy mongoose@9.0.1
```

This means your `package-lock.json` is out of sync with `package.json`. Fix it by:

**For backend:**

```bash
cd back-end
rm package-lock.json
npm install
```

**For root (frontend build):**

```bash
# In the root directory
rm package-lock.json
npm install
```

The Dockerfiles use `npm install` instead of `npm ci`, so they should work even with minor mismatches, but it's best to keep lock files in sync.

### Build fails (general)

- Ensure all required files are present
- Check Dockerfile syntax
- Review build logs: `docker-compose build --no-cache`
- Verify `.env` file is in the root directory (not in `back-end/`)

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
