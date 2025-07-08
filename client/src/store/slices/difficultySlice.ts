import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DifficultyState {
  difficulties: string[];
  loading: boolean;
  error: string | null;
}

const initialState: DifficultyState = {
  difficulties: ['easy', 'medium', 'hard'],
  loading: false,
  error: null,
};

const difficultySlice = createSlice({
  name: 'difficulty',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { clearError } = difficultySlice.actions;
export default difficultySlice.reducer; 