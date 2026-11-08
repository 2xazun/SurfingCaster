// 로그인 확인 미들웨어
// 요청 헤더의 "Authorization: Bearer <토큰>" 을 검사해서 req.user 에 사용자 정보를 넣어줌
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "surfingcaster-dev-secret";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, loginId: payload.loginId, name: payload.name };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "로그인이 만료되었습니다. 다시 로그인해주세요." });
  }
}

module.exports = { requireAuth, JWT_SECRET };
