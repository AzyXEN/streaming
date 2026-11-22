//main.js — координатор приложения Связывает API, авторизацию, плеер, отзывы, избранное и модальное окно фильма.
import { FALLBACK_POSTER, escapeHTML, readStorage, writeStorage } from './config.js';
import { getTrendingMovies, searchMovies, getMovieDetails } from './api.js';
import { initAuth, closeAuthModal, isAuthModalOpen } from './auth.js';
import { initReviews, renderReviews, setActiveReviewMovie } from './reviews.js';
import { initPlayer, setPlayerMovie, resetPlayer } from './player.js';

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const moviesGrid = document.getElementById('movies-grid');
const trendingGrid = document.getElementById('trending-grid');
const loadingIndicator = document.getElementById('loading');
const categoryButtons = document.querySelectorAll('.category-btn');
const showFavBtn = document.getElementById('favorites-btn');
const mainContent = document.querySelector('main');

const movieOverlay = document.getElementById('movie-overlay');
const modalTitle = document.getElementById('modal-title');
const modalPlot = document.getElementById('modal-plot');
const closeModalBtn = document.getElementById('close-modal-btn');

let favorites = readStorage('favorites', []);

function isMovieOverlayOpen() {
  return !movieOverlay.classList.contains('hidden');
}

function syncBodyScroll() {
  document.body.style.overflow =
    isAuthModalOpen() || isMovieOverlayOpen() ? 'hidden' : '';
}

function createTrendingCardsHTML(movies) {
  return movies
    .map((movie) => {
      const isFavorite = favorites.some((fav) => fav.imdbID === movie.imdbID);
      const posterSrc =
        movie.Poster && movie.Poster !== 'N/A' ? escapeHTML(movie.Poster) : FALLBACK_POSTER;
      const safeTitle = escapeHTML(movie.Title);
      const safeYear = escapeHTML(movie.Year);
      const safeType = escapeHTML(movie.Type || 'movie');
      const safeId = escapeHTML(movie.imdbID);

      return `
        <div class="trending-card" data-id="${safeId}" data-title="${safeTitle}" data-year="${safeYear}" data-poster="${posterSrc}">
          <img src="${posterSrc}" alt="${safeTitle}" onerror="this.src='${FALLBACK_POSTER}'">
          <div class="trending-info">
            <div>
              <h3>${safeTitle}</h3>
              <p class="trending-meta">${safeYear} &bull; HD</p>
              <div class="trending-tags">
                <span class="tag-pill">${safeType}</span>
                <span class="tag-pill">OMDb</span>
              </div>
            </div>
            <div class="trending-actions">
              <button class="mini-btn watch" type="button">Смотреть</button>
              <button class="mini-btn more" type="button">Детали</button>
            </div>
          </div>
          <button class="fav-btn ${isFavorite ? 'active' : ''}" type="button" aria-label="Добавить в избранное">❤️</button>
        </div>
      `;
    })
    .join('');
}

function createMovieCardsHTML(movies) {
  return movies
    .map((movie) => {
      const isFavorite = favorites.some((fav) => fav.imdbID === movie.imdbID);
      const posterSrc =
        movie.Poster && movie.Poster !== 'N/A' ? escapeHTML(movie.Poster) : FALLBACK_POSTER;
      const safeTitle = escapeHTML(movie.Title);
      const safeYear = escapeHTML(movie.Year);
      const safeId = escapeHTML(movie.imdbID);

      return `
        <div class="movie-card" data-id="${safeId}" data-title="${safeTitle}" data-year="${safeYear}" data-poster="${posterSrc}">
          <img src="${posterSrc}" alt="${safeTitle}" onerror="this.src='${FALLBACK_POSTER}'">
          <h3>${safeTitle}</h3>
          <p>${safeYear}</p>
          <button class="fav-btn ${isFavorite ? 'active' : ''}" type="button" aria-label="Добавить в избранное">❤️</button>
        </div>
      `;
    })
    .join('');
}

function renderMovies(movies) {
  moviesGrid.innerHTML = createMovieCardsHTML(movies);
}

function toggleFavorite(movieData) {
  const index = favorites.findIndex((fav) => fav.imdbID === movieData.imdbID);
  const isNowFavorite = index === -1;

  if (isNowFavorite) {
    favorites.push(movieData);
  } else {
    favorites.splice(index, 1);
  }

  writeStorage('favorites', favorites);

  document.querySelectorAll(`[data-id="${movieData.imdbID}"] .fav-btn`).forEach((btn) => {
    btn.classList.toggle('active', isNowFavorite);
  });
}

function openMovieModal(movie) {
  modalTitle.textContent = `${movie.Title} (${movie.Year})`;
  modalPlot.textContent =
    movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'Описание отсутствует.';
  setPlayerMovie(movie);
  setActiveReviewMovie(movie.imdbID);
  renderReviews(movie.imdbID);

  movieOverlay.classList.remove('hidden');
  syncBodyScroll();
}

function closeMovieModal() {
  movieOverlay.classList.add('hidden');
  resetPlayer();
  setActiveReviewMovie(null);
  syncBodyScroll();
}

async function loadTrending() {
  if (!trendingGrid) return;
  try {
    const data = await getTrendingMovies('marvel');
    if (data.Response === 'True') {
      trendingGrid.innerHTML = createTrendingCardsHTML(data.Search);
    }
  } catch (error) {
    console.error('Ошибка при загрузке трендов:', error);
    trendingGrid.innerHTML = '<p>Не удалось загрузить популярные фильмы.</p>';
  }
}

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  loadingIndicator.classList.remove('hidden');
  moviesGrid.innerHTML = '';

  try {
    const data = await searchMovies(query);
    if (data.Response === 'True') {
      renderMovies(data.Search);
    } else {
      moviesGrid.innerHTML =
        '<p>Ничего не найдено. Попробуйте другой запрос (на английском).</p>';
    }
  } catch (error) {
    console.error('Ошибка поиска:', error);
    moviesGrid.innerHTML =
      '<p>Ошибка загрузки данных. Проверьте подключение к интернету.</p>';
  } finally {
    loadingIndicator.classList.add('hidden');
  }
}

async function handleOpenDetails(imdbID) {
  loadingIndicator.classList.remove('hidden');
  try {
    const movie = await getMovieDetails(imdbID);
    if (movie.Response === 'True') {
      openMovieModal(movie);
    }
  } catch (error) {
    console.error('Ошибка загрузки деталей фильма:', error);
    alert('Не удалось загрузить информацию о фильме.');
  } finally {
    loadingIndicator.classList.add('hidden');
  }
}

// Инициализация модулей
initPlayer();
initReviews();
initAuth(syncBodyScroll, () => {
  if (isMovieOverlayOpen()) {
    renderReviews();
  }
});

// Обработчики событий
categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    categoryButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    searchInput.value = button.getAttribute('data-genre');
    handleSearch();
  });
});

mainContent.addEventListener('click', (event) => {
  const favButton = event.target.closest('.fav-btn');
  const card = event.target.closest('.movie-card, .trending-card');

  if (favButton && card) {
    event.stopPropagation();
    toggleFavorite({
      imdbID: card.dataset.id,
      Title: card.dataset.title,
      Year: card.dataset.year,
      Poster: card.dataset.poster,
    });
    favButton.style.transform = 'scale(1.25)';
    setTimeout(() => (favButton.style.transform = ''), 200);
    return;
  }

  if (card) {
    handleOpenDetails(card.dataset.id);
  }
});

closeModalBtn.addEventListener('click', closeMovieModal);
movieOverlay.addEventListener('click', (event) => {
  if (event.target === movieOverlay) closeMovieModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (isAuthModalOpen()) closeAuthModal(syncBodyScroll);
    if (isMovieOverlayOpen()) closeMovieModal();
  }
});

searchBtn.addEventListener('click', () => {
  categoryButtons.forEach((btn) => btn.classList.remove('active'));
  handleSearch();
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    categoryButtons.forEach((btn) => btn.classList.remove('active'));
    handleSearch();
  }
});

showFavBtn.addEventListener('click', () => {
  categoryButtons.forEach((btn) => btn.classList.remove('active'));
  if (favorites.length === 0) {
    moviesGrid.innerHTML = '<p>Список избранного пуст</p>';
  } else {
    renderMovies(favorites);
  }
});

loadTrending();
