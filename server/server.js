const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 (프론트엔드 통신 허용)
app.use(cors());
app.use(express.json());

// 해양조사원(KHOA) 조석 데이터 라우터 연동
const oceanRouter = require('./routes/ocean');
app.use('/api/ocean', oceanRouter);

// 기본 루트 확인용 라우트
app.get('/', (req, res) => {
  res.send('SurfingCaster 백엔드 서버 작동 중');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`SurfingCaster 백엔드 서버 실행 중 (Port: ${PORT})`);
});