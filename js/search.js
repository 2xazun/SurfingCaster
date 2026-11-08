// 디바운싱 검색: 타이핑이 끝나고 0.3초 뒤에 한 번만 검색 실행
const search = document.querySelector(".search");
const searchList = document.querySelector(".search-list");
const SEARCH_DELAY = 300;
let searchTimer = null;

// 검색창이 있는 페이지(index)에서만 동작
if (search && searchList) {
  search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(searching, SEARCH_DELAY);
  });

  // 엔터 -> 첫 번째 결과 선택
  search.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    clearTimeout(searchTimer);
    const first = findStations(search.value)[0];
    if (first) selectStation(first);
  });

  // 결과 클릭 -> 해당 장소 보기 (이벤트 위임)
  searchList.addEventListener("click", (e) => {
    const item = e.target.closest(".search-results");
    if (!item) return;
    const station = STATIONS.find((s) => s.id === item.dataset.id);
    if (station) selectStation(station);
  });

  // 검색창 밖을 클릭하면 결과 닫기
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) hideSearchList();
  });
}

function findStations(keyword) {
  const word = keyword.trim().replace(/\s/g, "");
  if (!word) return [];
  return STATIONS.filter((station) => station.name.replace(/\s/g, "").includes(word));
}

function searching() {
  const keyword = search.value.trim();
  if (!keyword) {
    hideSearchList();
    return;
  }

  const recommends = findStations(keyword);
  if (recommends.length === 0) {
    searchList.innerHTML = `<div class="search-results search-empty">검색 결과가 없어요.</div>`;
  } else {
    searchList.innerHTML = recommends
      .map(
        (station) =>
          `<div class="search-results" data-id="${station.id}">⌕&nbsp;&nbsp;${station.name}</div>`,
      )
      .join("");
  }
  searchList.classList.remove("hidden");
}

function hideSearchList() {
  searchList.classList.add("hidden");
}

function selectStation(station) {
  search.value = station.name;
  hideSearchList();
  focusStation(station);
  dataLoad(station);
}
