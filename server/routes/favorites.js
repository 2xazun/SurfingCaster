// 즐겨찾기 REST API (모두 로그인 필요)
//  GET    /api/favorites              -> 내 즐겨찾기 목록
//  POST   /api/favorites { stationId } -> 추가
//  DELETE /api/favorites/:stationId    -> 삭제
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// 목록 조회 (먼저 등록한 순서)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, station_id AS stationId, created_at AS createdAt FROM favorites WHERE user_id = ? ORDER BY created_at, id",
      [req.user.id],
    );
    res.json(rows);
  } catch (error) {
    console.error("즐겨찾기 조회 오류:", error.message);
    res.status(500).json({ error: "즐겨찾기 조회 실패" });
  }
});

// 추가
router.post("/", async (req, res) => {
  const stationId = String(req.body.stationId || "").trim();
  if (!stationId || stationId.length > 20) {
    return res.status(400).json({ error: "stationId가 올바르지 않습니다." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO favorites (user_id, station_id) VALUES (?, ?)",
      [req.user.id, stationId],
    );
    res.status(201).json({ id: result.insertId, stationId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "이미 즐겨찾기에 등록된 장소입니다." });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(401).json({ error: "존재하지 않는 사용자입니다. 다시 로그인해주세요." });
    }
    console.error("즐겨찾기 추가 오류:", error.message);
    res.status(500).json({ error: "즐겨찾기 추가 실패" });
  }
});

// 삭제
router.delete("/:stationId", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM favorites WHERE user_id = ? AND station_id = ?",
      [req.user.id, req.params.stationId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "즐겨찾기에 없는 장소입니다." });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("즐겨찾기 삭제 오류:", error.message);
    res.status(500).json({ error: "즐겨찾기 삭제 실패" });
  }
});

module.exports = router;
