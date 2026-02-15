const API_URL = 'https://api.themoviedb.org/3/movie/now_playing';
const API_KEY = '95d6f23fb8447d9a28ef0f1e71e1ab0c';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

const movieGrid = document.getElementById('movieGrid');
const loadingEl = document.getElementById('loading');

async function fetchMovies() {
    try {
        const res = await fetch(`${API_URL}?api_key=${API_KEY}&language=ko-KR`);
        const data = await res.json();
        if (data.results) {
            renderMovies(data.results);
        } else {
            movieGrid.innerHTML = '<p class="error">영화 목록을 불러올 수 없습니다.</p>';
        }
    } catch (err) {
        movieGrid.innerHTML = '<p class="error">API 연결에 실패했습니다. CORS 설정을 확인해 주세요.</p>';
        console.error(err);
    } finally {
        loadingEl.style.display = 'none';
    }
}

function renderMovies(movies) {
    movieGrid.innerHTML = movies.map(movie => `
        <article class="movie-card">
            <div class="poster-wrap">
                <img 
                    src="${movie.poster_path ? POSTER_BASE + movie.poster_path : 'https://via.placeholder.com/200x300/333/999?text=No+Image'}" 
                    alt="${movie.title}"
                    class="poster"
                    loading="lazy"
                >
            </div>
            <h3 class="movie-title">${movie.title}</h3>
            <p class="release-date">${movie.release_date ? movie.release_date.replace(/-/g, '.') : '-'}</p>
        </article>
    `).join('');
}

fetchMovies();
