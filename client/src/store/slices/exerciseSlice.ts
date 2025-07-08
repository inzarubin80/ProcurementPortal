import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Exercise, ExerciseDetailse, ExerciseListWithUserResponse } from '../../types/api';
import { authAxios } from '../../service/http-common';
import { addUserExercise, removeUserExercise } from './userExerciseSlice';

interface ExerciseState {
  exercises: ExerciseDetailse[];
  currentExercise: ExerciseDetailse | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  currentPage: number;
  selectedLanguage: string;
  selectedCategory: string;
  searchTerm: string;
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
  currentPage: 1,
  selectedLanguage: 'all',
  selectedCategory: 'all',
  searchTerm: ''
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
  async (id: number, { rejectWithValue }) => {
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
  async ({ id, updates }: { id: number; updates: Partial<Exercise> }, { rejectWithValue }) => {
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
  async (id: number, { rejectWithValue }) => {
    try {
      await authAxios.delete(`/exercises/delete?id=${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete exercise');
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
    setCurrentExercise: (state, action: PayloadAction<ExerciseDetailse>) => {
      state.currentExercise = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercises.fulfilled, (state, action: PayloadAction<ExerciseListWithUserResponse>) => {
        state.loading = false;
        if (action.payload.page > 1) {
          state.exercises = [...state.exercises, ...action.payload.exercise_detailse];
        } else {
          state.exercises = action.payload.exercise_detailse;
        }
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
      .addCase(fetchExerciseById.fulfilled, (state, action: PayloadAction<ExerciseDetailse>) => {
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
      .addCase(createExercise.fulfilled, (state, action: PayloadAction<ExerciseDetailse>) => {
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
      .addCase(updateExercise.fulfilled, (state, action: PayloadAction<ExerciseDetailse>) => {
        state.loading = false;
        const index = state.exercises.findIndex(ex => ex.exercise.id === action.payload.exercise.id);
        if (index !== -1) {
          state.exercises[index] = action.payload;
        }
        if (state.currentExercise?.exercise.id === action.payload.exercise.id) {
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
      .addCase(deleteExercise.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.exercises = state.exercises.filter(ex => ex.exercise.id !== action.payload);
        if (state.currentExercise?.exercise.id === action.payload) {
          state.currentExercise = null;
        }
      })
      .addCase(deleteExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete exercise';
      })
      .addCase(addUserExercise.fulfilled, (state, action) => {
        const exercise = state.exercises.find(e => e.exercise.id === action.payload);
        if (exercise) {
          exercise.user_info.is_user_exercise = true;
        }
        if (state.currentExercise?.exercise.id === action.payload) {
          state.currentExercise.user_info.is_user_exercise = true;
        }
      })
      .addCase(removeUserExercise.fulfilled, (state, action) => {
        const exercise = state.exercises.find(e => e.exercise.id === action.payload);
        if (exercise) {
          exercise.user_info.is_user_exercise = false;
        }
        if (state.currentExercise?.exercise.id === action.payload) {
          state.currentExercise.user_info.is_user_exercise = false;
        }
      });
  },
});

export const { clearError, clearCurrentExercise, setCurrentExercise, setCurrentPage, setSelectedLanguage, setSelectedCategory, setSearchTerm } = exerciseSlice.actions;
export default exerciseSlice.reducer; 