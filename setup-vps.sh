#!/bin/bash

# VPS Setup Script for Chat Management System
# This script automates the entire server setup process
# Usage: curl -fsSL https://raw.githubusercontent.com/sth00619/chat_manage/main/setup-vps.sh | bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
GITHUB_REPO="https://github.com/sth00619/chat_manage.git"
APP_DIR="/opt/chat_manage"
SWAP_SIZE="2G"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Welcome message
clear
echo "============================================"
echo "   Chat Management System - VPS Setup"
echo "============================================"
echo ""

# Get user input
read -p "Enter your domain name (e.g., example.com): " DOMAIN
read -p "Enter your email for SSL certificates: " EMAIL
read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASSWORD
echo
read -p "Enter MySQL user password: " -s MYSQL_USER_PASSWORD
echo

print_status "Starting server setup for $DOMAIN"

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    htop \
    ncdu \
    net-tools \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    cron

# Set up swap if not exists
if [ ! -f /swapfile ]; then
    print_status "Creating swap file..."
    fallocate -l $SWAP_SIZE /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    
    # Optimize swap settings
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
    sysctl -p
fi

# Install Docker
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    print_info "Docker already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    print_info "Docker Compose already installed"
fi

# Configure firewall
print_status "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 3000/tcp # Frontend (temporary for testing)
ufw allow 5001/tcp # Backend (temporary for testing)
echo "y" | ufw enable

# Configure fail2ban for security
print_status "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl restart fail2ban

# Clone repository
print_status "Cloning repository..."
if [ -d "$APP_DIR" ]; then
    print_warning "App directory exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    git clone $GITHUB_REPO $APP_DIR
    cd $APP_DIR
fi

# Create production environment file
print_status "Creating production environment configuration..."
cat > $APP_DIR/.env.production << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
DB_USER=chatuser
DB_PASSWORD=${MYSQL_USER_PASSWORD}
DB_NAME=chat_manage

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Application URLs
FRONTEND_URL=https://${DOMAIN}
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_FRONTEND_URL=https://${DOMAIN}

# OAuth Callback URLs
GOOGLE_CALLBACK_URL=https://${DOMAIN}/api/auth/google/callback
NAVER_CALLBACK_URL=https://${DOMAIN}/api/auth/naver/callback

# Server Configuration
NODE_ENV=production
PORT=5000

# Redis Configuration
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
EOF

print_warning "Please edit $APP_DIR/.env.production to add your API keys:"
print_warning "- OPENAI_API_KEY"
print_warning "- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
print_warning "- NAVER_CLIENT_ID and NAVER_CLIENT_SECRET"

# Update nginx configuration with actual domain
print_status "Updating nginx configuration..."
sed -i "s/yourdomain.com/${DOMAIN}/g" $APP_DIR/nginx-ssl.conf

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p $APP_DIR/certbot/conf
mkdir -p $APP_DIR/certbot/www
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/backup
mkdir -p $APP_DIR/backend/uploads

# Get SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
docker run -it --rm \
    -v $APP_DIR/certbot/conf:/etc/letsencrypt \
    -v $APP_DIR/certbot/www:/var/www/certbot \
    -p 80:80 \
    certbot/certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d www.$DOMAIN

# Set up SSL auto-renewal
print_status "Setting up SSL auto-renewal..."
cat > /etc/cron.d/certbot << EOF
0 0 * * 0 cd $APP_DIR && docker-compose -f docker-compose.production.yml run --rm certbot renew && docker-compose -f docker-compose.production.yml restart nginx
EOF

# Create backup script
print_status "Creating backup script..."
cat > $APP_DIR/backup-cron.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/chat_manage/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec chat-manage-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} chat_manage > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /opt/chat_manage/backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x $APP_DIR/backup-cron.sh

# Set up daily backups
echo "0 2 * * * root $APP_DIR/backup-cron.sh" > /etc/cron.d/chat-manage-backup

# Create monitoring script
print_status "Setting up monitoring..."
cat > $APP_DIR/monitor.sh << 'EOF'
#!/bin/bash

check_service() {
    if docker ps | grep -q $1; then
        echo "✅ $1 is running"
    else
        echo "❌ $1 is down"
        # Restart the service
        cd /opt/chat_manage
        docker-compose -f docker-compose.production.yml restart $2
    fi
}

check_service "chat-manage-mysql" "mysql"
check_service "chat-manage-backend" "backend"
check_service "chat-manage-frontend" "frontend"
check_service "chat-manage-nginx" "nginx"

# Check disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ Disk usage is high: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEMORY_USAGE -gt 80 ]; then
    echo "⚠️ Memory usage is high: ${MEMORY_USAGE}%"
fi
EOF

chmod +x $APP_DIR/monitor.sh

# Add monitoring to cron
echo "*/5 * * * * root $APP_DIR/monitor.sh >> $APP_DIR/logs/monitor.log 2>&1" > /etc/cron.d/chat-manage-monitor

# Start Docker containers
print_status "Starting Docker containers..."
cd $APP_DIR
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 20

# Health check
print_status "Running health checks..."
if curl -f -s https://$DOMAIN/api/health > /dev/null; then
    print_status "✅ Backend is healthy"
else
    print_warning "Backend health check failed - this might be normal during initial setup"
fi

if curl -f -s https://$DOMAIN > /dev/null; then
    print_status "✅ Frontend is healthy"
else
    print_warning "Frontend health check failed - this might be normal during initial setup"
fi

# Create management script
print_status "Creating management script..."
cat > /usr/local/bin/chat-manage << 'EOF'
#!/bin/bash

APP_DIR="/opt/chat_manage"

case "$1" in
    start)
        cd $APP_DIR
        docker-compose -f docker-compose.production.yml up -d
        ;;
    stop)
        cd $APP_DIR
        docker-compose -f docker-compose.production.yml down
        ;;
    restart)
        cd $APP_DIR
        docker-compose -f docker-compose.production.yml restart
        ;;
    logs)
        cd $APP_DIR
        docker-compose -f docker-compose.production.yml logs -f ${2}
        ;;
    status)
        cd $APP_DIR
        docker-compose -f docker-compose.production.yml ps
        ;;
    backup)
        $APP_DIR/backup-cron.sh
        echo "Backup completed"
        ;;
    update)
        cd $APP_DIR
        git pull origin main
        docker-compose -f docker-compose.production.yml build --no-cache
        docker-compose -f docker-compose.production.yml up -d
        ;;
    *)
        echo "Usage: chat-manage {start|stop|restart|logs|status|backup|update}"
        exit 1
        ;;
esac
EOF

chmod +x /usr/local/bin/chat-manage

# Final cleanup
print_status "Cleaning up..."
docker system prune -f

# Success message
echo ""
echo "============================================"
echo "   🎉 Setup Complete!"
echo "============================================"
echo ""
print_status "Your application is now running at:"
echo "  Frontend: https://$DOMAIN"
echo "  Backend API: https://$DOMAIN/api"
echo ""
print_status "Important files:"
echo "  Environment: $APP_DIR/.env.production"
echo "  Logs: $APP_DIR/logs/"
echo "  Backups: $APP_DIR/backup/"
echo ""
print_status "Management commands:"
echo "  chat-manage start    - Start services"
echo "  chat-manage stop     - Stop services"
echo "  chat-manage restart  - Restart services"
echo "  chat-manage logs     - View logs"
echo "  chat-manage status   - Check status"
echo "  chat-manage backup   - Create backup"
echo "  chat-manage update   - Update application"
echo ""
print_warning "⚠️ Don't forget to:"
echo "1. Edit $APP_DIR/.env.production to add your API keys"
echo "2. Update OAuth redirect URLs in Google and Naver consoles"
echo "3. Close temporary firewall ports: ufw delete allow 3000 && ufw delete allow 5001"
echo ""
echo "============================================"