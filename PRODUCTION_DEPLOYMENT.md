# Production Deployment Guide

## Prerequisites

- VPS or Cloud Server (AWS EC2, DigitalOcean, etc.)
- Domain name pointed to your server
- Ubuntu 20.04+ or similar Linux distribution
- At least 2GB RAM, 20GB storage

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 1.3 Configure Firewall
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## Step 2: Deploy Application

### 2.1 Clone Repository
```bash
cd ~
git clone https://github.com/yourusername/chat_manage.git
cd chat_manage
```

### 2.2 Create Production Environment File
```bash
cp .env.docker .env.production
nano .env.production
```

Update with your production values:
```env
# Database (use strong passwords!)
MYSQL_ROOT_PASSWORD=your_very_strong_root_password_here
DB_USER=chatuser
DB_PASSWORD=your_very_strong_db_password_here

# JWT Secrets (generate new ones)
JWT_SECRET=your_production_jwt_secret_at_least_64_characters
JWT_REFRESH_SECRET=your_production_refresh_secret_at_least_64_characters

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# OAuth - Update with production URLs
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# Production URLs (replace with your domain)
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Email settings (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

### 2.3 Generate Secure Secrets
```bash
# Generate JWT secrets
openssl rand -base64 64
openssl rand -base64 64
```

## Step 3: SSL Certificate Setup

### Option A: Let's Encrypt (Free)

1. Create certificate directory:
```bash
mkdir -p ssl
```

2. Update nginx configuration for Let's Encrypt:
```bash
nano nginx-ssl.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL certificates
        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
        
        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Frontend
        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api {
            limit_req zone=api burst=5 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts for long-running requests
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket support
        location /ws {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

3. Create Certbot Docker Compose:
```yaml
# docker-compose.certbot.yml
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --email your-email@domain.com --agree-tos --no-eff-email -d yourdomain.com -d www.yourdomain.com
```

4. Obtain certificate:
```bash
# Create directories
mkdir -p certbot/conf certbot/www

# Run temporary nginx for verification
docker run -d --name nginx-temp -p 80:80 -v $(pwd)/certbot/www:/var/www/certbot nginx

# Get certificate
docker-compose -f docker-compose.certbot.yml run --rm certbot

# Stop temporary nginx
docker stop nginx-temp && docker rm nginx-temp
```

### Option B: Commercial SSL Certificate

1. Purchase SSL certificate from provider
2. Place certificate files in `./ssl/`:
   - `cert.pem` (certificate)
   - `key.pem` (private key)
   - `chain.pem` (certificate chain)

## Step 4: Update OAuth Providers

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Update OAuth 2.0 Client:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`

### Naver OAuth
1. Go to [Naver Developers](https://developers.naver.com/)
2. Navigate to your application
3. Update Service URL: `https://yourdomain.com`
4. Update Callback URL: `https://yourdomain.com/api/auth/naver/callback`

## Step 5: Production Docker Compose

Create `docker-compose.production.yml`:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: chat-manage-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: chat_manage
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backup:/backup
    networks:
      - chat-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 10s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: chat-manage-backend
    restart: always
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - chat-network
    volumes:
      - ./backend/uploads:/app/uploads
      - ./logs/backend:/app/logs

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    container_name: chat-manage-frontend
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend
    networks:
      - chat-network

  nginx:
    image: nginx:alpine
    container_name: chat-manage-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend
    networks:
      - chat-network

networks:
  chat-network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
```

## Step 6: Deploy Script

Create `deploy-production.sh`:
```bash
#!/bin/bash

echo "🚀 Starting Production Deployment"
echo "================================="

# Load production environment
export $(cat .env.production | grep -v '^#' | xargs)

# Pull latest code
echo "📦 Pulling latest code..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Build images
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.production.yml build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Health check
echo "🏥 Checking service health..."
curl -f https://yourdomain.com/api/health || echo "Backend health check failed"
curl -f https://yourdomain.com || echo "Frontend health check failed"

echo "✅ Deployment complete!"
echo "================================="
echo "View logs: docker-compose -f docker-compose.production.yml logs -f"
```

Make it executable:
```bash
chmod +x deploy-production.sh
```

## Step 7: Backup Strategy

Create `backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="chat-manage-mysql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "Backing up database..."
docker exec $DB_CONTAINER mysqldump -u root -p${MYSQL_ROOT_PASSWORD} chat_manage > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
echo "Backing up uploads..."
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ./backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab for daily backups:
```bash
crontab -e
# Add this line:
0 2 * * * /home/user/chat_manage/backup.sh
```

## Step 8: Monitoring

### Using Docker logs
```bash
# View all logs
docker-compose -f docker-compose.production.yml logs -f

# View specific service
docker-compose -f docker-compose.production.yml logs -f backend
```

### System monitoring
```bash
# Install monitoring tools
sudo apt install htop ncdu

# Monitor containers
docker stats

# Check disk usage
df -h
ncdu /
```

## Step 9: Security Checklist

- [ ] Strong database passwords set
- [ ] JWT secrets regenerated for production
- [ ] SSL certificates installed and working
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Rate limiting configured in Nginx
- [ ] Environment variables not exposed
- [ ] OAuth redirect URLs updated
- [ ] CORS properly configured
- [ ] Security headers added in Nginx

## Step 10: Launch

1. Run deployment:
```bash
./deploy-production.sh
```

2. Verify services:
```bash
docker-compose -f docker-compose.production.yml ps
```

3. Test endpoints:
- Frontend: https://yourdomain.com
- Backend API: https://yourdomain.com/api/health
- OAuth login: Test Google and Naver login

## Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.production.yml logs [service-name]
```

### Database connection issues
```bash
docker exec -it chat-manage-mysql mysql -u root -p
SHOW DATABASES;
USE chat_manage;
SHOW TABLES;
```

### SSL certificate issues
```bash
# Renew Let's Encrypt certificate
docker-compose -f docker-compose.certbot.yml run --rm certbot renew
docker-compose -f docker-compose.production.yml restart nginx
```

### High memory usage
```bash
# Add memory limits to docker-compose.production.yml
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 512m
```

## Maintenance

### Update application
```bash
git pull origin main
./deploy-production.sh
```

### Renew SSL certificate (Let's Encrypt)
```bash
# Add to crontab for auto-renewal
0 0 * * 0 docker-compose -f docker-compose.certbot.yml run --rm certbot renew && docker-compose -f docker-compose.production.yml restart nginx
```

### Database maintenance
```bash
# Optimize tables
docker exec chat-manage-mysql mysqlcheck -u root -p${MYSQL_ROOT_PASSWORD} --optimize chat_manage
```

## Performance Optimization

1. Enable Nginx caching
2. Use CDN for static assets
3. Enable gzip compression
4. Optimize images
5. Use PM2 for Node.js process management (optional)

## Support Contacts

- Server issues: your-hosting-provider
- Domain/DNS: your-domain-registrar
- SSL issues: certificate-provider
- Application bugs: Create issue on GitHub