# OAuth 설정 가이드

## 🔵 Naver OAuth 설정

### Step 1: Naver Developers 가입
1. https://developers.naver.com 접속
2. 네이버 계정으로 로그인

### Step 2: 애플리케이션 등록
1. 상단 메뉴 "Application" 클릭
2. "애플리케이션 등록" 버튼 클릭
3. 다음 정보 입력:

```
애플리케이션 이름: Chat Manage
사용 API: 네이버 로그인 (체크)
제공 정보 선택:
  - [필수] 회원이름
  - [필수] 이메일주소
  - [선택] 프로필사진

환경 추가 (PC웹):
  - 서비스 URL: http://localhost:3000
  - Callback URL: http://localhost:5000/api/auth/naver/callback
```

### Step 3: 키 확인 및 복사
등록 완료 후 제공되는:
- Client ID
- Client Secret

이 값들을 복사하여 `.env` 파일에 업데이트

---

## 🔴 Google OAuth 설정

### Step 1: Google Cloud Console 프로젝트 생성
1. https://console.cloud.google.com 접속
2. 구글 계정으로 로그인
3. "Select a project" → "New Project" 클릭
4. 프로젝트 이름: "Chat Manage" 입력 후 생성

### Step 2: OAuth 동의 화면 구성
1. 좌측 메뉴 → "APIs & Services" → "OAuth consent screen"
2. User Type: "External" 선택
3. 앱 정보 입력:
```
App name: Chat Manage
User support email: [본인 이메일]
App logo: (선택사항)
Application home page: http://localhost:3000
Application privacy policy link: (선택사항)
Application terms of service link: (선택사항)
Developer contact information: [본인 이메일]
```
4. Scopes 단계:
   - "Add or Remove Scopes" 클릭
   - `.../auth/userinfo.email` 선택
   - `.../auth/userinfo.profile` 선택
5. Test users:
   - 테스트할 구글 계정 이메일 추가

### Step 3: OAuth 2.0 Client ID 생성
1. 좌측 메뉴 → "APIs & Services" → "Credentials"
2. "+ CREATE CREDENTIALS" → "OAuth client ID" 클릭
3. 설정:
```
Application type: Web application
Name: Chat Manage Web Client

Authorized JavaScript origins:
- http://localhost:3000
- http://localhost:5000

Authorized redirect URIs:
- http://localhost:5000/api/auth/google/callback
```

### Step 4: 키 다운로드
생성 완료 후:
- Client ID 복사
- Client Secret 복사

---

## 📝 .env 파일 업데이트

backend/.env 파일에 다음 값들을 업데이트:

```env
# Naver OAuth
NAVER_CLIENT_ID=네이버에서_발급받은_Client_ID
NAVER_CLIENT_SECRET=네이버에서_발급받은_Client_Secret

# Google OAuth
GOOGLE_CLIENT_ID=구글에서_발급받은_Client_ID
GOOGLE_CLIENT_SECRET=구글에서_발급받은_Client_Secret
```

---

## ⚠️ 중요 사항

### 개발 환경 (localhost)
- Naver는 localhost를 지원하므로 바로 테스트 가능
- Google은 localhost를 지원하지만 https가 아니면 경고 표시될 수 있음

### 프로덕션 배포 시
1. 실제 도메인으로 URL 변경 필요
2. HTTPS 필수
3. 각 플랫폼에서 프로덕션 URL 추가:
   - Naver: 서비스 URL, Callback URL 추가
   - Google: Authorized origins, Redirect URIs 추가

### 보안 주의사항
- Client Secret은 절대 GitHub에 커밋하지 마세요
- .env 파일은 .gitignore에 포함되어야 합니다
- 프로덕션 환경에서는 환경 변수로 관리하세요

---

## 🧪 테스트 방법

1. 백엔드 서버 실행: `cd backend && npm run dev`
2. 프론트엔드 서버 실행: `cd frontend && npm run dev`
3. http://localhost:3000/login 접속
4. Naver 또는 Google 로그인 버튼 클릭
5. 각 플랫폼에서 로그인 승인
6. 자동으로 대시보드로 리다이렉트

---

## 🐛 문제 해결

### "Invalid redirect URI" 오류
- OAuth 설정에서 Callback URL이 정확히 일치하는지 확인
- http vs https, 포트 번호, 경로 모두 확인

### "Invalid client" 오류
- Client ID와 Secret이 올바르게 입력되었는지 확인
- .env 파일 저장 후 서버 재시작 필요

### CORS 오류
- backend의 CORS 설정 확인
- frontend URL이 허용 목록에 있는지 확인