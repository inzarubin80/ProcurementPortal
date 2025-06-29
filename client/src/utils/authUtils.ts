// Утилиты для работы с авторизацией

export const getStoredToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getStoredUserID = (): number | null => {
  const userID = localStorage.getItem('userID');
  return userID ? Number(userID) : null;
};

export const isTokenValid = (): boolean => {
  const token = getStoredToken();
  const userID = getStoredUserID();
  return !!(token && userID);
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userID');
};

export const setStoredAuth = (token: string, userID: number): void => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('userID', String(userID));
}; 