// 전국 스폿 파고 한 번에 조사하기
// - 지도 위 파고 핀 색깔, "지금 서핑하기 좋은 바다 TOP 3" 에서 같이 사용
// - 실측 파고(getWhBuoyBeach)를 우선 쓰고, 관측값이 없는 곳만 예보 파고(WAV)로 대신함
const SPOT_WAVES = {}; // { "ST_001": { height: 1.1, measured: true } }

function shortName(station) {
  return station.name.replace(/\s*(해수욕장|해변)$/, "");
}

// 같은 해변을 두 번 조사하지 않도록 요청(Promise)을 저장해 둠
const surveyRequests = {};
function surveyStation(station) {
  if (!surveyRequests[station.id]) surveyRequests[station.id] = doSurvey(station);
  return surveyRequests[station.id];
}

async function doSurvey(station) {
  const wave = await fetchWaveHeight(station.beachCode);
  let height = getMeasuredWave(wave);
  let measured = height !== null;

  if (height === null) {
    const items = getWeatherItems(await fetchWeatherData(station.beachCode));
    const forecast = items ? Number(getForecastValue(items, "WAV")) : NaN;
    height = Number.isNaN(forecast) ? null : forecast;
  }

  SPOT_WAVES[station.id] = { height, measured };
  return SPOT_WAVES[station.id];
}

// 21곳을 동시에 조사 (Promise.allSettled: 일부가 실패해도 나머지는 표시)
let surveyPromise = null;
function surveyAllSpots() {
  if (!surveyPromise) {
    surveyPromise = Promise.allSettled(STATIONS.map(surveyStation)).then(() => SPOT_WAVES);
  }
  return surveyPromise;
}

// 서핑하기 좋은 순서: 1.2m 에 가까울수록 좋음 (0.5m 미만, 2.5m 이상은 제외)
const IDEAL_WAVE = 1.2;
function rankSurfSpots() {
  return STATIONS.map((station) => ({ station, ...SPOT_WAVES[station.id] }))
    .filter((s) => s.height !== null && s.height !== undefined && s.height >= 0.5 && s.height < 2.5)
    .sort((a, b) => Math.abs(a.height - IDEAL_WAVE) - Math.abs(b.height - IDEAL_WAVE))
    .slice(0, 3);
}

function renderTopSpots() {
  const box = document.querySelector(".top-spots-list");
  if (!box) return;

  const top = rankSurfSpots();
  if (top.length === 0) {
    box.innerHTML = `<li class="top-spots-empty">지금은 전국 바다가 잔잔해요. 입문 연습이나 SUP 타기 좋은 날이에요.</li>`;
    return;
  }

  box.innerHTML = top
    .map(
      (s, i) => `
      <li>
        <button type="button" class="top-spot" data-id="${s.station.id}" data-sea="${seaLevelOf(s.height)}">
          <span class="top-rank">${i + 1}</span>
          <span class="top-name">${s.station.name}</span>
          <span class="top-height">${s.height.toFixed(1)}m</span>
        </button>
      </li>`,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector(".top-spots-list");
  if (!box) return;

  box.addEventListener("click", (e) => {
    const button = e.target.closest(".top-spot");
    if (!button) return;
    const station = STATIONS.find((s) => s.id === button.dataset.id);
    if (!station) return;
    if (typeof focusStation === "function") focusStation(station);
    dataLoad(station);
  });

  surveyAllSpots().then(renderTopSpots);
});
