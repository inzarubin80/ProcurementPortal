import { Middleware } from '@reduxjs/toolkit';

const USER_STATE_KEY = 'userState';

export const localStorageMiddleware: Middleware = store => next => action => {
  const result = next(action);
  const state = store.getState();
  // Сохраняем только userSlice (или нужные поля)
  localStorage.setItem(USER_STATE_KEY, JSON.stringify(state.user));
  return result;
};

export const loadUserState = () => {
  try {
    const serializedState = localStorage.getItem(USER_STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    return undefined;
  }
}; 