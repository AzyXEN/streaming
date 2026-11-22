//reviews.js — отзывы и средний рейтинг Отвечает за отрисовку отзывов выбранного фильма, подсчёт среднего балла и добавление новых комментариев.
import { escapeHTML, readStorage, writeStorage } from './config.js';
import { getCurrentUser } from './auth.js';

const averageRatingEl = document.getElementById('average-rating');
const reviewAuthNotice = document.getElementById('review-auth-notice');
const reviewForm = document.getElementById('review-form');
const ratingSelector = document.getElementById('selector');
const reviewTextarea = document.getElementById('type-review');
const reviewList = document.getElementById('review-list');

let activeMovieId = null;

export function setActiveReviewMovie(movieId) {
  activeMovieId = movieId;
}

export function renderReviews(movieId = activeMovieId) {
  if (!movieId) return;

  const currentUser = getCurrentUser();
  if (currentUser) {
    reviewForm.classList.remove('hidden');
    reviewAuthNotice.classList.add('hidden');
  } else {
    reviewForm.classList.add('hidden');
    reviewAuthNotice.classList.remove('hidden');
  }

  const allReviews = readStorage('reviews', {});
  const movieReviews = allReviews[movieId] || [];

  if (movieReviews.length === 0) {
    averageRatingEl.textContent = 'Средний рейтинг: пока нет оценок';
    reviewList.innerHTML = '<p>Пока нет ни одного отзыва. Будьте первым!</p>';
    return;
  }

  const sum = movieReviews.reduce((acc, item) => acc + item.rating, 0);
  const avg = (sum / movieReviews.length).toFixed(1);
  averageRatingEl.textContent = `Средний рейтинг: ⭐ ${avg} / 5 (оценок: ${movieReviews.length})`;

  reviewList.innerHTML = movieReviews
    .map(
      (review) => `
      <div class="review-item">
        <div class="review-header">
          <strong>👤 ${escapeHTML(review.author)}</strong>
          <span>⭐ ${review.rating} / 5</span>
        </div>
        <p class="review-text">${escapeHTML(review.text)}</p>
        <small class="review-date">${escapeHTML(review.date)}</small>
      </div>
    `
    )
    .join('');
}

export function initReviews() {
  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser || !activeMovieId) return;

    const rating = Number(ratingSelector.value);
    const text = reviewTextarea.value.trim();
    if (!text) return;

    const allReviews = readStorage('reviews', {});
    if (!allReviews[activeMovieId]) {
      allReviews[activeMovieId] = [];
    }

    allReviews[activeMovieId].unshift({
      author: currentUser.name,
      rating,
      text,
      date: new Date().toLocaleDateString(),
    });

    writeStorage('reviews', allReviews);
    reviewForm.reset();
    renderReviews(activeMovieId);
  });
}
