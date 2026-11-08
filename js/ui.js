const waveHeight = document.querySelector(".wave-height");
const TMP = document.querySelector(".TMP");
const V = document.querySelector(".V");
const Tide = document.querySelector(".Tide");
const waveLevel = document.querySelector(".wave-level");
const currentStation = document.querySelector(".current-station");
const waveSource = document.querySelector(".wave-source");

// 기상청 응답 items 에서 category(TMP, VEC, WSD, WAV ...)로 가장 가까운 예보값 찾기
// (배열 순서[0], [3]...에 의존하면 응답 순서가 바뀔 때 엉뚱한 값이 들어가서 category로 찾음)
function getForecastValue(items, category) {
  const item = items.find((i) => i.category === category);
  return item ? item.fcstValue : null;
}

function getWeatherItems(weather) {
  const header = weather?.response?.header;
  if (header && header.resultCode !== "00") {
    console.warn("기상청 응답 코드:", header.resultCode, header.resultMsg);
    return null;
  }
  const items = weather?.response?.body?.items?.item;
  return Array.isArray(items) && items.length > 0 ? items : null;
}

// 실측 파고(wh). 관측값이 없으면 "-" 로 오므로 null 처리
function getMeasuredWave(wave) {
  const items = wave?.response?.body?.items?.item;
  const item = Array.isArray(items) ? items[items.length - 1] : items;
  const wh = Number(item?.wh);
  return item && item.wh !== "-" && !Number.isNaN(wh) ? wh : null;
}

// 다음 만조(고조) / 간조(저조) 찾기
function formatTide(tide) {
  const events = tide?.events;
  if (!Array.isArray(events) || events.length === 0) return "정보없음";

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.time.replace(" ", "T")) >= now);
  const nextHigh = upcoming.find((e) => e.type === "고조");
  const nextLow = upcoming.find((e) => e.type === "저조");

  const text = (label, e) => {
    if (!e) return null;
    const [date, time] = e.time.split(" ");
    const isTomorrow = date !== events[0].time.split(" ")[0];
    return `${label} ${isTomorrow ? "내일 " : ""}${time} (${e.level}cm)`;
  };

  const parts = [text("다음 만조", nextHigh), text("다음 간조", nextLow)].filter(Boolean);
  return parts.length > 0 ? parts.join("\n") : "정보없음";
}

function getWaterTemp(water) {
  const items = water?.response?.body?.items?.item;
  const item = Array.isArray(items) ? items[items.length - 1] : items;
  const tw = item?.tw;
  return tw !== undefined && tw !== null && tw !== "" ? tw : null;
}

function windDirectionText(VEC) {
  const deg = Number(VEC);
  if (deg >= 337.5 || deg < 22.5) return "북풍";
  if (deg < 67.5) return "북동풍";
  if (deg < 112.5) return "동풍";
  if (deg < 157.5) return "남동풍";
  if (deg < 202.5) return "남풍";
  if (deg < 247.5) return "남서풍";
  if (deg < 292.5) return "서풍";
  return "북서풍";
}

// 파고(+풍속)를 보고 "오늘 서핑 어때?"에 대한 한 줄 판정
function surfVerdict(height, windSpeed) {
  let text;
  if (height < 0.3) text = "파도가 거의 없어요. 패들 연습이나 SUP 타기 좋아요";
  else if (height <= 0.5) text = "잔잔해요. 서핑 입문 연습하기 좋은 날";
  else if (height < 1.5) text = "서핑하기 딱 좋은 파도예요!";
  else if (height < 2) text = "파도가 높아요. 중급자 이상에게 추천해요";
  else text = "파도가 위험해요. 오늘은 입수를 피하세요";

  if (windSpeed >= 9 && height < 2) text += " (바람이 강하니 주의)";
  return text;
}

function setTempLabel(label) {
  const dt = TMP.closest(".stat")?.querySelector("dt");
  if (dt) dt.textContent = label;
}

function setLoading(station) {
  if (currentStation) currentStation.textContent = `📍 ${station.name}`;
  if (waveSource) waveSource.textContent = "";
  waveHeight.textContent = "-";
  waveLevel.textContent = "파도를 확인하는 중…";
  setTempLabel("수온");
  TMP.textContent = "-";
  V.textContent = "-";
  Tide.textContent = "-";
}

async function dataLoad(station) {
  if (!station || !waveHeight) return;
  setLoading(station);
  if (typeof setActivePin === "function") setActivePin(station.id);

  // 날씨(풍향/풍속/예보 파고/기온) + 수온 + 실측 파고 + 조석을 Promise.allSettled 로 동시에 요청
  const { weather, water, wave, tide } = await fetchAllMarineData(
    station.beachCode,
    station.obsCode,
  );

  const items = getWeatherItems(weather);

  //1. 수온 (관측값이 없으면 예보 기온으로 대신 표시)
  const waterTemp = getWaterTemp(water);
  if (waterTemp !== null) {
    TMP.textContent = waterTemp;
  } else {
    const airTemp = items ? getForecastValue(items, "TMP") : null;
    TMP.textContent = airTemp !== null ? airTemp : "-";
    if (airTemp !== null) setTempLabel("기온 (수온 관측 없음)");
  }

  //2. 풍향/풍속
  const VEC = items ? getForecastValue(items, "VEC") : null;
  const WSD = items ? getForecastValue(items, "WSD") : null;
  V.textContent = VEC !== null && WSD !== null ? `${windDirectionText(VEC)} ${WSD}` : "-";

  //3. 파고 (실측값 우선, 없으면 예보값) + 파도 애니메이션
  const measured = getMeasuredWave(wave);
  const forecast = items ? Number(getForecastValue(items, "WAV")) : NaN;
  const height = measured !== null ? measured : Number.isNaN(forecast) ? null : forecast;

  if (height !== null) {
    waveHeight.textContent = height.toFixed(1);
    waveLevel.textContent = surfVerdict(height, Number(WSD));
    if (waveSource) waveSource.textContent = measured !== null ? "실시간 관측 파고" : "예보 파고";
    updateWave(height);
    if (typeof paintPin === "function") paintPin(station.id, { height, measured: measured !== null });
  } else {
    waveHeight.textContent = "-";
    waveLevel.textContent = "지금은 파고 정보가 없어요";
    if (typeof setSeaTheme === "function") setSeaTheme("unknown");
  }

  //4. 물때 (다음 만조/간조)
  Tide.textContent = formatTide(tide);

  // 기상청 데이터가 통째로 실패한 경우 안내
  if (!items && waterTemp === null && measured === null) {
    showToast("바다 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  const toastMessage = document.querySelector(".toast-message");
  if (!toast || !toastMessage) {
    console.log(message);
    return;
  }

  toastMessage.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}
