//player.js — видеоплеер Управляет воспроизведением, перемоткой, звуком, таймером и полноэкранным режимом.
const playerContainer = document.querySelector('.player-container');
const playerHeader = document.querySelector('.player-header');
const video = document.getElementById('movie-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const timeDisplay = document.getElementById('time-display');
const muteBtn = document.getElementById('mute-btn');
const volumeBar = document.getElementById('volume-bar');
const fullscreenBtn = document.getElementById('fullscreen-btn');

function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function setPlayerMovie(movieData) {
  if (movieData.Title && playerHeader) {
    playerHeader.textContent = `Смотреть: ${movieData.Title}`;
  }
  video.poster = movieData.Poster && movieData.Poster !== 'N/A' ? movieData.Poster : '';
}

export function resetPlayer() {
  video.pause();
  video.currentTime = 0;
  progressBar.value = 0;
  playPauseBtn.textContent = '▶';
}

export function initPlayer() {
  function togglePlay() {
    if (video.paused) {
      video.play().catch(() => {});
      playPauseBtn.textContent = '⏸';
    } else {
      video.pause();
      playPauseBtn.textContent = '▶';
    }
  }

  playPauseBtn.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);
  video.addEventListener('ended', () => {
    playPauseBtn.textContent = '▶';
  });

  video.addEventListener('timeupdate', () => {
    if (video.duration) {
      progressBar.value = (video.currentTime / video.duration) * 100;
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    }
  });

  video.addEventListener('loadedmetadata', () => {
    timeDisplay.textContent = `00:00 / ${formatTime(video.duration)}`;
  });

  progressBar.addEventListener('input', () => {
    if (video.duration) {
      video.currentTime = (progressBar.value / 100) * video.duration;
    }
  });

  volumeBar.addEventListener('input', () => {
    video.volume = volumeBar.value;
    video.muted = volumeBar.value === '0';
    muteBtn.textContent = video.muted ? '🔇' : '🔊';
  });

  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    if (video.muted) {
      muteBtn.textContent = '🔇';
      volumeBar.value = 0;
    } else {
      muteBtn.textContent = '🔊';
      volumeBar.value = video.volume || 1;
    }
  });

  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
}
