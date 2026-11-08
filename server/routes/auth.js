// 회원가입 / 로그인 / 내 정보 조회 API
//  POST /api/auth/signup  { loginId, password, name }
//  POST /api/auth/login   { loginId, password }  -> { token, user }
//  GET  /api/auth/me      (토큰 필요)             -> { user }
// 로그아웃은 JWT 특성상 서버에 저장된 게 없으므로 프론트에서 토큰을 지우면 끝
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const LOGIN_ID_RULE = /^[a-zA-Z0-9_]{4,20}$/;

function toUserResponse(row) {
  return { id: row.id, loginId: row.login_id, name: row.name };
}

// 회원가입
router.post("/signup", async (req, res) => {
  const loginId = String(req.body.loginId || "").trim();
  const password = String(req.body.password || "");
  const name = String(req.body.name || "").trim();

  if (!loginId || !password || !name) {
    return res.status(400).json({ error: "이름, 아이디, 비밀번호를 모두 입력해주세요." });
  }
  if (!LOGIN_ID_RULE.test(loginId)) {
    return res
      .status(400)
      .json({ error: "아이디는 영문/숫자/_ 4~20자로 입력해주세요." });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "비밀번호는 4자 이상이어야 합니다." });
  }
  if (name.length > 50) {
    return res.status(400).json({ error: "이름은 50자 이하로 입력해주세요." });
  }

  try {
    const [exists] = await db.query("SELECT id FROM users WHERE login_id = ?", [loginId]);
    if (exists.length > 0) {
      return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (login_id, password_hash, name) VALUES (?, ?, ?)",
      [loginId, passwordHash, name],
    );

    res.status(201).json({ user: { id: result.insertId, loginId, name } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
    }
    console.error("회원가입 오류:", error.message);
    res.status(500).json({ error: "회원가입 중 서버 오류가 발생했습니다." });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const loginId = String(req.body.loginId || "").trim();
  const password = String(req.body.password || "");

  if (!loginId || !password) {
    return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE login_id = ?", [loginId]);
    const user = rows[0];

    // 아이디가 없든 비밀번호가 틀리든 같은 메시지 (어느 쪽이 틀렸는지 알려주지 않기)
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) {
      return res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    }

    const token = jwt.sign(
      { id: user.id, loginId: user.login_id, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token, user: toUserResponse(user) });
  } catch (error) {
    console.error("로그인 오류:", error.message);
    res.status(500).json({ error: "로그인 중 서버 오류가 발생했습니다." });
  }
});

// 내 정보
router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, login_id, name FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "존재하지 않는 사용자입니다." });
    }
    res.json({ user: toUserResponse(rows[0]) });
  } catch (error) {
    console.error("내 정보 조회 오류:", error.message);
    res.status(500).json({ error: "사용자 정보 조회 실패" });
  }
});

module.exports = router;
