# Quick Production Deployment Guide

## Prerequisites Checklist
- [ ] VPS/Cloud server with Ubuntu 20.04+
- [ ] Domain name pointed to server IP
- [ ] SSH access to server
- [ ] At least 2GB RAM

## Step-by-Step Deployment

### 1. Connect to Your Server
```bash
ssh root@your-server-ip
```

### 2. Quick Setup Script
Run this one-liner to set up everything:
```bash
curl -fsSL https://raw.githubusercontent.com/yourusername/chat_manage/main/setup-server.sh | bash
```

Or manually:

### 3. Install Docker & Clone Repository
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
cd ~
git clone https://github.com/yourusername/chat_manage.git
cd chat_manage
```

### 4. Configure Environment
```bash
# Copy and edit production environment
cp .env.production.example .env.production
nano .env.production
```

**Update these values:**
```env
# Your domain
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Database passwords (use strong ones!)
MYSQL_ROOT_PASSWORD=StrongPassword123!
DB_PASSWORD=AnotherStrongPass456!

# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)

# Your API keys (keep existing ones)
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLIENT_ID=...
NAVER_CLIENT_ID=...
```

### 5. Update Nginx Config
```bash
# Replace yourdomain.com in nginx config
sed -i 's/yourdomain.com/YOUR_ACTUAL_DOMAIN/g' nginx-ssl.conf
```

### 6. Get SSL Certificate
```bash
# Create directories
mkdir -p certbot/conf certbot/www

# Get certificate (replace email and domain)
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email your-email@domain.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com \
  -d www.yourdomain.com
```

### 7. Update OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials → Your OAuth Client
3. Add to Authorized JavaScript origins: `https://yourdomain.com`
4. Add to Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`

#### Naver OAuth
1. Go to [Naver Developers](https://developers.naver.com/)
2. Your Application → API 설정
3. 서비스 URL: `https://yourdomain.com`
4. Callback URL: `https://yourdomain.com/api/auth/naver/callback`

### 8. Deploy Application
```bash
# Make script executable
chmod +x deploy-production.sh

# Deploy with backup
./deploy-production.sh --backup
```

### 9. Verify Deployment
Check these URLs:
- Frontend: https://yourdomain.com
- Backend Health: https://yourdomain.com/api/health
- Try logging in with Google/Naver

## Common Issues & Solutions

### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :443

# Kill the process if needed
sudo kill -9 [PID]
```

### SSL Certificate Issues
```bash
# Test certificate
docker-compose -f docker-compose.production.yml exec certbot certbot certificates

# Force renewal
docker-compose -f docker-compose.production.yml run --rm certbot renew --force-renewal
```

### Database Connection Failed
```bash
# Check MySQL is running
docker-compose -f docker-compose.production.yml ps mysql

# Check logs
docker-compose -f docker-compose.production.yml logs mysql
```

### OAuth Not Working
- Check redirect URLs in provider console
- Ensure HTTPS is working
- Check CORS settings in backend

## Maintenance Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
```

### Restart Services
```bash
docker-compose -f docker-compose.production.yml restart
```

### Update Application
```bash
git pull origin main
./deploy-production.sh --skip-build
```

### Backup Database
```bash
docker exec chat-manage-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD chat_manage > backup.sql
```

### SSL Certificate Auto-Renewal
Add to crontab:
```bash
crontab -e
# Add this line:
0 0 * * 0 cd /root/chat_manage && docker-compose -f docker-compose.production.yml run --rm certbot renew && docker-compose -f docker-compose.production.yml restart nginx
```

## Security Checklist
- [ ] Strong passwords set in .env.production
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] SSL certificate installed
- [ ] OAuth redirect URLs updated
- [ ] Regular backups scheduled
- [ ] Monitoring set up

## Support
- Server issues: Check logs first
- OAuth issues: Verify redirect URLs
- SSL issues: Check certificate expiry
- Database issues: Check connection and credentials