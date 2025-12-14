# Running Campus Event Platform Backend with Docker on WSL Ubuntu

## Prerequisites
- WSL Ubuntu installed ✅
- Docker needs to be installed in WSL

## Step 1: Install Docker in WSL Ubuntu

Open WSL Ubuntu terminal and run these commands:

```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Start Docker service
sudo service docker start
```

## Step 2: Verify Docker Installation

```bash
# Check Docker version
docker --version

# Check Docker Compose
docker compose version

# Test Docker
docker run hello-world
```

## Step 3: Navigate to Project in WSL

Your Windows drives are mounted in WSL at `/mnt/`:

```bash
# Navigate to your project
cd "/mnt/d/BSM/7th semester/Cloud computing/project/campus-event-platform/backend"
```

## Step 4: Update docker-compose.yml for WSL

Since you're using Neon PostgreSQL (cloud database), you don't need the local PostgreSQL container. Let me create a simplified version:

**Option A: Use Neon Database (Current Setup - Recommended)**

Create `docker-compose.simple.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: campus-events-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: "${DATABASE_URL}"
      JWT_SECRET: "${JWT_SECRET}"
      JWT_EXPIRES_IN: "7d"
      PORT: 5000
      NODE_ENV: "production"
      UPLOAD_DIR: "uploads"
      MAX_FILE_SIZE: 5242880
    ports:
      - "5000:5000"
    volumes:
      - ./uploads:/app/uploads
```

**Option B: Use Local PostgreSQL (Full Docker Setup)**

Use the existing `docker-compose.yml` file.

## Step 5: Run with Docker

### Using Neon Database (Recommended):

```bash
# Make sure .env file exists with your Neon DATABASE_URL
# Start the backend container
docker compose -f docker-compose.simple.yml up -d

# View logs
docker compose -f docker-compose.simple.yml logs -f backend

# Stop
docker compose -f docker-compose.simple.yml down
```

### Using Local PostgreSQL:

```bash
# Start all containers (PostgreSQL + Backend)
docker compose up -d

# View logs
docker compose logs -f

# Stop all containers
docker compose down
```

## Step 6: Access the Application

Once running, access:
- API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Troubleshooting

### Docker service not running
```bash
sudo service docker start
```

### Permission denied
```bash
# Log out and log back in to WSL after adding user to docker group
# Or run with sudo (not recommended)
sudo docker compose up -d
```

### Port already in use
```bash
# Stop the npm dev server first
# Or change the port in docker-compose.yml
```

### WSL Docker not starting
```bash
# Enable WSL integration in Docker Desktop (if installed)
# Or use Docker directly in WSL (recommended)
```

## Quick Commands Reference

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f backend

# Stop containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Restart containers
docker compose restart

# Execute commands in container
docker compose exec backend sh

# View running containers
docker ps
```

## Notes

- The backend will automatically run migrations on startup
- Uploads folder is mounted as a volume for persistence
- Use Ctrl+C to stop if running in foreground
- Use `-d` flag to run in background (detached mode)
