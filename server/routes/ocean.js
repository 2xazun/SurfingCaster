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

const TIDE_URL = 'https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService';
const TIDE_TYPE = { 1: '고조', 2: '저조', 3: '고조', 4: '저조' }; // 극치구분(1: 오전 고조, 2: 오전 저조, 3: 오후 고조, 4: 오후 저조)

// 한국 시간 기준 yyyyMMdd (서버 시간대와 상관없이)
function kstDateString(offsetDays = 0) {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10).replace(/-/g, '');
}

async function fetchTideDay(obsCode, reqDate) {
  const response = await axios.get(TIDE_URL, {
    params: {
      serviceKey: process.env.KHOA_SERVICE_KEY || process.env.PUBLIC_API_KEY,
      type: 'json',
      obsCode,
      reqDate,
      numOfRows: 10,
    },
    timeout: 5000,
  });

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
