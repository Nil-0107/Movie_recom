const API = "";
const content = document.getElementById("content");
const searchInput = document.getElementById("searchInput");
const navButtons = document.querySelectorAll("nav button");

let currentTab = "discover";

navButtons.forEach(btn => {
  btn.onclick = () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentTab = btn.dataset.tab;
    loadTab();
  };
});

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") searchMovies(searchInput.value);
});

async function searchMovies(q) {
  const res = await fetch(`${API}/recommend?query=${encodeURIComponent(q)}`);
  const movies = await res.json();
  renderMovies(movies);
}

async function loadTab() {
  if (currentTab === "discover") {
    content.innerHTML = "<p style='color:#94a3b8'>Search to discover movies.</p>";
  }
  if (currentTab === "watchlist") {
    const r = await fetch(`${API}/watchlist`);
    renderMovies(await r.json());
  }
  if (currentTab === "favorites") {
    const r = await fetch(`${API}/favorites`);
    renderMovies(await r.json());
  }
}

function renderMovies(movies) {
  content.innerHTML = "";
  movies.forEach(m => content.appendChild(movieCard(m)));
}

function movieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  card.innerHTML = `
    <img src="${movie.poster_url || ""}" />
    <div class="movie-info">
      <h3>${movie.title}</h3>
      <div class="stars">
        ${[1,2,3,4,5].map(i => `<span data-i="${i}">★</span>`).join("")}
      </div>
      <div class="actions">
        <button class="fav">❤ Favorite</button>
        <button class="watch">＋ Watchlist</button>
      </div>
    </div>
  `;

  const stars = card.querySelectorAll(".stars span");
  stars.forEach(star => {
    star.onclick = () => {
      stars.forEach(s => s.classList.remove("active"));
      for (let i = 0; i < star.dataset.i; i++) {
        stars[i].classList.add("active");
      }
      fetch(`${API}/rate`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({tmdb_id: movie.tmdb_id, rating: star.dataset.i})
      });
    };
  });

  card.querySelector(".fav").onclick = () => {
    fetch(`${API}/favorites/add`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(movie)
    });
  };

  card.querySelector(".watch").onclick = () => {
    fetch(`${API}/watchlist/add`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(movie)
    });
  };

  return card;
}

loadTab();
