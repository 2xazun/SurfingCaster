// 마이페이지: 로그인한 사용자 정보 표시 + 로그아웃
document.addEventListener("DOMContentLoaded", async () => {
  const myPage = document.querySelector(".myPage");
  if (!myPage) return; // 마이페이지가 아니면 아무것도 안 함

  if (!Auth.requireLogin()) return;

  const idEl = myPage.querySelector(".id");
  const nameEl = myPage.querySelector(".name");
  const avatarEl = myPage.querySelector(".avatar");
  const countEl = myPage.querySelector(".favorite-count");

  const showUser = (user) => {
    idEl.textContent = user.loginId;
    nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = user.name.trim().charAt(0) || "?";
  };

  // 저장된 정보로 먼저 빠르게 보여주고
  const cached = Auth.getUser();
  if (cached) showUser(cached);

  // 즐겨찾기 개수
  if (countEl) {
    getFavorites()
      .then((list) => (countEl.textContent = `${list.length}곳`))
      .catch(() => (countEl.textContent = ""));
  }

  // 서버에서 최신 정보로 한 번 더 확인 (토큰 만료 체크 겸)
  try {
    const { user } = await apiRequest("/auth/me");
    showUser(user);
    Auth.save(Auth.getToken(), user);
  } catch (error) {
    if (error.status === 401) {
      alert(error.message);
      location.href = "/login.html";
    } else {
      console.error("내 정보 조회 실패:", error);
    }
  }

  // 로그아웃
  myPage.querySelector(".logout-button").addEventListener("click", () => {
    Auth.logout();
    alert("로그아웃 되었습니다.");
    location.href = "/login.html";
  });
});
