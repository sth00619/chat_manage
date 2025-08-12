# PowerShell script for Windows Docker deployment

Write-Host "🚀 Starting Docker Deployment for Chat Management System" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.docker template..." -ForegroundColor Yellow
    Copy-Item ".env.docker" ".env"
    Write-Host "✅ .env file created. Please edit it with your actual values before continuing." -ForegroundColor Green
    Write-Host "Press Enter to continue after editing .env file..." -ForegroundColor Yellow
    Read-Host
}

# Check Docker installation
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop for Windows first." -ForegroundColor Red
    exit 1
}

# Check Docker Compose installation
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host ""
Write-Host "🛑 Stopping any existing containers..." -ForegroundColor Yellow
docker-compose down

# Build and start containers
Write-Host ""
Write-Host "🔨 Building Docker images..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host ""
Write-Host "🚀 Starting containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host ""
Write-Host "🏥 Checking service health..." -ForegroundColor Yellow

# Check MySQL
try {
    docker-compose exec -T mysql mysqladmin ping -h localhost 2>$null
    Write-Host "✅ MySQL is running" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL is not responding" -ForegroundColor Red
}

# Check Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running at http://localhost:5000" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend health check failed (this might be normal if /api/health endpoint doesn't exist)" -ForegroundColor Yellow
}

# Check Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running at http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend is not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your application at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop: docker-compose down" -ForegroundColor Yellow
Write-Host "To restart: docker-compose restart" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green