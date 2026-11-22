//auth.js — авторизация, регистрация и шапка Инкапсулирует работу формы входа/регистрации, сессию текущего пользователя и синхронизацию отзывов при смене статуса.
import { readStorage, writeStorage } from './config.js';

const loginBtn = document.getElementById('login-btn');
const loggedBlock = document.querySelector('.logged');
const exitBtn = document.getElementById('exit-btn');
const userNameEl = document.getElementById('user-name');
const authOverlay = document.getElementById('auth-overlay');
const closeAuthBtn = document.getElementById('close-auth-btn');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const regFields = document.getElementById('reg-fields');
const regConfirmField = document.getElementById('reg-confirm-field');
const regNameInput = document.getElementById('reg-name');
const authEmailInput = document.getElementById('auth-email');
const authPassInput = document.getElementById('auth-pass');
const regPassConfirmInput = document.getElementById('reg-pass-confirm');
const authError = document.getElementById('auth-error');
const sendFormBtn = document.getElementById('send-form');
const helperLink = document.getElementById('helper');

let isRegistration = false;
let onAuthChangeCallback = null;

export function getCurrentUser() {
  return readStorage('currentUser', null);
}

export function isAuthModalOpen() {
  return !authOverlay.classList.contains('hidden');
}

export function setAuthMode(registrationMode) {
  isRegistration = registrationMode;
  authError.textContent = '';
  authForm.reset();

  if (isRegistration) {
    regFields.classList.remove('hidden');
    regConfirmField.classList.remove('hidden');
    regNameInput.required = true;
    regPassConfirmInput.required = true;
    authTitle.textContent = 'Регистрация';
    sendFormBtn.textContent = 'Зарегистрироваться';
    helperLink.textContent = 'Уже есть аккаунт? Войти';
  } else {
    regFields.classList.add('hidden');
    regConfirmField.classList.add('hidden');
    regNameInput.required = false;
    regPassConfirmInput.required = false;
    authTitle.textContent = 'Вход';
    sendFormBtn.textContent = 'Войти';
    helperLink.textContent = 'Нет аккаунта? Зарегистрироваться!';
  }
}

export function openAuthModal() {
  setAuthMode(false);
  authOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

export function closeAuthModal(onAfterClose) {
  authOverlay.classList.add('hidden');
  authError.textContent = '';
  if (typeof onAfterClose === 'function') {
    onAfterClose();
  }
}

export function updateHeader() {
  const currentUser = getCurrentUser();

  if (currentUser) {
    loginBtn.classList.add('hidden');
    loggedBlock.classList.remove('hidden');
    userNameEl.textContent = `👤 ${currentUser.name}`;
  } else {
    loginBtn.classList.remove('hidden');
    loggedBlock.classList.add('hidden');
    userNameEl.textContent = '';
  }
}

export function initAuth(onAfterClose, onAuthChange) {
  onAuthChangeCallback = onAuthChange;

  helperLink.addEventListener('click', () => setAuthMode(!isRegistration));
  loginBtn.addEventListener('click', openAuthModal);
  closeAuthBtn.addEventListener('click', () => closeAuthModal(onAfterClose));

  authOverlay.addEventListener('click', (event) => {
    if (event.target === authOverlay) {
      closeAuthModal(onAfterClose);
    }
  });

  authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    authError.textContent = '';

    const name = regNameInput.value.trim();
    const email = authEmailInput.value.trim().toLowerCase();
    const password = authPassInput.value;
    const passwordConfirm = regPassConfirmInput.value;
    const users = readStorage('users', []);

    if (isRegistration) {
      if (!name) {
        authError.textContent = 'Введите ваше имя';
        return;
      }
      if (password.length < 4) {
        authError.textContent = 'Пароль должен содержать минимум 4 символа';
        return;
      }
      if (password !== passwordConfirm) {
        authError.textContent = 'Пароли не совпадают';
        return;
      }
      if (users.some((user) => user.email === email)) {
        authError.textContent = 'Этот email уже зарегистрирован';
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      writeStorage('users', users);
      writeStorage('currentUser', newUser);

      closeAuthModal(onAfterClose);
      updateHeader();
      if (onAuthChangeCallback) onAuthChangeCallback();
    } else {
      const foundUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (foundUser) {
        writeStorage('currentUser', foundUser);
        closeAuthModal(onAfterClose);
        updateHeader();
        if (onAuthChangeCallback) onAuthChangeCallback();
      } else {
        authError.textContent = 'Неверный email или пароль';
      }
    }
  });

  exitBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    updateHeader();
    if (onAuthChangeCallback) onAuthChangeCallback();
  });

  updateHeader();
}
