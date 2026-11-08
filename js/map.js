let map;
const DOUBLE_CLICK_DELAY = 250; // 이 시간(ms) 안에 두 번 클릭하면 더블클릭으로 판단

function initMap() {
  if (typeof kakao === "undefined" || !kakao.maps) {
    setTimeout(initMap, 100);
    return;
  }

  kakao.maps.load(() => {
    const container = document.getElementById("map");
    const options = {
      center: new kakao.maps.LatLng(36.5, 127.8),
      level: 13,
    };

    map = new kakao.maps.Map(container, options);
    renderMarkers();
  });
}

// 마커 한 번 클릭 -> 해당 장소 데이터 보기
// 사이드바(실시간 바다 상태)가 있는 메인 페이지면 바로 불러오고, 아니면 메인으로 이동
function handleMarkerClick(station) {
  if (document.querySelector(".wave-height")) {
    dataLoad(station);
  } else {
    openStationOnMain(station);
  }
}

// 마커 더블클릭 -> 즐겨찾기 추가
async function handleMarkerDoubleClick(station) {
  const added = await addFavorite(station);
  // 즐겨찾기 페이지에 있으면 목록 새로고침
  if (added && typeof renderFavoritesPage === "function") {
    renderFavoritesPage();
  }
}

function renderMarkers() {
  STATIONS.forEach((station) => {
    const markerPosition = new kakao.maps.LatLng(station.lat, station.lng);

    const marker = new kakao.maps.Marker({
      position: markerPosition,
      map: map,
      clickable: true, // 마커 클릭이 지도 클릭/확대로 번지지 않도록
    });

    const infowindow = new kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;color:#333;">${station.name}</div>`,
    });

    kakao.maps.event.addListener(marker, "mouseover", function () {
      infowindow.open(map, marker);
    });

    kakao.maps.event.addListener(marker, "mouseout", function () {
      infowindow.close();
    });

    // 카카오 마커는 dblclick 이벤트를 지원하지 않아서 click 간격으로 직접 판별
    let clickTimer = null;
    kakao.maps.event.addListener(marker, "click", function () {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        handleMarkerDoubleClick(station);
        return;
      }
      clickTimer = setTimeout(() => {
        clickTimer = null;
        handleMarkerClick(station);
      }, DOUBLE_CLICK_DELAY);
    });
  });
}

// 검색 등에서 특정 장소로 지도 이동
function focusStation(station) {
  if (!map) return;
  map.setLevel(7);
  map.panTo(new kakao.maps.LatLng(station.lat, station.lng));
}

document.addEventListener("DOMContentLoaded", initMap);
