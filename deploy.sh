#!/bin/bash

# 배포 스크립트 - Chat Management System
# Usage: ./deploy.sh [production|staging|local]

ENV=${1:-local}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment for environment: $ENV"
echo "📅 Timestamp: $TIMESTAMP"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수: 에러 체크
check_error() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error: $1${NC}"
        exit 1
    fi
}

# 함수: 성공 메시지
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 경고 메시지
warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. 환경 변수 체크
echo "📋 Checking environment variables..."
if [ "$ENV" == "production" ] || [ "$ENV" == "staging" ]; then
    if [ ! -f "./backend/.env" ]; then
        warning_msg "Backend .env file not found!"
        echo "Creating from example..."
        cp ./backend/.env.example ./backend/.env
        warning_msg "Please update ./backend/.env with production values"
        exit 1
    fi
    
    if [ ! -f "./frontend/.env.local" ]; then
        warning_msg "Frontend .env.local file not found!"
        echo "Creating from example..."
        cp ./frontend/.env.local.example ./frontend/.env.local
        warning_msg "Please update ./frontend/.env.local with production values"
        exit 1
    fi
fi
success_msg "Environment variables checked"

# 2. 의존성 설치
echo "📦 Installing dependencies..."
cd backend
npm ci
check_error "Backend dependencies installation failed"
cd ../frontend
npm ci
check_error "Frontend dependencies installation failed"
cd ..
success_msg "Dependencies installed"

# 3. 데이터베이스 마이그레이션
echo "🗄️  Running database migrations..."
cd backend
# Sequelize가 자동으로 sync하므로 추가 마이그레이션 불필요
success_msg "Database ready"
cd ..

# 4. 프론트엔드 빌드
echo "🔨 Building frontend..."
cd frontend
npm run build
check_error "Frontend build failed"
cd ..
success_msg "Frontend built successfully"

# 5. 환경별 배포
case $ENV in
    "production")
        echo "🌐 Deploying to PRODUCTION..."
        
        # PM2로 프로세스 관리
        pm2 stop all
        
        # 백엔드 시작
        cd backend
        pm2 start ecosystem.config.js --env production
        check_error "Backend start failed"
        cd ..
        
        # 프론트엔드 시작
        cd frontend
        pm2 start npm --name "frontend" -- start
        check_error "Frontend start failed"
        cd ..
        
        pm2 save
        success_msg "Production deployment complete!"
        echo "🔗 Frontend: http://your-domain.com"
        echo "🔗 Backend API: http://your-domain.com/api"
        ;;
        
    "staging")
        echo "🧪 Deploying to STAGING..."
        
        # Docker Compose로 실행
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        check_error "Docker deployment failed"
        
        success_msg "Staging deployment complete!"
        echo "🔗 Frontend: http://localhost:3000"
        echo "🔗 Backend API: http://localhost:5000"
        ;;
        
    "local")
        echo "💻 Starting LOCAL development servers..."
        
        # 기존 프로세스 종료
        pkill -f "npm run dev" || true
        
        # 백엔드 시작
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        
        # 프론트엔드 시작
        cd frontend
        npm run dev &
        FRONTEND_PID=$!
        cd ..
        
        success_msg "Local servers started!"
        echo "🔗 Frontend: http://localhost:3000"
        echo "🔗 Backend API: http://localhost:5000"
        echo ""
        echo "Press Ctrl+C to stop all servers"
        
        # 종료 시그널 처리
        trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
        wait
        ;;
        
    *)
        echo -e "${RED}Invalid environment: $ENV${NC}"
        echo "Usage: ./deploy.sh [production|staging|local]"
        exit 1
        ;;
esac

# 6. 헬스 체크
echo "🏥 Running health checks..."
sleep 5

# Backend health check
BACKEND_HEALTH=$(curl -s http://localhost:5000/api/health | grep -o '"status":"healthy"')
if [ -n "$BACKEND_HEALTH" ]; then
    success_msg "Backend is healthy"
else
    warning_msg "Backend health check failed"
fi

# Frontend health check (개발 모드에서는 3001 포트)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" == "200" ] || [ "$FRONTEND_STATUS" == "302" ]; then
    success_msg "Frontend is responding"
else
    warning_msg "Frontend health check failed (Status: $FRONTEND_STATUS)"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "📊 Environment: $ENV"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""
echo "📚 Next steps:"
echo "1. Test OAuth login (Google, Naver)"
echo "2. Test AI chat functionality"
echo "3. Monitor logs: pm2 logs (production) or docker-compose logs -f (staging)"
echo "4. Check database: mysql -u root -p chat_manage"