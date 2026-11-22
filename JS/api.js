//api.js — запросы к OMDb API Отвечает только за сетевые запросы и проверку ответа сервера.
import { API_KEY } from './config.js';

// Загрузка подборки трендов
export async function getTrendingMovies(query = 'marvel') {
  const response = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error('Ошибка сети при загрузке трендов');
  return response.json();
}

// Поиск фильмов по названию или жанру
export async function searchMovies(query) {
  const response = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error('Ошибка сети при поиске');
  return response.json();
}

// Запрос детальной информации о фильме по imdbID
export async function getMovieDetails(imdbID) {
  const response = await fetch(
    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}`
  );
  if (!response.ok) throw new Error('Ошибка сети при загрузке деталей фильма');
  return response.json();
}
