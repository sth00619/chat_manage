# 💬 Chat Management System

AI 기반 개인 비서 서비스 - 자연어로 일정, 연락처, 목표를 관리하세요!

## ✨ 주요 기능

- 🤖 **AI 채팅**: ChatGPT를 활용한 지능형 대화
- 📅 **일정 관리**: 자연어로 일정 추가 및 관리
- 👥 **연락처 저장**: 대화 중 자동으로 연락처 추출
- 🎯 **목표 관리**: 개인 목표 설정 및 추적
- 🔐 **OAuth 로그인**: Google, Naver 소셜 로그인
- 💳 **구독 시스템**: Free, Basic, Premium 플랜
- 🌙 **다크 모드**: 눈의 피로를 줄이는 다크 테마
- 📱 **반응형 디자인**: 모바일 최적화

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18.0 이상
- MySQL 8.0 이상
- npm 또는 yarn

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/chat_manage.git
cd chat_manage
```

2. **환경 변수 설정**

Backend (.env):
```bash
cd backend
cp .env.example .env
# .env 파일을 열어 필요한 값들을 입력
```

Frontend (.env.local):
```bash
cd ../frontend
cp .env.local.example .env.local
# .env.local 파일을 열어 API URL 설정
```

3. **의존성 설치**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **데이터베이스 설정**
```sql
CREATE DATABASE chat_manage;
```

5. **서버 실행**
```bash
# Backend (터미널 1)
cd backend
npm run dev

# Frontend (터미널 2)
cd frontend
npm run dev
```

6. **접속**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 환경 변수 설정

### Backend 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| DB_HOST | MySQL 호스트 | localhost |
| DB_USER | DB 사용자명 | root |
| DB_PASSWORD | DB 비밀번호 | password |
| DB_NAME | DB 이름 | chat_manage |
| JWT_SECRET | JWT 시크릿 키 | your-secret-key |
| OPENAI_API_KEY | OpenAI API 키 | sk-... |
| GOOGLE_CLIENT_ID | Google OAuth ID | your-google-id |
| GOOGLE_CLIENT_SECRET | Google OAuth Secret | your-google-secret |
| NAVER_CLIENT_ID | Naver OAuth ID | your-naver-id |
| NAVER_CLIENT_SECRET | Naver OAuth Secret | your-naver-secret |

### Frontend 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:5000/api |

## 📦 배포

### Option 1: Docker 사용

```bash
# Docker Compose로 전체 스택 실행
docker-compose up -d
```

### Option 2: PM2 사용 (프로덕션)

```bash
# 배포 스크립트 실행
chmod +x deploy.sh
./deploy.sh production
```

### Option 3: 클라우드 플랫폼

- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: PlanetScale, Supabase

자세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 참조

## 🏗️ 프로젝트 구조

```
chat_manage/
├── backend/              # Node.js + Express 백엔드
│   ├── src/
│   │   ├── controllers/  # 비즈니스 로직
│   │   ├── models/       # Sequelize 모델
│   │   ├── routes/       # API 라우트
│   │   ├── services/     # 외부 서비스 (OpenAI 등)
│   │   └── app.js        # Express 앱 진입점
│   └── package.json
│
├── frontend/             # Next.js 프론트엔드
│   ├── src/
│   │   ├── components/   # React 컴포넌트
│   │   ├── pages/        # Next.js 페이지
│   │   ├── services/     # API 서비스
│   │   └── store/        # 상태 관리
│   └── package.json
│
├── docker-compose.yml    # Docker 설정
└── deploy.sh            # 배포 스크립트
```

## 🧪 테스트

```bash
# API 테스트 실행
node test-api.js
```

## 📱 스크린샷

### 대시보드
- 현대적인 UI/UX
- 실시간 통계
- 빠른 액션 버튼

### AI 채팅
- 자연어 처리
- 자동 데이터 추출
- 실시간 응답

### 일정 관리
- 캘린더 뷰
- 드래그 앤 드롭
- 알림 설정

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👥 개발팀

- Backend: Node.js, Express, Sequelize
- Frontend: Next.js, React, TailwindCSS
- AI: OpenAI GPT-4
- Database: MySQL

## 📞 지원

문제가 있으신가요? 
- 이슈 생성: [GitHub Issues](https://github.com/yourusername/chat_manage/issues)
- 이메일: support@example.com

## 🙏 감사의 말

- OpenAI for GPT API
- Vercel for Next.js
- All contributors

---

Made with ❤️ by Your Team