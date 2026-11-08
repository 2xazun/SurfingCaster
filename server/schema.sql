-- =========================================================
-- SurfingCaster DB 스키마
-- 실행: MySQL Workbench에서 이 파일 열고 ⚡(Execute) 클릭
-- 이미 있는 테이블은 건너뛰므로(IF NOT EXISTS) 여러 번 실행해도 안전함
-- =========================================================

CREATE DATABASE IF NOT EXISTS surfingcaster
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE surfingcaster;

-- 1. 관측소 정보 (이미 만들어 둔 테이블과 동일한 구조)
CREATE TABLE IF NOT EXISTS obs_stations (
  id         INT           NOT NULL AUTO_INCREMENT,
  obs_code   VARCHAR(20)   NOT NULL,
  obs_name   VARCHAR(50)   NOT NULL,
  latitude   DECIMAL(10,7) NOT NULL,
  longitude  DECIMAL(10,7) NOT NULL,
  created_at TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_obs_code (obs_code)
);

-- 2. 사용자
CREATE TABLE IF NOT EXISTS users (
  id            INT          NOT NULL AUTO_INCREMENT,
  login_id      VARCHAR(30)  NOT NULL,            -- 로그인할 때 쓰는 아이디
  password_hash VARCHAR(255) NOT NULL,            -- 비밀번호는 bcrypt 해시로만 저장 (원문 저장 X)
  name          VARCHAR(50)  NOT NULL,
  created_at    TIMESTAMP    NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_login_id (login_id)
);

-- 3. 즐겨찾기 (사용자 1명 : 즐겨찾기 N개)
--    station_id 는 프론트 js/stations.js 의 id 값("ST_001" 등)을 저장
CREATE TABLE IF NOT EXISTS favorites (
  id         INT         NOT NULL AUTO_INCREMENT,
  user_id    INT         NOT NULL,
  station_id VARCHAR(20) NOT NULL,
  created_at TIMESTAMP   NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_station (user_id, station_id), -- 같은 장소 중복 등록 방지
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE                               -- 회원 삭제 시 즐겨찾기도 같이 삭제
);
