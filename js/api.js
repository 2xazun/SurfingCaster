const SERVICE_KEY = CONFIG.PUBLIC_API_KEY;

// 1. 기상청 해수욕장 날씨 (파고, 풍향, 풍속)
async function fetchWeatherData(beachCode) {
  // 예외 처리: beachCode가 전달되지 않은 경우
  if (!beachCode) {
    console.warn("beachCode가 없어 날씨 데이터를 요청하지 않습니다.");
    return null;
  }

  const date = new Date();
  
  // 기상청 단기예보 Base_time 기준 계산 (02:00, 05:00, 08:00, 11:00, 14:00, 17:00, 20:00, 23:00)
  // 매시간 20분 이후부터 해당 타임 슬롯 최신 데이터 제공
  let baseDate = new Date(date);
  let hour = date.getHours();
  let minute = date.getMinutes();

  // 새벽 02시 20분 이전이면 '어제 23시' 데이터를 조회
  if (hour < 2 || (hour === 2 && minute < 20)) {
    baseDate.setDate(baseDate.getDate() - 1);
    hour = 23;
  } else {
    // 3시간 단위 (2, 5, 8, 11, 14, 17, 20, 23) 계산
    let hourSlot = Math.floor((hour - 2) / 3) * 3 + 2;
    if (hour === hourSlot && minute < 20) {
      hourSlot -= 3;
    }
    hour = hourSlot;
  }

  const dateFormat = 
    baseDate.getFullYear().toString() +
    String(baseDate.getMonth() + 1).padStart(2, "0") +
    String(baseDate.getDate()).padStart(2, "0");

  const timeFormat = String(hour).padStart(2, "0") + "00";

  const url = `https://apis.data.go.kr/1360000/BeachInfoservice/getVilageFcstBeach?serviceKey=${SERVICE_KEY}&dataType=JSON&beach_num=${beachCode}&base_time=${timeFormat}&base_date=${dateFormat}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`기상청 API 응답 오류 (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error("fetchWeatherData 에러:", error);
    return null; // 하나가 실패하더라도 전체가 멈추지 않도록 null 반환
  }
}

// 2. 국립해양조사원 조석 데이터 조회 (Node.js 백엔드 프록시 경유)
async function fetchTideData(obsCode) {
  if (!obsCode) return null;

  try {
    const response = await fetch(`http://localhost:3000/api/ocean/tide/${obsCode}`);
    if (!response.ok) {
      throw new Error(`서버 응답 에러 (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("fetchTideData 에러:", error);
    return null;
  }
}

// 3. 기상청 해수욕장 수온 조회 (실시간 부이 관측값)
async function fetchWaterTemp(beachCode) {
  if (!beachCode) return null;

  // 관측값은 보통 30분 단위로 올라오므로 1시간 전 시각으로 조회
  const t = new Date(Date.now() - 60 * 60 * 1000);
  const searchTime =
    t.getFullYear().toString() +
    String(t.getMonth() + 1).padStart(2, "0") +
    String(t.getDate()).padStart(2, "0") +
    String(t.getHours()).padStart(2, "0") +
    "00";

  const url = `https://apis.data.go.kr/1360000/BeachInfoservice/getTwBuoyBeach?serviceKey=${SERVICE_KEY}&dataType=JSON&beach_num=${beachCode}&searchTime=${searchTime}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`수온 API 응답 오류 (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error("fetchWaterTemp 에러:", error);
    return null;
  }
}

// 4. Promise.allSettled 이용 병렬 호출 (날씨 + 수온 + 조석 3개를 동시에 요청)
async function fetchAllMarineData(beachCode, obsCode) {
  // Promise.all 대신 Promise.allSettled를 사용하면 API 중 하나가 실패해도 나머지 성공한 데이터는 정상 활용 가능
  const [weatherResult, waterResult, tideResult] = await Promise.allSettled([
    fetchWeatherData(beachCode),
    fetchWaterTemp(beachCode),
    fetchTideData(obsCode),
  ]);

  const valueOf = (result) => (result.status === "fulfilled" ? result.value : null);

  return {
    weather: valueOf(weatherResult),
    water: valueOf(waterResult),
    tide: valueOf(tideResult),
  };
}
