import { configureStore } from '@reduxjs/toolkit';
import exerciseReducer from './slices/exerciseSlice';
import languageReducer from './slices/languageSlice';
import categoryReducer from './slices/categorySlice';
import userReducer from './slices/userSlice';
import authProviderReducer from './slices/authProviderSlice';
import userStatsReducer from './slices/userStatsSlice';
import userExerciseReducer from './slices/userExerciseSlice';
import difficultyReducer from './slices/difficultySlice';
import { localStorageMiddleware, loadUserState } from './middleware/localStorageMiddleware';

const preloadedUserState = loadUserState();

export const store = configureStore({
  reducer: {
    exercises: exerciseReducer,
    languages: languageReducer,
    categories: categoryReducer,
    user: userReducer,
    authProviders: authProviderReducer,
    userStats: userStatsReducer,
    userExercises: userExerciseReducer,
    difficulty: difficultyReducer,
  },
  preloadedState: {
    user: preloadedUserState,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 