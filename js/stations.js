// 서핑/해양 레저 스폿 목록
//  beachCode : 기상청 해수욕장 번호 (BeachInfoservice 의 beach_num)
//              출처: 기상청 날씨누리 해수욕장예보 (https://www.weather.go.kr/w/forecast/life/beach.do)
//  obsCode   : 국립해양조사원 조석 예보지점 코드 (해수욕장에서 가장 가까운 조위관측소)
//  id        : 즐겨찾기 DB(favorites.station_id)에 저장되는 값 -> 한 번 정하면 바꾸지 않기!
const STATIONS = [
  // 강원 (동해안)
  { id: "ST_001", name: "양양 죽도 해변", lat: 37.9691, lng: 128.7601, beachCode: "250", obsCode: "DT_0012" },
  { id: "ST_002", name: "속초 해수욕장", lat: 38.1906, lng: 128.6034, beachCode: "201", obsCode: "DT_0012" },
  { id: "ST_004", name: "양양 하조대 해수욕장", lat: 38.02, lng: 128.73, beachCode: "249", obsCode: "DT_0012" },
  { id: "ST_005", name: "양양 낙산 해수욕장", lat: 38.12, lng: 128.63, beachCode: "262", obsCode: "DT_0012" },
  { id: "ST_006", name: "강릉 경포 해수욕장", lat: 37.81, lng: 128.91, beachCode: "176", obsCode: "DT_0006" },
  { id: "ST_007", name: "동해 망상 해수욕장", lat: 37.59, lng: 129.09, beachCode: "198", obsCode: "DT_0006" },
  { id: "ST_008", name: "삼척 해수욕장", lat: 37.47, lng: 129.17, beachCode: "203", obsCode: "DT_0006" },

  // 경북 · 울산 · 부산
  { id: "ST_009", name: "포항 영일대 해수욕장", lat: 36.05, lng: 129.38, beachCode: "271", obsCode: "DT_0091" },
  { id: "ST_010", name: "울산 진하 해수욕장", lat: 35.38, lng: 129.35, beachCode: "313", obsCode: "DT_0020" },
  { id: "ST_003", name: "해운대 해수욕장", lat: 35.1587, lng: 129.1604, beachCode: "304", obsCode: "DT_0005" },
  { id: "ST_011", name: "부산 송정 해수욕장", lat: 35.18, lng: 129.2, beachCode: "305", obsCode: "DT_0005" },
  { id: "ST_012", name: "부산 광안리 해수욕장", lat: 35.15, lng: 129.12, beachCode: "306", obsCode: "DT_0005" },

  // 제주
  { id: "ST_013", name: "제주 협재 해수욕장", lat: 33.39, lng: 126.24, beachCode: "346", obsCode: "DT_0023" },
  { id: "ST_014", name: "제주 중문 색달 해수욕장", lat: 33.25, lng: 126.41, beachCode: "347", obsCode: "DT_0010" },
  { id: "ST_015", name: "제주 함덕 해수욕장", lat: 33.54, lng: 126.67, beachCode: "352", obsCode: "DT_0004" },
  { id: "ST_016", name: "제주 이호테우 해수욕장", lat: 33.5, lng: 126.45, beachCode: "348", obsCode: "DT_0004" },

  // 서해
  { id: "ST_017", name: "인천 을왕리 해수욕장", lat: 37.45, lng: 126.37, beachCode: "1", obsCode: "DT_0001" },
  { id: "ST_018", name: "보령 대천 해수욕장", lat: 36.31, lng: 126.51, beachCode: "41", obsCode: "DT_0025" },
  { id: "ST_019", name: "태안 만리포 해수욕장", lat: 36.79, lng: 126.14, beachCode: "70", obsCode: "DT_0067" },
  { id: "ST_020", name: "태안 꽃지 해수욕장", lat: 36.49, lng: 126.33, beachCode: "44", obsCode: "DT_0067" },
  { id: "ST_021", name: "부안 격포 해수욕장", lat: 35.63, lng: 126.47, beachCode: "95", obsCode: "DT_0068" },
];
