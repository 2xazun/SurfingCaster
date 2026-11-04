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
  const user_highlight = HIGHLIGHTS.filter((h) => h.user_id === userId);
  const highlight_statations = STATIONS.filter((station) => {
    for (highlight of user_highlight) {
      if (highlight.ST_ID === station.id) {
        return true;
      }
    }
  });
  let highlightTag = [];
  for (station of highlight_statations) {
    highlightTag.push(
      `<li>${station.name} <button class="delete">삭제</button></li>`,
    );
  }

  console.log(highlightTag);
  highlightList.innerHTML = highlightTag.join("");
}
