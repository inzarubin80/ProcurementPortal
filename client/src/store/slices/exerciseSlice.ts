import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Exercise, ExerciseListResponse } from '../../types/api';
import { authAxios } from '../../service/http-common';

interface ExerciseState {
  exercises: Exercise[];
  currentExercise: Exercise | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const initialState: ExerciseState = {
  exercises: [],
  currentExercise: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    hasNext: false,
    hasPrev: false,
  },
};

export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const response = await authAxios.get(`/exercises?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch exercises');
    }
  }
);

export const fetchExerciseById = createAsyncThunk(
  'exercises/fetchExerciseById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await authAxios.get(`/exercises/get?id=${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch exercise');
    }
  }
);

export const createExercise = createAsyncThunk(
  'exercises/createExercise',
  async (exercise: Omit<Exercise, 'id' | 'user_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await authAxios.post('/exercises/create', exercise);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create exercise');
    }
  }
);

export const updateExercise = createAsyncThunk(
  'exercises/updateExercise',
  async ({ id, updates }: { id: string; updates: Partial<Exercise> }, { rejectWithValue }) => {
    try {
      const response = await authAxios.put(`/exercises/update?id=${id}`, updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update exercise');
    }
  }
);

export const deleteExercise = createAsyncThunk(
  'exercises/deleteExercise',
  async (id: string, { rejectWithValue }) => {
    try {
      await authAxios.delete(`/exercises/delete?id=${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete exercise');
    }
  }
);

export const fetchExercisesByLanguage = createAsyncThunk(
  'exercises/fetchExercisesByLanguage',
  async ({ language, page = 1, pageSize = 10 }: { language: string; page?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const response = await authAxios.get(`/exercises?programming_language=${language}&page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch exercises by language');
    }
  }
);

export const fetchExercisesByCategory = createAsyncThunk(
  'exercises/fetchExercisesByCategory',
  async ({ categoryId, page = 1, pageSize = 10 }: { categoryId: string; page?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const response = await authAxios.get(`/exercises?category_id=${categoryId}&page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch exercises by category');
    }
  }
);

const exerciseSlice = createSlice({
  name: 'exercises',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentExercise: (state) => {
      state.currentExercise = null;
    },
    setCurrentExercise: (state, action: PayloadAction<Exercise>) => {
      state.currentExercise = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action: PayloadAction<ExerciseListResponse>) => {
        state.loading = false;
        state.exercises = action.payload.exercises;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.page_size,
          total: action.payload.total,
          hasNext: action.payload.has_next,
          hasPrev: action.payload.has_prev,
        };
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
      })
      .addCase(createExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExercise.fulfilled, (state, action: PayloadAction<Exercise>) => {
        state.loading = false;
        state.exercises.unshift(action.payload);
        state.currentExercise = action.payload;
      })
      .addCase(createExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create exercise';
      })
      .addCase(updateExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExercise.fulfilled, (state, action: PayloadAction<Exercise>) => {
        state.loading = false;
        const index = state.exercises.findIndex(ex => ex.id === action.payload.id);
        if (index !== -1) {
          state.exercises[index] = action.payload;
        }
        if (state.currentExercise?.id === action.payload.id) {
          state.currentExercise = action.payload;
        }
      })
      .addCase(updateExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update exercise';
      })
      .addCase(deleteExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExercise.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.exercises = state.exercises.filter(ex => ex.id !== action.payload);
        if (state.currentExercise?.id === action.payload) {
          state.currentExercise = null;
        }
      })
      .addCase(deleteExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete exercise';
      })
      .addCase(fetchExercisesByLanguage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercisesByLanguage.fulfilled, (state, action: PayloadAction<ExerciseListResponse>) => {
        state.loading = false;
        state.exercises = action.payload.exercises;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.page_size,
          total: action.payload.total,
          hasNext: action.payload.has_next,
          hasPrev: action.payload.has_prev,
        };
      })
      .addCase(fetchExercisesByLanguage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exercises by language';
      })
      .addCase(fetchExercisesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercisesByCategory.fulfilled, (state, action: PayloadAction<ExerciseListResponse>) => {
        state.loading = false;
        state.exercises = action.payload.exercises;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.page_size,
          total: action.payload.total,
          hasNext: action.payload.has_next,
          hasPrev: action.payload.has_prev,
        };
      })
      .addCase(fetchExercisesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exercises by category';
      });
  },
});

export const { clearError, clearCurrentExercise, setCurrentExercise } = exerciseSlice.actions;
export default exerciseSlice.reducer; 