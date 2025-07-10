// Утилиты для работы с авторизацией

const TOKEN_KEY = 'accessToken';
const USER_ID_KEY = 'userID';

export function setStoredAuth(token: string, userID: number) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, userID.toString());
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUserID(): number | null {
  const id = localStorage.getItem(USER_ID_KEY);
  return id ? Number(id) : null;
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

export function isTokenValid(): boolean {
  // Можно добавить свою логику проверки токена (например, по exp)
  return !!getStoredToken();
}

// Функция для получения сохраненных данных пользователя
export function getStoredUserData(): { token: string | null; userID: number | null } {
  return {
    token: getStoredToken(),
    userID: getStoredUserID(),
  };
}

// Функция для проверки наличия сохраненных данных пользователя
export function hasStoredUserData(): boolean {
  const { token, userID } = getStoredUserData();
  return !!(token && userID);
} 