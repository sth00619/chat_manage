# Docker Deployment Guide

## Quick Start

### 1. Prerequisites
- Docker Desktop installed
- Docker Compose installed
- At least 4GB of free RAM

### 2. Environment Setup

1. Copy the environment template:
```bash
cp .env.docker .env
```

2. Edit `.env` and update:
   - `MYSQL_ROOT_PASSWORD`: Set a secure password
   - `DB_PASSWORD`: Set a secure database password
   - OAuth credentials (if needed for production)
   - Update URLs for production deployment

### 3. Deploy with Docker

#### On Windows (PowerShell):
```powershell
.\docker-deploy.ps1
```

#### On Linux/Mac:
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

#### Manual deployment:
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MySQL Database**: localhost:3306

## Configuration

### Backend Endpoint Issue Fix

The backend endpoint is configured via environment variables:

1. **For Local Development**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

2. **For Production with Domain**:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   ```

3. **For Docker Network** (containers communicating):
   - Frontend → Backend: Use service name `backend:5000`
   - External → Backend: Use `localhost:5000` or your domain

### Database Configuration

The MySQL database is automatically initialized with:
- Database name: `chat_manage`
- User: Configured in `.env` as `DB_USER`
- Password: Configured in `.env` as `DB_PASSWORD`

## Common Docker Commands

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Restart a service
docker-compose restart backend

# Execute commands in container
docker-compose exec backend sh
docker-compose exec mysql mysql -u root -p

# Rebuild without cache
docker-compose build --no-cache

# Remove everything including volumes
docker-compose down -v
```

## Production Deployment

### Using Docker Compose with Nginx

1. Use the production compose file:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

2. This includes:
   - Nginx reverse proxy on port 80
   - Optimized builds
   - Production environment variables

### SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Place certificates in `./ssl/` directory
3. Uncomment SSL section in `nginx.conf`
4. Update environment URLs to use `https://`

### Environment Variables for Production

```env
# Production URLs
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# OAuth Callbacks (update in provider console)
NAVER_CALLBACK_URL=https://yourdomain.com/api/auth/naver/callback
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

## Troubleshooting

### Backend endpoint not working

1. Check if backend is running:
```bash
docker-compose logs backend
curl http://localhost:5000/api/health
```

2. Verify environment variables:
```bash
docker-compose exec backend env | grep API
docker-compose exec frontend env | grep API
```

3. Check network connectivity:
```bash
docker network ls
docker-compose exec frontend ping backend
```

### Database connection issues

1. Check MySQL is running:
```bash
docker-compose exec mysql mysqladmin ping -h localhost
```

2. Verify credentials:
```bash
docker-compose exec mysql mysql -u${DB_USER} -p${DB_PASSWORD} chat_manage
```

### Frontend can't connect to backend

1. Ensure `NEXT_PUBLIC_API_URL` is set correctly
2. Check CORS settings in backend
3. Verify ports are exposed correctly

### Container keeps restarting

1. Check logs for errors:
```bash
docker-compose logs --tail=50 [service-name]
```

2. Check resource limits:
```bash
docker stats
```

## Backup and Restore

### Backup Database
```bash
docker-compose exec mysql mysqldump -u root -p chat_manage > backup.sql
```

### Restore Database
```bash
docker-compose exec -T mysql mysql -u root -p chat_manage < backup.sql
```

### Backup Uploads
```bash
tar -czf uploads-backup.tar.gz ./backend/uploads/
```

## Security Recommendations

1. **Change default passwords** in production
2. **Use SSL/HTTPS** for production
3. **Limit exposed ports** using firewall
4. **Regular updates** of Docker images
5. **Use secrets management** for sensitive data
6. **Enable rate limiting** in production
7. **Regular backups** of database and uploads

## Support

For issues or questions:
1. Check container logs
2. Verify environment variables
3. Test network connectivity
4. Review this guide's troubleshooting section