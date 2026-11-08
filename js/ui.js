const waveHeight = document.querySelector(".wave-height");
const TMP = document.querySelector(".TMP");
const V = document.querySelector(".V");
const Tide = document.querySelector(".Tide");
const waveLevel = document.querySelector(".wave-level");
const currentStation = document.querySelector(".current-station");

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

function waveLevelText(height) {
  if (height <= 0.5) return "완만함";
  if (height < 2) return "적당함";
  return "매우 높음!";
}

function setLoading(station) {
  if (currentStation) currentStation.textContent = `📍 ${station.name}`;
  waveHeight.textContent = "-";
  waveLevel.textContent = "불러오는 중...";
  TMP.textContent = "-";
  V.textContent = "-";
  Tide.textContent = "-";
}

async function dataLoad(station) {
  if (!station || !waveHeight) return;
  setLoading(station);

  // 날씨(파고/풍향/풍속/기온) + 수온 + 조석을 Promise.allSettled 로 동시에 요청
  const { weather, water, tide } = await fetchAllMarineData(
    station.beachCode,
    station.obsCode,
  );

  const items = getWeatherItems(weather);

  if (items) {
    //1. 수온 넣기 (수온 관측값이 없으면 예보 기온으로 대신 표시)
    const waterTemp = getWaterTemp(water);
    if (waterTemp !== null) {
      TMP.textContent = waterTemp;
    } else {
      const airTemp = getForecastValue(items, "TMP");
      TMP.textContent = airTemp !== null ? `${airTemp}(기온)` : "정보없음";
    }

    //2. 풍향/풍속 넣기
    const VEC = getForecastValue(items, "VEC");
    const WSD = getForecastValue(items, "WSD");
    V.textContent = VEC !== null && WSD !== null ? `${windDirectionText(VEC)} ${WSD}` : "정보없음";

    //3. 파고 넣기 + 파도 애니메이션
    const WAV = getForecastValue(items, "WAV");
    if (WAV !== null) {
      const height = Number(WAV);
      waveHeight.textContent = WAV;
      waveLevel.textContent = waveLevelText(height);
      updateWave(height);
    } else {
      waveHeight.textContent = "-";
      waveLevel.textContent = "정보없음";
    }
  } else {
    // 기상청 서버가 느리거나 에러가 난 경우
    waveHeight.textContent = "-";
    waveLevel.textContent = "정보없음";
    TMP.textContent = "-";
    V.textContent = "-";
    showToast("날씨 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
  }

  //4. 국립해양조사원 물때(조위) 넣기
  const rawData = tide?.result?.data?.record || tide?.result?.data || {};
  const record = Array.isArray(rawData) ? rawData[0] : rawData;
  const tideLevel = record?.tide_level || record?.tide_lvl || record?.real_value;
  const recordTime = record?.record_time || record?.obs_time || "";

  Tide.textContent = tideLevel ? `${tideLevel} cm (${recordTime})` : "정보없음";
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  const toastMessage = document.querySelector(".toast-message");
  if (!toast || !toastMessage) {
    console.log(message);
    return;
  }

  toastMessage.textContent = message;

  toast.classList.remove("opacity-0", "invisible", "translate-y-[-10px]");
  toast.classList.add("opacity-100", "visible", "translate-y-0");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("opacity-100", "visible", "translate-y-0");
    toast.classList.add("opacity-0", "invisible", "translate-y-[-10px]");
  }, 3000);
}
