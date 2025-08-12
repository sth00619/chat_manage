const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const sequelize = require('./config/database');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// uploads 폴더를 backend 루트에 설정
const uploadsPath = path.join(__dirname, '../uploads');
console.log('Uploads directory:', uploadsPath);

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Created uploads directory');
}

// CORS 설정 (다운로드를 위한 헤더 추가)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));

// 정적 파일 서빙 설정
app.use('/uploads', (req, res, next) => {
  console.log('=== Static File Request ===');
  console.log('Requested URL:', req.url);
  
  const filePath = path.join(uploadsPath, req.url);
  console.log('Looking for file at:', filePath);
  console.log('File exists:', fs.existsSync(filePath));
  
  // 다운로드를 위한 헤더 설정
  if (req.query.download === 'true') {
    const filename = path.basename(req.url.split('?')[0]);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
  }
  
  next();
});

app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  etag: false,
  index: false
}));

// 기타 미들웨어들
app.use(express.json());
app.use(passport.initialize());

// Rate limiting을 더 관대하게 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000, // 100 -> 1000으로 증가
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 개발 환경에서는 rate limiting 비활성화
if (process.env.NODE_ENV === 'development') {
  // Rate limiting 제거 또는 매우 관대하게 설정
  console.log('Development mode: Rate limiting disabled');
} else {
  app.use('/api/', limiter);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/data', require('./routes/data'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payment', require('./routes/payment'));

// 404 핸들러
app.use('/uploads', (req, res) => {
  console.log('404 for uploads:', req.url);
  res.status(404).json({ error: 'File not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database sync and server start
const PORT = process.env.PORT || 5000;

// sync 옵션 변경: alter: true 제거
sequelize.sync().then(() => {
  console.log('Database connected successfully');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Uploads served at: http://localhost:${PORT}/uploads/`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
  // 데이터베이스 연결 실패해도 서버는 시작하도록 함
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (without database)`);
    console.log(`Uploads served at: http://localhost:${PORT}/uploads/`);
  });
});