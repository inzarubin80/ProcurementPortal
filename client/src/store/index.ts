import { configureStore } from '@reduxjs/toolkit';
import exerciseReducer from './slices/exerciseSlice';
import languageReducer from './slices/languageSlice';
import categoryReducer from './slices/categorySlice';
import userReducer from './slices/userSlice';
import authProviderReducer from './slices/authProviderSlice';
import userStatsReducer from './slices/userStatsSlice';
import userExerciseReducer from './slices/userExerciseSlice';
import difficultyReducer from './slices/difficultySlice';

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
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 