const search = document.querySelector(".search");
let timer;
search.addEventListener("input", () => {
  if (timer) {
    clearTimeout(timer);
    timer = setTimeout(searching, 300);
  } else {
    timer = setTimeout(searching, 300);
  }
});

function searching() {
  const search_list = document.querySelector(".search-list");
  if (!search.value) {
    search_list.className += " hidden";
  } else {
    let recommends = STATIONS.filter((station) => {
      return station.name.includes(search.value);
    });
    if (recommends.length !== 0) {
      let recommends_search = recommends.map((recommend) => {
        return `<div class="search-results">⌕&nbsp;&nbsp;${recommend.name}</div>`;
      });

      search_list.innerHTML = recommends_search.join("");
      search_list.classList.remove("hidden");
    }
  }
}
