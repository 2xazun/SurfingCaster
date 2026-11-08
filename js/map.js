let map;
const DOUBLE_CLICK_DELAY = 250; // 이 시간(ms) 안에 두 번 클릭하면 더블클릭으로 판단
const spotPins = {}; // { "ST_001": <button> }
const spotOverlays = {}; // { "ST_001": kakao.maps.CustomOverlay }
let activeStationId = null; // 지도가 늦게 뜨더라도 강조할 수 있게 기억
const COMPACT_LEVEL = 11; // 이 레벨 이상(멀리 볼 때)은 이름을 숨기고 숫자만 보여줌

function initMap() {
  if (typeof kakao === "undefined" || !kakao.maps) {
    setTimeout(initMap, 100);
    return;
  }

  kakao.maps.load(() => {
    const container = document.getElementById("map");
    const options = {
      center: new kakao.maps.LatLng(36.3, 127.9),
      level: 13,
    };

    map = new kakao.maps.Map(container, options);
    renderMarkers();
    paintPinsWithWaves();
    updatePinSize();
    kakao.maps.event.addListener(map, "zoom_changed", updatePinSize);
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

// 기본 핀 대신 "파고 알약" 모양의 커스텀 오버레이를 띄움
function createPin(station) {
  const pin = document.createElement("button");
  pin.type = "button";
  pin.className = "spot-pin";
  pin.dataset.sea = "loading";
  pin.setAttribute("aria-label", `${station.name} 바다 상태 보기`);
  pin.innerHTML = `
    <span class="pin-height">···</span>
    <span class="pin-name">${shortName(station)}</span>`;

  // 카카오맵이 드래그로 가져가지 않도록 이벤트 전파 막기
  ["mousedown", "touchstart", "dblclick"].forEach((type) =>
    pin.addEventListener(type, (e) => e.stopPropagation()),
  );

  // 한 번 클릭 = 바다 상태 보기 / 두 번 클릭 = 즐겨찾기
  let clickTimer = null;
  pin.addEventListener("click", (e) => {
    e.stopPropagation();
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

  return pin;
}

function renderMarkers() {
  STATIONS.forEach((station) => {
    const pin = createPin(station);
    spotPins[station.id] = pin;

    const overlay = new kakao.maps.CustomOverlay({
      map: map,
      position: new kakao.maps.LatLng(station.lat, station.lng),
      content: pin,
      yAnchor: 1.15,
      clickable: true,
      zIndex: 1,
    });
    spotOverlays[station.id] = overlay;
    if (station.id === activeStationId) {
      pin.classList.add("is-active");
      overlay.setZIndex(5);
    }

    // 마우스를 올린 핀은 겹친 핀들 위로 올라오게
    pin.addEventListener("mouseenter", () => overlay.setZIndex(10));
    pin.addEventListener("mouseleave", () =>
      overlay.setZIndex(pin.classList.contains("is-active") ? 5 : 1),
    );
  });
}

// 멀리 볼 때는 핀을 작게 (이름 숨김)
function updatePinSize() {
  const compact = map.getLevel() >= COMPACT_LEVEL;
  document.getElementById("map").classList.toggle("pins-compact", compact);
}

// 전국 파고 조사가 끝나면 핀마다 숫자와 색을 채움
function paintPinsWithWaves() {
  if (typeof surveyAllSpots !== "function") return;

  STATIONS.forEach((station) => {
    surveyStation(station).then((info) => paintPin(station.id, info));
  });
}

function paintPin(stationId, info) {
  const pin = spotPins[stationId];
  if (!pin) return;

  const label = pin.querySelector(".pin-height");
  if (!info || info.height === null) {
    pin.dataset.sea = "unknown";
    label.textContent = "-";
    return;
  }
  pin.dataset.sea = seaLevelOf(info.height);
  label.textContent = `${info.height.toFixed(1)}m`;
}

// 지금 보고 있는 바다의 핀 강조
function setActivePin(stationId) {
  activeStationId = stationId;
  Object.entries(spotPins).forEach(([id, pin]) => {
    const active = id === stationId;
    pin.classList.toggle("is-active", active);
    spotOverlays[id]?.setZIndex(active ? 5 : 1);
  });
}

// 검색 등에서 특정 장소로 지도 이동
function focusStation(station) {
  if (!map) return;
  map.setLevel(9);
  map.panTo(new kakao.maps.LatLng(station.lat, station.lng));
}

document.addEventListener("DOMContentLoaded", initMap);
