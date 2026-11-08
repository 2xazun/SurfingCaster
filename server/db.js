// MySQL 커넥션 풀 설정
// 값은 프로젝트 루트의 .env 에서 읽어옴 (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "surfingcaster",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
