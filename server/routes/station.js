const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/stations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT obs_code, obs_name, latitude, longitude FROM obs_stations');
    res.json(rows);
  } catch (error) {
    console.error('DB 관측소 조회 오류:', error.message);
    res.status(500).json({ error: '관측소 목록 조회 실패' });
  }
});

module.exports = router;