// 국립해양조사원 조석예보(고조/저조) API 프록시
// 공공데이터포털: 해양수산부 국립해양조사원_조석예보(고, 저조) (15156018)
//
//  GET /api/ocean/tide/:obsCode   (obsCode 예: DT_0012 속초, DT_0005 부산)
//  -> { stationName, events: [{ time: "2026-11-08 14:40", level: 667, type: "고조" }, ...] }
//
// 오늘 + 내일 예보를 같이 가져와서, 밤늦게 조회해도 "다음 만조/간조"를 보여줄 수 있게 함
const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// IPv4 로 고정 (일부 네트워크에서 IPv6 연결 시도가 멈춰서 타임아웃 나는 문제 방지)
const httpsAgent = new https.Agent({ family: 4, keepAlive: true });
const TIMEOUT_MS = 10000;

// 한 번 받은 예보는 저장 -> API 서버가 느리거나 장애일 때 저장된 값으로 응답
// (조석 예보는 하루 동안 바뀌지 않으므로 날짜별로 저장해도 정확함)
// ※ 프로젝트 폴더 밖(OS 임시 폴더)에 저장: 폴더 안에 저장하면 Live Server 가 파일 변경을 감지해서
//    페이지를 계속 새로고침하는 문제가 생김
const CACHE_FILE = path.join(os.tmpdir(), 'surfingcaster-tide-cache.json');
let tideCache = {};
try {
  tideCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
} catch {
  tideCache = {};
}

function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(tideCache));
  } catch (error) {
    console.warn('조석 캐시 저장 실패:', error.message);
  }
}

const TIDE_URL = 'https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService';
const TIDE_TYPE = { 1: '고조', 2: '저조', 3: '고조', 4: '저조' }; // 극치구분(1: 오전 고조, 2: 오전 저조, 3: 오후 고조, 4: 오후 저조)

// 한국 시간 기준 yyyyMMdd (서버 시간대와 상관없이)
function kstDateString(offsetDays = 0) {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10).replace(/-/g, '');
}

async function requestTide(obsCode, reqDate) {
  return axios.get(TIDE_URL, {
    params: {
      serviceKey: process.env.KHOA_SERVICE_KEY || process.env.PUBLIC_API_KEY,
      type: 'json',
      obsCode,
      reqDate,
      numOfRows: 10,
    },
    timeout: TIMEOUT_MS,
    httpsAgent,
    headers: { 'User-Agent': 'SurfingCaster/1.0' },
  });
}

// 하루치 예보 조회: 실패하면 한 번 더 시도 -> 그래도 실패하면 저장된 값 사용
async function fetchTideDay(obsCode, reqDate) {
  const key = `${obsCode}_${reqDate}`;
  try {
    const items = await fetchTideDayFromApi(obsCode, reqDate);
    // 내용이 바뀐 경우에만 파일에 씀
    if (JSON.stringify(tideCache[key]) !== JSON.stringify(items)) {
      tideCache[key] = items;
      saveCache();
    }
    return items;
  } catch (error) {
    if (tideCache[key]) {
      console.warn(`[조석예보 API 실패 -> 저장된 값 사용 - ${key}]: ${error.message}`);
      return tideCache[key];
    }
    throw error;
  }
}

async function fetchTideDayFromApi(obsCode, reqDate) {
  let response;
  try {
    response = await requestTide(obsCode, reqDate);
  } catch (firstError) {
    console.warn(`[조석예보 재시도 - ${obsCode}]: ${firstError.message}`);
    response = await requestTide(obsCode, reqDate);
  }

  const { header, body } = response.data || {};
  if (!header || header.resultCode !== '00') {
    throw new Error(`조석예보 API 오류: ${header?.resultCode} ${header?.resultMsg}`);
  }

  const item = body?.items?.item;
  return Array.isArray(item) ? item : item ? [item] : [];
}

router.get('/tide/:obsCode', async (req, res) => {
  const { obsCode } = req.params;

  if (!/^[A-Z]{2}_\d{4}$/.test(obsCode)) {
    return res.status(400).json({ error: '관측소 코드 형식이 올바르지 않습니다. (예: DT_0012)' });
  }
  if (!process.env.KHOA_SERVICE_KEY && !process.env.PUBLIC_API_KEY) {
    return res.status(500).json({ error: '.env 에 KHOA_SERVICE_KEY 가 없습니다.' });
  }

  try {
    const [today, tomorrow] = await Promise.all([
      fetchTideDay(obsCode, kstDateString(0)),
      fetchTideDay(obsCode, kstDateString(1)),
    ]);

    const all = [...today, ...tomorrow];
    if (all.length === 0) {
      return res.status(404).json({ error: '해당 관측소의 조석 예보가 없습니다.' });
    }

    res.json({
      stationName: all[0].obsvtrNm,
      events: all.map((item) => ({
        time: item.predcDt,
        level: Number(item.predcTdlvVl),
        type: TIDE_TYPE[item.extrSe] || '-',
      })),
    });
  } catch (error) {
    console.warn(`[조석예보 조회 실패 - ${obsCode}]: ${error.message}`);
    res.status(502).json({ error: '조석 정보를 불러오지 못했습니다.' });
  }
});

module.exports = router;
