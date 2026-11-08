const path = require('path');
// .env 는 프로젝트 루트에 있으므로 경로를 직접 지정 (server 폴더에서 실행해도 읽히도록)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 (프론트엔드 통신 허용)
app.use(cors());
app.use(express.json());

// 해양조사원(KHOA) 조석 데이터 라우터 연동
const oceanRouter = require('./routes/ocean');
app.use('/api/ocean', oceanRouter);

// 회원가입 / 로그인
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// 즐겨찾기
const favoritesRouter = require('./routes/favorites');
app.use('/api/favorites', favoritesRouter);

// 관측소 목록 (DB)
const stationRouter = require('./routes/station');
app.use('/api/stations', stationRouter);

// 기본 루트 확인용 라우트
app.get('/', (req, res) => {
  res.send('SurfingCaster 백엔드 서버 작동 중');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`SurfingCaster 백엔드 서버 실행 중 (Port: ${PORT})`);
});
