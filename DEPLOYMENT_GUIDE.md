# 📚 배포 가이드 (Deployment Guide)

## 🚀 배포 옵션

### Option 1: Vercel (프론트엔드) + Railway/Render (백엔드)

#### 1️⃣ 백엔드 배포 - Railway

1. **Railway 가입 및 프로젝트 생성**
   ```bash
   # Railway CLI 설치
   npm install -g @railway/cli
   
   # 로그인
   railway login
   
   # 프로젝트 초기화
   cd backend
   railway init
   ```

2. **환경 변수 설정**
   Railway 대시보드에서 환경 변수 추가:
   ```
   DB_HOST=your-mysql-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=chat_manage
   JWT_SECRET=your-jwt-secret
   OPENAI_API_KEY=your-openai-key
   GOOGLE_CLIENT_ID=your-google-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   NAVER_CLIENT_ID=your-naver-id
   NAVER_CLIENT_SECRET=your-naver-secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

3. **배포**
   ```bash
   railway up
   ```

#### 2️⃣ 프론트엔드 배포 - Vercel

1. **Vercel 설치 및 배포**
   ```bash
   # Vercel CLI 설치
   npm install -g vercel
   
   # 프론트엔드 디렉토리로 이동
   cd frontend
   
   # 배포
   vercel
   ```

2. **환경 변수 설정**
   Vercel 대시보드에서:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```

---

### Option 2: AWS EC2 (전체 스택)

#### 1️⃣ EC2 인스턴스 설정

1. **EC2 인스턴스 생성**
   - Ubuntu 22.04 LTS
   - t3.medium (최소 사양)
   - 포트 열기: 22, 80, 443, 3000, 5000

2. **서버 접속 및 기본 설정**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # 시스템 업데이트
   sudo apt update && sudo apt upgrade -y
   
   # Node.js 18 설치
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # MySQL 설치
   sudo apt install mysql-server -y
   sudo mysql_secure_installation
   
   # Nginx 설치
   sudo apt install nginx -y
   
   # PM2 설치 (프로세스 매니저)
   sudo npm install -g pm2
   ```

3. **MySQL 데이터베이스 설정**
   ```sql
   sudo mysql
   CREATE DATABASE chat_manage;
   CREATE USER 'chatuser'@'localhost' IDENTIFIED BY 'your-password';
   GRANT ALL PRIVILEGES ON chat_manage.* TO 'chatuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **프로젝트 배포**
   ```bash
   # 코드 복사
   git clone https://github.com/yourusername/chat_manage.git
   cd chat_manage
   
   # 백엔드 설정
   cd backend
   npm install
   
   # .env 파일 생성
   nano .env
   # 환경 변수 입력 후 저장
   
   # PM2로 백엔드 실행
   pm2 start src/app.js --name backend
   pm2 save
   pm2 startup
   
   # 프론트엔드 설정
   cd ../frontend
   npm install
   npm run build
   
   # PM2로 프론트엔드 실행
   pm2 start npm --name frontend -- start
   pm2 save
   ```

5. **Nginx 설정**
   ```bash
   sudo nano /etc/nginx/sites-available/chat-manage
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       # 프론트엔드
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   
       # 백엔드 API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/chat-manage /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL 인증서 설정 (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your-domain.com
   ```

---

### Option 3: Docker 배포

#### 1️⃣ Docker 파일 생성

**backend/Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/app.js"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: chat_manage
      MYSQL_USER: chatuser
      MYSQL_PASSWORD: chatpassword
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      - DB_HOST=mysql
      - DB_USER=chatuser
      - DB_PASSWORD=chatpassword
      - DB_NAME=chat_manage
    env_file:
      - ./backend/.env
    ports:
      - "5000:5000"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mysql_data:
```

#### 2️⃣ Docker 배포

```bash
# Docker 및 Docker Compose 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y

# 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

---

## 🔐 프로덕션 체크리스트

### 보안 설정
- [ ] 모든 환경 변수를 .env 파일로 분리
- [ ] JWT_SECRET 강력한 값으로 변경
- [ ] CORS 설정에서 프로덕션 도메인만 허용
- [ ] Rate limiting 설정
- [ ] SQL Injection 방지 (Sequelize ORM 사용 중)
- [ ] XSS 방지 (React 기본 제공)
- [ ] HTTPS 필수 적용

### 데이터베이스
- [ ] 데이터베이스 백업 자동화
- [ ] 데이터베이스 인덱스 최적화
- [ ] Connection pooling 설정

### 모니터링
- [ ] PM2 모니터링 설정
- [ ] 로그 수집 (Winston, Morgan)
- [ ] 에러 트래킹 (Sentry)
- [ ] 성능 모니터링 (New Relic, DataDog)

### OAuth 설정 업데이트
- [ ] Google OAuth Redirect URI 프로덕션 URL로 변경
- [ ] Naver OAuth Redirect URI 프로덕션 URL로 변경

---

## 📝 배포 후 테스트

1. **API 헬스 체크**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **OAuth 로그인 테스트**
   - Google 로그인
   - Naver 로그인

3. **AI 채팅 기능 테스트**
   - 일반 대화
   - 데이터 추출

4. **결제 시스템 테스트**
   - 플랜 변경
   - 구독 상태 확인

---

## 🆘 문제 해결

### 1. 포트 충돌
```bash
# 사용 중인 포트 확인
sudo lsof -i :5000
sudo lsof -i :3000

# 프로세스 종료
sudo kill -9 <PID>
```

### 2. PM2 프로세스 관리
```bash
# 상태 확인
pm2 status

# 재시작
pm2 restart all

# 로그 확인
pm2 logs
```

### 3. Nginx 문제
```bash
# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl restart nginx

# 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### 4. 데이터베이스 연결 문제
```bash
# MySQL 상태 확인
sudo systemctl status mysql

# 연결 테스트
mysql -u chatuser -p -h localhost chat_manage
```

---

## 💰 예상 비용

### Vercel + Railway
- Vercel: 무료 (개인 프로젝트)
- Railway: $5-20/월
- **총 비용: $5-20/월**

### AWS EC2
- t3.micro (프리티어): 무료 (12개월)
- t3.medium: $30-40/월
- RDS MySQL: $15-30/월
- **총 비용: $0-70/월**

### DigitalOcean
- Droplet (2GB RAM): $12/월
- Managed Database: $15/월
- **총 비용: $27/월**

---

## 📞 지원 및 도움말

배포 중 문제가 발생하면:
1. 에러 로그 확인
2. 환경 변수 재확인
3. 네트워크 및 포트 설정 확인
4. 데이터베이스 연결 확인

각 클라우드 제공업체의 문서:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [AWS EC2 Docs](https://docs.aws.amazon.com/ec2)
- [DigitalOcean Docs](https://docs.digitalocean.com)