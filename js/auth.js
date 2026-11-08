// 로그인 상태 관리 + 백엔드 API 공통 호출 함수
// 로그인하면 서버가 준 토큰(JWT)과 사용자 정보를 localStorage 에 저장하고,
// 이후 요청마다 "Authorization: Bearer <토큰>" 헤더를 붙여서 보냄
const API_BASE = "http://localhost:3000/api";
const TOKEN_KEY = "sc_token";
const USER_KEY = "sc_user";

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // 로그아웃 = 저장된 토큰/사용자 정보 삭제
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // 로그인이 필요한 페이지에서 호출 -> 로그인 안 돼 있으면 로그인 페이지로 이동
  requireLogin() {
    if (!this.isLoggedIn()) {
      location.href = "/login.html";
      return false;
    }
    return true;
  },
};

// fetch 래퍼: 토큰 자동 첨부, 에러 메시지 통일
async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = Auth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error("서버에 연결할 수 없어요. 백엔드 서버가 켜져 있는지 확인해주세요.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // 토큰 만료/잘못된 토큰이면 로그아웃 처리
    if (response.status === 401 && token) Auth.logout();
    const error = new Error(data.error || `요청 실패 (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

// 토스트가 있는 페이지(index)는 토스트로, 없는 페이지는 alert 로 안내
function notify(message) {
  if (document.querySelector("#toast") && typeof showToast === "function") {
    showToast(message);
  } else {
    alert(message);
  }
}
