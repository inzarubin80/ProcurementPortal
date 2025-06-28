import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Exercise } from '../../types/api';
import { exerciseApi } from '../../services/api';

interface ExerciseState {
  exercises: Exercise[];
  currentExercise: Exercise | null;
  loading: boolean;
  error: string | null;
}

const initialState: ExerciseState = {
  exercises: [],
  currentExercise: null,
  loading: false,
  error: null,
};

export const fetchExercises = createAsyncThunk(
  'exercise/fetchExercises',
  async () => {
    const response = await exerciseApi.getExercises();
    return response;
  }
);

export const fetchExerciseById = createAsyncThunk(
  'exercise/fetchExerciseById',
  async (id: string) => {
    const response = await exerciseApi.getExercise(id);
    return response;
  }
);

const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentExercise: (state) => {
      state.currentExercise = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action: PayloadAction<Exercise[]>) => {
        state.loading = false;
        state.exercises = action.payload;
      })
      .addCase(fetchExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exercises';
      })
      .addCase(fetchExerciseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExerciseById.fulfilled, (state, action: PayloadAction<Exercise>) => {
        state.loading = false;
        state.currentExercise = action.payload;
      })
      .addCase(fetchExerciseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exercise';
      });
  },
});

export const { clearError, clearCurrentExercise } = exerciseSlice.actions;
export default exerciseSlice.reducer; 