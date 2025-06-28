import { configureStore } from '@reduxjs/toolkit';
import languageReducer from './slices/languageSlice';
import exerciseReducer from './slices/exerciseSlice';
import sessionReducer from './slices/sessionSlice';

export const store = configureStore({
  reducer: {
    language: languageReducer,
    exercise: exerciseReducer,
    session: sessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 