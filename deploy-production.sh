#!/bin/bash

# Production Deployment Script
# Usage: ./deploy-production.sh [options]
# Options:
#   --skip-build    Skip Docker image rebuild
#   --backup        Create backup before deployment
#   --rollback      Rollback to previous version

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="yourdomain.com"
BACKUP_DIR="/home/$(whoami)/backups"
LOG_DIR="/home/$(whoami)/logs"
COMPOSE_FILE="docker-compose.production.yml"

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

# Check if production environment file exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    echo "Please create it from .env.production.example"
    exit 1
fi

# Parse command line arguments
SKIP_BUILD=false
CREATE_BACKUP=false
ROLLBACK=false

for arg in "$@"; do
    case $arg in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        *)
            ;;
    esac
done

print_status "🚀 Starting Production Deployment"
echo "================================="
echo "Domain: $DOMAIN"
echo "Skip Build: $SKIP_BUILD"
echo "Create Backup: $CREATE_BACKUP"
echo "================================="

# Load production environment
set -a
source .env.production
set +a

# Rollback function
rollback() {
    print_warning "Rolling back to previous version..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE up -d
    print_status "Rollback completed"
    exit 0
}

# Backup function
create_backup() {
    print_status "Creating backup..."
    
    mkdir -p $BACKUP_DIR
    DATE=$(date +%Y%m%d_%H%M%S)
    
    # Backup database
    print_status "Backing up database..."
    docker exec chat-manage-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} chat_manage > $BACKUP_DIR/db_backup_$DATE.sql
    
    # Backup uploads
    print_status "Backing up uploads..."
    tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ./backend/uploads/
    
    # Backup environment file
    cp .env.production $BACKUP_DIR/env_backup_$DATE
    
    print_status "Backup completed: $BACKUP_DIR/*_$DATE.*"
}

# Health check function
health_check() {
    print_status "Running health checks..."
    
    # Wait for services to be ready
    sleep 10
    
    # Check backend
    if curl -f -s https://$DOMAIN/api/health > /dev/null; then
        print_status "✅ Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -f -s https://$DOMAIN > /dev/null; then
        print_status "✅ Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    # Check database
    if docker exec chat-manage-mysql mysqladmin ping -h localhost &>/dev/null; then
        print_status "✅ Database is healthy"
    else
        print_error "Database health check failed"
        return 1
    fi
    
    return 0
}

# Main deployment process
main() {
    # Handle rollback
    if [ "$ROLLBACK" = true ]; then
        rollback
    fi
    
    # Create backup if requested
    if [ "$CREATE_BACKUP" = true ]; then
        create_backup
    fi
    
    # Pull latest code
    print_status "📦 Pulling latest code from git..."
    git pull origin main
    
    # Stop existing containers
    print_status "🛑 Stopping existing containers..."
    docker-compose -f $COMPOSE_FILE down
    
    # Build images if not skipped
    if [ "$SKIP_BUILD" = false ]; then
        print_status "🔨 Building Docker images..."
        docker-compose -f $COMPOSE_FILE build --no-cache
    else
        print_warning "Skipping Docker build"
    fi
    
    # Start services
    print_status "🚀 Starting services..."
    docker-compose -f $COMPOSE_FILE up -d
    
    # Run health checks
    if health_check; then
        print_status "✅ Deployment successful!"
        
        # Show service status
        echo ""
        echo "Service Status:"
        docker-compose -f $COMPOSE_FILE ps
        
        echo ""
        print_status "🎉 Application is running at:"
        echo "  Frontend: https://$DOMAIN"
        echo "  Backend API: https://$DOMAIN/api"
        echo ""
        echo "Commands:"
        echo "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
        echo "  Stop: docker-compose -f $COMPOSE_FILE down"
        echo "  Restart: docker-compose -f $COMPOSE_FILE restart"
        
        # Clean up old backups (keep last 7 days)
        if [ -d "$BACKUP_DIR" ]; then
            find $BACKUP_DIR -type f -mtime +7 -delete
            print_status "Cleaned up old backups"
        fi
    else
        print_error "Health checks failed! Rolling back..."
        rollback
    fi
}

# Create log directory
mkdir -p $LOG_DIR

# Run main deployment and log output
main 2>&1 | tee $LOG_DIR/deploy_$(date +%Y%m%d_%H%M%S).log