// 파고에 따라 바다 카드 테마(배경색)와 파도 애니메이션(높이/색/속도)을 바꿈
//   calm  : 0.5m 이하  -> 민트, 느린 파도
//   good  : 0.5m ~ 2m  -> 파랑, 보통 파도
//   rough : 2m 이상     -> 산호색, 빠르고 높은 파도
const SEA_THEMES = {
  calm: {
    height: "90px",
    colors: ["#bff0e1", "#9fe3cf", "#7fd3bb"],
    durations: ["12s", "10s", "8s"],
  },
  good: {
    height: "130px",
    colors: ["#bfe3f7", "#8ccbee", "#4fa8dc"],
    durations: ["8s", "6s", "4s"],
  },
  rough: {
    height: "150px",
    colors: ["#ffd0c2", "#ffad96", "#ff7a5c"],
    durations: ["4s", "2.5s", "1.5s"],
  },
};

function seaLevelOf(waveHeight) {
  if (waveHeight <= 0.5) return "calm";
  if (waveHeight < 2.0) return "good";
  return "rough";
}

// body[data-sea] 를 바꾸면 theme.css 의 색 변수가 바뀜
function setSeaTheme(level) {
  document.body.dataset.sea = level;
}

function updateWave(waveHeight) {
  const level = seaLevelOf(waveHeight);
  setSeaTheme(level);

  const wave = document.querySelector(".wave");
  if (!wave) return;

  // <object>로 불러온 SVG가 아직 로딩 전이면 로딩이 끝난 뒤에 다시 적용
  const svgElement = wave.contentDocument?.querySelector("svg");
  if (!svgElement) {
    wave.addEventListener("load", () => updateWave(waveHeight), { once: true });
    return;
  }

  const theme = SEA_THEMES[level];
  wave.style.height = theme.height;
  theme.colors.forEach((color, i) => {
    svgElement.style.setProperty(`--wave-color-${i + 1}`, color);
  });
  // SVG <animate> 의 dur 를 직접 바꿔서 파도 속도 조절
  svgElement.querySelectorAll("animate").forEach((animate, i) => {
    animate.setAttribute("dur", theme.durations[i] || theme.durations[0]);
  });
}
