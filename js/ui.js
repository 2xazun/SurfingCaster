const waveHeight = document.querySelector(".wave-height");
const TMP = document.querySelector(".TMP");
const V = document.querySelector(".V");
const Tide = document.querySelector(".Tide");
const Li = document.querySelector(".li");
const waveLevel = document.querySelector(".wave-level");

Li.addEventListener("click", dataLoad);
async function dataLoad() {
  const data = await fetchWeatherData(225);
  const dataItems = data.response.body.items.item;
  console.log(dataItems);
  //1. 수온 구해서 넣기
  const TMPValue = dataItems[0].fcstValue;
  TMP.innerHTML = TMPValue;

  //2. 풍향/풍속 구해서 넣기
  const VEC = dataItems[3].fcstValue;
  const WSDValue = dataItems[4].fcstValue;
  let VECValue;
  if (VEC >= 337.5 || VEC < 22.5) {
    VECValue = "북풍";
  } else if (VEC < 67.5) {
    VECValue = "북동풍";
  } else if (VEC < 112.5) {
    VECValue = "동풍";
  } else if (VEC < 157.5) {
    VECValue = "남동풍";
  } else if (VEC < 202.5) {
    VECValue = "남풍";
  } else if (VEC < 247.5) {
    VECValue = "남서풍";
  } else if (VEC < 292.5) {
    VECValue = "서풍";
  } else {
    VECValue = "북서풍";
  }
  V.innerHTML = `${VECValue} ${WSDValue}`;

  //3. 파고 구해서 넣기
  const WEVValue = dataItems[8].fcstValue;
  waveHeight.innerHTML = `${WEVValue}`;
  let waveLevelValue;
  if (WEVValue <= 0.5) {
    waveLevelValue = "완만함";
  } else if (WEVValue < 2) {
    waveLevelValue = "적당함";
  } else {
    waveLevelValue = "매우 높음!";
  }
  waveLevel.innerHTML = waveLevelValue;
}
