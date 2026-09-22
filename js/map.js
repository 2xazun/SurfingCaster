let map;

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

function renderMarkers() {
  STATIONS.forEach((station) => {
    const markerPosition = new kakao.maps.LatLng(station.lat, station.lng);

    const marker = new kakao.maps.Marker({
      position: markerPosition,
      map: map,
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
  });
}

document.addEventListener("DOMContentLoaded", initMap);
