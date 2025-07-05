import { configureStore } from '@reduxjs/toolkit';
import exerciseReducer from './slices/exerciseSlice';
import languageReducer from './slices/languageSlice';
import categoryReducer from './slices/categorySlice';
import userReducer from './slices/userSlice';
import authProviderReducer from './slices/authProviderSlice';
import difficultyReducer from './slices/difficultySlice';
import userStatsReducer from './slices/userStatsSlice';

export const store = configureStore({
  reducer: {
    exercises: exerciseReducer,
    languages: languageReducer,
    categories: categoryReducer,
    user: userReducer,
    authProviders: authProviderReducer,
    difficulties: difficultyReducer,
    userStats: userStatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 