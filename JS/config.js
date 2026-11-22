//config.js — общие константы, экранирование и localStorage Здесь лежат настройки, защита от XSS (escapeHTML) и единые хелперы чтения/записи в localStorage.
export const API_KEY = '86622727'; // Ключ доступа к OMDb API

// Встроенная SVG-заглушка на случай отсутствия постера
export const FALLBACK_POSTER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#1e1633"/>
      <text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="20" text-anchor="middle" dy=".3em">Нет постера</text>
    </svg>`
  );

// Защита от XSS: экранируем спецсимволы перед вставкой в HTML
export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char];
  });
}

// Безопасное чтение JSON из localStorage
export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Безопасная запись JSON в localStorage
export function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
