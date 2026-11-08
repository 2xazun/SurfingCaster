// 앱 초기화 진입점 (index.html)
// 처음 보여줄 장소 정하기:
//  1) 즐겨찾기/마이페이지에서 장소를 골라서 넘어온 경우 -> 그 장소
//  2) 로그인 상태 + 즐겨찾기가 있으면 -> 첫 번째 즐겨찾기 장소
//  3) 그 외 -> 기본 장소(STATIONS[0])
document.addEventListener("DOMContentLoaded", async () => {
  const stationData = sessionStorage.getItem("selectedStation");
  if (stationData) {
    sessionStorage.removeItem("selectedStation"); // 사용한 데이터 삭제
    const selected = JSON.parse(stationData);
    dataLoad(selected);
    focusWhenMapReady(selected);
    return;
  }

  if (Auth.isLoggedIn()) {
    try {
      const favorites = await getFavorites();
      if (favorites.length > 0) {
        dataLoad(favorites[0]);
        focusWhenMapReady(favorites[0]);
        showToast(`첫 번째 즐겨찾기 장소인 ${favorites[0].name}의 정보를 보여드리고 있어요.`);
        return;
      }
    } catch (error) {
      console.error("즐겨찾기 불러오기 실패:", error);
    }
  }

  const defaultStation = STATIONS[0];
  dataLoad(defaultStation);
  showToast(
    Auth.isLoggedIn()
      ? "마커를 더블클릭하면 즐겨찾기에 추가돼요."
      : `${defaultStation.name}의 정보를 보여드리고 있어요. 로그인하면 즐겨찾기를 쓸 수 있어요.`,
  );
});

// 지도는 카카오 SDK 로딩 후에 만들어지므로, 준비될 때까지 기다렸다가 이동
function focusWhenMapReady(station, tries = 0) {
  if (typeof map !== "undefined" && map) {
    focusStation(station);
  } else if (tries < 50) {
    setTimeout(() => focusWhenMapReady(station, tries + 1), 100);
  }
}
