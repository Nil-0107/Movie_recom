# 🎬 Movie Recommender

A full-stack movie recommendation web app powered by **TF-IDF content-based filtering** and the **TMDB API**. Users can browse trending/popular movies, search by keyword, view movie details, and get personalized recommendations based on content similarity and genre.

---

## 🖼️ Architecture

```
┌──────────────────────┐        HTTP        ┌──────────────────────┐
│  Streamlit Frontend  │ ◄────────────────► │  FastAPI Backend     │
│  (APP.py)            │                    │  (main.py)           │
└──────────────────────┘                    └──────────┬───────────┘
                                                       │
                                          ┌────────────┴────────────┐
                                          │                         │
                                   ┌──────▼──────┐         ┌───────▼───────┐
                                   │  Local TF-IDF│         │  TMDB API     │
                                   │  Model (.pkl)│         │  (posters,    │
                                   └─────────────┘         │   metadata)   │
                                                           └───────────────┘
```

---

## ✨ Features

- **Home Feed** – Browse Trending, Popular, Top Rated, Now Playing, and Upcoming movies.
- **Keyword Search** – Search for any movie with live dropdown suggestions.
- **Movie Details** – View title, release date, genres, overview, backdrop image, and poster.
- **TF-IDF Recommendations** – Content-based similar movies using cosine similarity on a pre-trained TF-IDF matrix.
- **Genre Recommendations** – TMDB Discover API results filtered by the movie's primary genre.

---

## 🗂️ Project Structure

```
Movie_recom/
├── main.py               # FastAPI backend (REST API)
├── APP.py                # Streamlit frontend
├── Movies1.ipynb         # Data preprocessing & model training notebook
├── movies_metadata.csv   # Movie dataset (source data)
├── df.pkl                # Processed movie DataFrame
├── indices.pkl           # Title → index mapping
├── tfidf.pkl             # Fitted TF-IDF vectorizer
├── tfidf_matrix.pkl      # Pre-computed TF-IDF matrix (sparse)
├── requirements.txt      # Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- A free [TMDB API key](https://www.themoviedb.org/settings/api)

### 1. Clone the repository

```bash
git clone https://github.com/Nil-0107/Movie_recom.git
cd Movie_recom
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
TMDB_API_KEY=your_tmdb_api_key_here
```

### 4. Run the FastAPI backend

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### 5. Run the Streamlit frontend

In a separate terminal:

```bash
streamlit run APP.py
```

The app will open at `http://localhost:8501`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/home` | Home feed (trending / popular / top_rated / now_playing / upcoming) |
| `GET` | `/tmdb/search` | Keyword search – returns raw TMDB results |
| `GET` | `/movie/id/{tmdb_id}` | Movie details by TMDB ID |
| `GET` | `/recommend/genre` | Genre-based recommendations by TMDB ID |
| `GET` | `/recommend/tfidf` | TF-IDF recommendations by movie title |
| `GET` | `/movie/search` | Bundle: details + TF-IDF recs + genre recs |

### Example requests

```bash
# Home feed – trending
curl "http://localhost:8000/home?category=trending&limit=10"

# Search for a movie
curl "http://localhost:8000/tmdb/search?query=inception"

# Movie details
curl "http://localhost:8000/movie/id/27205"

# TF-IDF recommendations
curl "http://localhost:8000/recommend/tfidf?title=Inception&top_n=5"

# Full bundle (details + both rec types)
curl "http://localhost:8000/movie/search?query=Inception&tfidf_top_n=10&genre_limit=10"
```

---

## 🧠 How Recommendations Work

### TF-IDF Content-Based Filtering

1. Movie metadata (titles, overviews, genres, etc.) from `movies_metadata.csv` is pre-processed in `Movies1.ipynb`.
2. A **TF-IDF matrix** is computed and saved as `tfidf_matrix.pkl`.
3. At query time, the cosine similarity between the query movie's TF-IDF vector and all other movie vectors is computed.
4. The top-N most similar movies are returned.

### Genre-Based Filtering

- Uses the TMDB `/discover/movie` endpoint filtered by the movie's primary genre ID.
- Results are sorted by popularity descending.

---

## ☁️ Deployment

The backend is deployed on [Render](https://render.com).  
The Streamlit frontend connects to `https://movie-rec-466x.onrender.com` by default.

To point the frontend at your own backend, update `API_BASE` in `APP.py`:

```python
API_BASE = "http://your-backend-url"
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `fastapi` | Backend REST API framework |
| `uvicorn` | ASGI server for FastAPI |
| `streamlit` | Interactive web frontend |
| `httpx` | Async HTTP client (TMDB requests) |
| `pandas` | DataFrame handling |
| `numpy` | Numerical computations |
| `scipy` | Sparse matrix operations |
| `scikit-learn` | TF-IDF vectorizer |
| `python-dotenv` | Environment variable management |

---

## 📄 License

This project is open-source. Feel free to fork, modify, and use it for your own projects.
