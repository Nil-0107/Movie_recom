# Movie Recommender System

A full-stack movie recommendation application that combines content-based filtering (TF-IDF) with genre-based discovery. This is my first project! The system features a **FastAPI** backend for serving recommendations and movie data, and a **Streamlit** frontend for an interactive user experience.

## Features

- **Search Movies**: Find movies by title using the TMDB database.
- **Movie Details**: View comprehensive details including posters, backdrops, overviews, release dates, and genres.
- **Content-Based Recommendations**: tailored recommendations based on text similarity (plot overviews, genres, and taglines) using TF-IDF and Cosine Similarity.
- **Genre-Based Discovery**: Explore popular movies within specific genres.
- **Home Feed**: Browse Trending, Popular, Top Rated, Now Playing, and Upcoming movies.

## Tech Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/)
- **Frontend**: [Streamlit](https://streamlit.io/)
- **Data Analysis**: [Pandas](https://pandas.pydata.org/), [Scikit-learn](https://scikit-learn.org/), [Numpy](https://numpy.org/)
- **External API**: [The Movie Database (TMDB)](https://www.themoviedb.org/)

## Project Structure

- `APP.py`: FastAPI backend application.
- `main.py`: Streamlit frontend application.
- `Movies1.ipynb`: Jupyter notebook used for data preprocessing and generating the model files.
- `movies_metadata.csv`: Raw dataset used for training.
- `*.pkl`: Pre-computed pickle files (`df.pkl`, `indices.pkl`, `tfidf_matrix.pkl`, `tfidf.pkl`) used for the recommendation logic.
- `requirements.txt`: Python dependencies.

## Prerequisites

- Python 3.8+
- A TMDB API Key. You can get one by registering at [The Movie Database](https://www.themoviedb.org/documentation/api).

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the root directory and add your TMDB API Key:

    ```env
    TMDB_API_KEY=your_tmdb_api_key_here
    ```

    > **Note:** The backend requires this key to fetch movie images and real-time data.

## Running the Application

To run the full application, you need to start both the backend server and the frontend interface.

### 1. Start the Backend (FastAPI)

Run the following command to start the API server:

```bash
uvicorn APP:app --reload
```

The API will be available at `http://127.0.0.1:8000`. You can view the API documentation at `http://127.0.0.1:8000/docs`.

### 2. Start the Frontend (Streamlit)

**Important Configuration Step:**
By default, `main.py` is configured to connect to a deployed backend. To connect to your local backend, you must open `main.py` and modify the `API_BASE` variable:

```python
# In main.py
# Change this:
API_BASE = "https://movie-rec-466x.onrender.com" or "http://127.0.0.1:8000"

# To this (for local use):
API_BASE = "http://127.0.0.1:8000"
```

Then, run the Streamlit app in a new terminal window:

```bash
streamlit run main.py
```

The frontend will open in your default browser at `http://localhost:8501`.

## How it Works

1.  **Data Preprocessing**: The `Movies1.ipynb` notebook processes the `movies_metadata.csv` dataset. It combines movie overviews, genres, and taglines into a single "tags" text field.
2.  **TF-IDF Vectorization**: A TF-IDF Matrix is generated from the tags, representing the textual features of each movie.
3.  **Recommendation Engine**:
    - When a user selects a movie, the backend calculates the Cosine Similarity between the selected movie's vector and all other movies in the dataset.
    - It returns the top movies with the highest similarity scores.
    - It also fetches additional popular movies from the same genre using the TMDB API.
