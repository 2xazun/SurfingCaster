const SERVICE_KEY = CONFIG.PUBLIC_API_KEY;

// 1. 기상청 해수욕장 날씨 (파고, 풍향, 풍속)
async function fetchWeatherData(beachCode) {
  const url = `https://apis.data.go.kr/1360000/BeachInfoservice/getVilageFcstBeach?serviceKey=${SERVICE_KEY}&dataType=JSON&beach_num=${beachCode}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("기상청 API 응답 오류");
  return response.json();
}

// 2. 국립해양조사원 조석예보 (관측소 조석)
async function fetchTideData(obsCode) {
  const url = `https://www.khoa.go.kr/api/oceangrid/tideObsRecent/search.do?ServiceKey=${SERVICE_KEY}&ObsCode=${obsCode}&ResultType=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("해양조사원 API 응답 오류");
  return response.json();
}

// 3. Promise.all 병렬 호출
async function fetchAllMarineData(beachCode, obsCode) {
  try {
    const [weatherRes, tideRes] = await Promise.all([
      fetchWeatherData(beachCode),
      fetchTideData(obsCode)
    ]);

    return {
      weather: weatherRes,
      tide: tideRes
    };
  } catch (error) {
    console.error("데이터 병렬 불러오기 실패:", error);
    throw error;
  }
}