const highlightList = document.querySelector(".highlight-list");

// 더미 데이터
const HIGHLIGHTS = [
  { id: 1, ST_ID: "ST_001", user_id: 1 },
  { id: 2, ST_ID: "ST_002", user_id: 1 },
  { id: 3, ST_ID: "ST_003", user_id: 2 },
];

const userId = 1;

document.addEventListener("DOMContentLoaded", favorites);

function favorites() {
  // 유저의 하이라이트 목록
  const user_highlight = HIGHLIGHTS.filter((h) => h.user_id === userId);
  // 하이라이트들의 정보를 station에서 find
  const highlight_statations = STATIONS.filter((station) => {
    for (highlight of user_highlight) {
      if (highlight.ST_ID === station.id) {
        return true;
      }
    }
  });
  // li 태그 저장할 배열
  let highlightTag = [];
  for (station of highlight_statations) {
    highlightTag.push(
      `<li class="highlight">${station.name} <button class="delete">삭제</button></li>`,
    );
  }

  console.log(highlightTag);
  highlightList.innerHTML = highlightTag.join("");

  const highlightElement = document.querySelector(".highlight");
  highlightElement.addEventListener("click", function (e) {
    let name = e.target.innerText.trim();
    name = name.replace("삭제", "").trim();
    console.log(name);
    const findStation = STATIONS.find((station) => (station.name = name));

    // 장소 데이터 저장
    sessionStorage.setItem("selectedStation", JSON.stringify(findStation));

    // 메인 페이지로 이동
    location.href = "/index.html";

    dataLoad(findStation);
  });
}
