const API_BASE = "";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const contentArea = document.getElementById('content-area');
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('search-suggestions');

let debounceTimer;

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    goHome();

    // Search Input Listener
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 2) {
            suggestionsBox.classList.add('hidden');
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            suggestionsBox.classList.add('hidden');
        }
    });

    // Enter key to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                suggestionsBox.classList.add('hidden');
                showSearchResults(query);
            }
        }
    });
});

async function apiGet(endpoint, params = {}) {
    const url = new URL(API_BASE + endpoint, window.location.origin);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("API Error:", err);
        return null;
    }
}

function goHome() {
    searchInput.value = '';
    suggestionsBox.classList.add('hidden');
    renderHome();
}

async function renderHome() {
    contentArea.innerHTML = '<div class="text-center">Loading...</div>';

    // Add category selector
    const headerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2>🏠 Home Feed</h2>
            <select id="home-category" class="category-select" onchange="updateHomeFeed(this.value)">
                <option value="popular">Popular</option>
                <option value="trending">Trending</option>
                <option value="top_rated">Top Rated</option>
                <option value="now_playing">Now Playing</option>
                <option value="upcoming">Upcoming</option>
            </select>
        </div>
        <div id="home-grid"></div>
    `;
    contentArea.innerHTML = headerHTML;

    updateHomeFeed('popular');
}

async function updateHomeFeed(category) {
    const grid = document.getElementById('home-grid');
    grid.innerHTML = 'Loading...';

    const data = await apiGet('/home', { category: category, limit: 24 });

    if (data) {
        grid.innerHTML = createGridHTML(data);
    } else {
        grid.innerHTML = '<p>Failed to load movies.</p>';
    }
}

async function fetchSuggestions(query) {
    const data = await apiGet('/tmdb/search', { query: query, page: 1 });
    if (!data || !data.results) return;

    const results = data.results.slice(0, 8);
    if (results.length === 0) {
        suggestionsBox.classList.add('hidden');
        return;
    }

    const html = results.map(m => {
        const year = m.release_date ? m.release_date.split('-')[0] : '';
        return `
            <div class="suggestion-item" onclick="loadDetails(${m.id})">
                <strong>${m.title}</strong> <span style="color:#888">(${year})</span>
            </div>
        `;
    }).join('');

    suggestionsBox.innerHTML = html;
    suggestionsBox.classList.remove('hidden');
}

async function showSearchResults(query) {
    contentArea.innerHTML = `<h2>🔎 Results for "${query}"</h2><div id="results-grid">Loading...</div>`;

    const data = await apiGet('/tmdb/search', { query: query, page: 1 });
    const grid = document.getElementById('results-grid');

    if (data && data.results) {
        // Map TMDB raw results to our card format
        const cards = data.results.map(m => ({
            tmdb_id: m.id,
            title: m.title,
            poster_url: m.poster_path ? TMDB_IMG + m.poster_path : null,
            release_date: m.release_date
        }));
        grid.innerHTML = createGridHTML(cards);
    } else {
        grid.innerHTML = '<p>No results found.</p>';
    }
}

async function loadDetails(tmdbId) {
    suggestionsBox.classList.add('hidden');
    contentArea.innerHTML = '<div class="text-center">Loading details...</div>';

    // 1. Get Details
    const details = await apiGet(`/movie/id/${tmdbId}`);
    if (!details) {
        contentArea.innerHTML = '<p class="error">Could not load movie details.</p>';
        return;
    }

    // 2. Render Details Top Section
    renderDetailsView(details);

    // 3. Fetch Recommendations
    fetchRecommendations(details);
}

function renderDetailsView(movie) {
    const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : '-';
    const poster = movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';

    const html = `
        <div class="details-container">
            <div class="poster-wrapper">
                <img src="${poster}" alt="${movie.title}">
            </div>
            <div class="info-wrapper">
                <h1>${movie.title}</h1>
                <div class="movie-meta-tags">
                    <span>📅 ${movie.release_date || '-'}</span>
                    <span>🎭 ${genres}</span>
                </div>
                <h3>Overview</h3>
                <p class="overview">${movie.overview || 'No overview available.'}</p>

                ${movie.backdrop_url ? `<img src="${movie.backdrop_url}" class="backdrop-img" alt="Backdrop">` : ''}
            </div>
        </div>

        <div id="recommendations-area">
            <p>Loading recommendations...</p>
        </div>
    `;

    contentArea.innerHTML = html;
}

async function fetchRecommendations(details) {
    const recArea = document.getElementById('recommendations-area');

    // Try bundle search first (TF-IDF + Genre)
    const bundle = await apiGet('/movie/search', {
        query: details.title,
        tfidf_top_n: 12,
        genre_limit: 12
    });

    let html = '';

    if (bundle) {
        // TF-IDF
        if (bundle.tfidf_recommendations && bundle.tfidf_recommendations.length > 0) {
            const cards = bundle.tfidf_recommendations.map(item => {
                // If we have TMDB info attached
                if (item.tmdb) return item.tmdb;
                // Fallback (shouldn't happen often if backend logic is good)
                return { tmdb_id: null, title: item.title, poster_url: null };
            }).filter(c => c.tmdb_id); // Filter out ones without ID

            if (cards.length > 0) {
                html += `<h3 class="section-title">🔎 Similar Movies (Content Match)</h3>`;
                html += createGridHTML(cards);
            }
        }

        // Genre
        if (bundle.genre_recommendations && bundle.genre_recommendations.length > 0) {
            html += `<h3 class="section-title">🎭 More Like This (Genre)</h3>`;
            html += createGridHTML(bundle.genre_recommendations);
        }
    }

    // Fallback if bundle failed or empty
    if (html === '') {
         const genreRecs = await apiGet('/recommend/genre', { tmdb_id: details.tmdb_id, limit: 12 });
         if (genreRecs && genreRecs.length > 0) {
             html += `<h3 class="section-title">🎭 More Like This (Genre)</h3>`;
             html += createGridHTML(genreRecs);
         } else {
             html = '<p>No recommendations available.</p>';
         }
    }

    recArea.innerHTML = html;
}

function createGridHTML(cards) {
    if (!cards || cards.length === 0) return '<p>No movies to show.</p>';

    const gridItems = cards.map(card => {
        const poster = card.poster_url || 'https://via.placeholder.com/200x300?text=No+Image';
        return `
            <div class="card" onclick="loadDetails(${card.tmdb_id})">
                <img src="${poster}" loading="lazy" alt="${card.title}">
                <div class="card-content">
                    <div class="card-title" title="${card.title}">${card.title}</div>
                    <div class="card-meta">${card.release_date ? card.release_date.split('-')[0] : ''}</div>
                </div>
            </div>
        `;
    }).join('');

    return `<div class="movie-grid">${gridItems}</div>`;
}
