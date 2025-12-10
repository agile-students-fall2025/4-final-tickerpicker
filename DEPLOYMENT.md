# Deployment Guide

This document describes how to deploy TickerPicker to DigitalOcean and how team members can access and update the deployment.

## Production Deployment

Our application is deployed on a DigitalOcean Droplet using Docker containers.

### Production URLs

- **Frontend**: http://174.138.59.87/
- **Backend API**: http://174.138.59.87:3001
- **Health Check**: http://174.138.59.87:3001/api/health

## Initial Deployment Setup

### Prerequisites

- DigitalOcean Droplet (Ubuntu 22.04)
- SSH access to the Droplet (password or SSH key)
- MongoDB Atlas account with connection string
- GitHub repository access

### Step 1: Connect to Droplet

```bash
ssh root@174.138.59.87
# Enter password when prompted
```

### Step 2: Install Docker

```bash
# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose plugin
apt-get install -y docker-compose-plugin git

# Verify installation
docker --version
docker compose version
```

### Step 3: Clone Repository

```bash
cd /root
git clone https://github.com/agile-students-fall2025/4-final-tickerpicker.git
cd 4-final-tickerpicker
```

### Step 4: Configure Environment

```bash
# Create .env file
cp docker-compose.env.example .env
nano .env
```

Add your environment variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tickerpicker?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret-key-here
PORT=3001
```

Save and exit (Ctrl+X, Y, Enter)

### Step 5: Configure Firewall

```bash
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 22/tcp    # SSH
ufw enable
```

### Step 6: Deploy

```bash
# Build and start containers
docker compose up -d --build

# Verify containers are running
docker compose ps

# Check logs
docker compose logs
```

### Step 7: Configure MongoDB Atlas

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add your Droplet's IP address
4. Click "Confirm"

## How Team Members Can Access the Deployment

### For End Users (Testing/Demo)

Team members can access the deployed application by visiting:

- **Frontend**: http://174.138.59.87/
- **Backend API**: http://174.138.59.87:3001/api/health

No special access needed - just the URL!

### For Developers (Updating Deployment)

Team members who need to update the deployment need:

1. **SSH Access to Droplet**

   - Get the Droplet IP and password from the team lead
   - Or set up SSH keys (see below)

2. **SSH Connection**:

   ```bash
   ssh root@174.138.59.87
   ```

3. **Navigate to Project**:
   ```bash
   cd /root/4-final-tickerpicker
   ```

## Updating the Deployment

### Method 1: Manual Update (Recommended for now)

When code is merged to `main` branch:

1. **SSH into Droplet**:

   ```bash
   ssh root@174.138.59.87
   ```

2. **Navigate to Project**:

   ```bash
   cd /root/4-final-tickerpicker
   ```

3. **Pull Latest Code**:

   ```bash
   git pull origin main
   ```

4. **Rebuild and Restart Containers**:

   ```bash
   docker compose down
   docker compose up -d --build
   ```

5. **Verify Deployment**:
   ```bash
   docker compose ps
   docker compose logs
   ```

### Method 2: Automated Deployment via GitHub Actions (Future)

We have a CD workflow configured (`.github/workflows/cd.yml`) that can automatically deploy when code is pushed to `main`. To enable it:

1. **Set up GitHub Secrets** (Repository Settings → Secrets):

   - `DO_HOST`: `174.138.59.87`
   - `DO_USER`: `root`
   - `DO_SSH_KEY`: Private SSH key for Droplet access
   - `DO_PORT`: `22`
   - `DEPLOY_PATH`: `/root/4-final-tickerpicker`

2. **Update CD Workflow** to use Docker (already configured)

3. **Deployments will trigger automatically** when:
   - Code is merged to `main` branch
   - CI tests pass
   - Or manually via GitHub Actions → "Run workflow"

## Setting Up SSH Keys for Team Members

To allow multiple team members to deploy without sharing passwords:

### On Team Member's Local Machine:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

### On Droplet:

```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add team member's public key
nano ~/.ssh/authorized_keys
# Paste the public key, save and exit

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
```

Now team members can SSH without password:

```bash
ssh root@174.138.59.87
```

## Deployment Workflow

### Standard Process:

1. **Develop locally** on feature branches
2. **Test locally** with Docker: `docker compose up --build`
3. **Create Pull Request** to `main` branch
4. **CI runs automatically** (tests, builds)
5. **After PR is merged**:
   - **Option A**: Manual deployment (SSH and run update commands)
   - **Option B**: Automatic deployment (if GitHub Actions is configured)

### Who Can Deploy?

- **Team Lead/DevOps**: Full access to Droplet
- **Team Members**: Can be granted SSH access for deployments
- **End Users**: Access via web browser only

## Monitoring and Troubleshooting

### Check Container Status

```bash
docker compose ps
```

Should show both `tickerpicker-backend` and `tickerpicker-frontend` as "Up"

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend

# Follow logs in real-time
docker compose logs -f
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

### Common Issues

**Containers won't start:**

```bash
# Check logs for errors
docker compose logs

# Rebuild from scratch
docker compose down
docker compose up -d --build
```

**Can't access from browser:**

- Check firewall: `ufw status`
- Verify containers are running: `docker compose ps`
- Check MongoDB Atlas IP whitelist includes Droplet IP

**Environment variables not working:**

- Verify `.env` file exists: `cat .env`
- Check file is in root directory: `ls -la /root/4-final-tickerpicker/.env`
- Restart containers after changing `.env`: `docker compose restart`

**Port conflicts:**

- Check what's using port 80: `netstat -tulpn | grep :80`
- Check what's using port 3001: `netstat -tulpn | grep :3001`

## Security Best Practices

1. **Never commit `.env` file** - it's in `.gitignore`
2. **Use strong JWT_SECRET** - generate with: `openssl rand -base64 32`
3. **Limit SSH access** - only grant to trusted team members
4. **Keep system updated**: `apt-get update && apt-get upgrade`
5. **Monitor logs** regularly for suspicious activity
6. **Use MongoDB Atlas IP whitelist** - only allow your Droplet IP

## Backup and Recovery

### Backup Environment Variables

```bash
# On Droplet
cat /root/4-final-tickerpicker/.env > ~/env-backup.txt
# Download this file securely
```

### Restore from Backup

```bash
# Copy backup to Droplet
# Then restore
cp ~/env-backup.txt /root/4-final-tickerpicker/.env
docker compose restart
```

## Cost Management

- **Droplet**: ~$6/month (Basic plan)
- **MongoDB Atlas**: Free tier available
- **Total**: ~$6/month (or use DigitalOcean credits)

## Support

For deployment issues:

1. Check logs: `docker compose logs`
2. Verify containers: `docker compose ps`
3. Check MongoDB connection
4. Contact team lead with error messages

---

**Last Updated**: December 2024
**Deployment Method**: Docker on DigitalOcean Droplet
