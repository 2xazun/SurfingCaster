// 즐겨찾기 - 백엔드 API 호출 + 즐겨찾기 페이지(highlight.html) 렌더링

// ===== 1. API 호출 함수 (모든 페이지에서 사용) =====
async function getFavorites() {
  const rows = await apiRequest("/favorites");
  // DB에는 stationId만 있으므로 STATIONS 목데이터에서 장소 정보를 찾아 합침
  return rows
    .map((row) => STATIONS.find((station) => station.id === row.stationId))
    .filter(Boolean);
}

async function addFavorite(station) {
  if (!Auth.isLoggedIn()) {
    if (confirm("즐겨찾기는 로그인 후 사용할 수 있어요. 로그인 페이지로 이동할까요?")) {
      location.href = "/login.html";
    }
    return false;
  }

  try {
    await apiRequest("/favorites", { method: "POST", body: { stationId: station.id } });
    notify(`⭐ ${station.name}을(를) 즐겨찾기에 추가했어요.`);
    return true;
  } catch (error) {
    notify(error.message);
    if (error.status === 401) location.href = "/login.html";
    return false;
  }
}

async function removeFavorite(stationId) {
  await apiRequest(`/favorites/${encodeURIComponent(stationId)}`, { method: "DELETE" });
}

// 메인 페이지로 이동하면서 해당 장소 정보를 보여주도록 전달
function openStationOnMain(station) {
  sessionStorage.setItem("selectedStation", JSON.stringify(station));
  location.href = "/index.html";
}

// ===== 2. 즐겨찾기 페이지 렌더링 (highlight.html 에서만 동작) =====
async function renderFavoritesPage() {
  const highlightList = document.querySelector(".highlight-list");
  if (!highlightList) return;

  if (!Auth.requireLogin()) return;

  let stations;
  try {
    stations = await getFavorites();
  } catch (error) {
    highlightList.innerHTML = `<li class="highlight-empty">${error.message}</li>`;
    if (error.status === 401) location.href = "/login.html";
    return;
  }

  if (stations.length === 0) {
    highlightList.innerHTML = `<li class="highlight-empty">아직 담은 바다가 없어요.<br />오른쪽 지도에서 마음에 드는 해변 마커를 두 번 눌러 담아보세요.</li>`;
    return;
  }

  highlightList.innerHTML = stations
    .map(
      (station) =>
        `<li class="highlight" data-id="${station.id}">
          <span class="highlight-name">${station.name}</span>
          <button class="delete" data-id="${station.id}" aria-label="${station.name} 즐겨찾기에서 빼기">빼기</button>
        </li>`,
    )
    .join("");
}

function bindFavoritesPageEvents() {
  const highlightList = document.querySelector(".highlight-list");
  if (!highlightList) return;

  // 이벤트 위임: li가 다시 그려져도 리스너는 한 번만 등록
  highlightList.addEventListener("click", async (e) => {
    const deleteButton = e.target.closest(".delete");
    if (deleteButton) {
      e.stopPropagation(); // 삭제 버튼 누를 때 페이지 이동 막기
      const stationId = deleteButton.dataset.id;
      try {
        await removeFavorite(stationId);
        renderFavoritesPage();
      } catch (error) {
        alert(error.message);
      }
      return;
    }

    const item = e.target.closest(".highlight");
    if (!item) return;
    const station = STATIONS.find((s) => s.id === item.dataset.id);
    if (station) openStationOnMain(station);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindFavoritesPageEvents();
  renderFavoritesPage();
});
