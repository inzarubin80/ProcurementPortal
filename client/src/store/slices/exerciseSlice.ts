import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Exercise, ExerciseListResponse } from '../../types/api';
import { authAxios } from '../../service/http-common';
import { addUserExercise, removeUserExercise } from './userExerciseSlice';

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
  currentPage: number;
  selectedLanguage: string;
  selectedCategory: string;
  selectedDifficulty: string;
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
  selectedDifficulty: 'all',
  searchTerm: '',
};

export const fetchExercises = createAsyncThunk(
  'exercises/fetchExercises',
  async ({ page = 1, pageSize = 10, difficulty }: { page?: number; pageSize?: number; difficulty?: string }, { rejectWithValue }) => {
    try {
      let url = `/exercises?page=${page}&page_size=${pageSize}`;
      if (difficulty && difficulty !== 'all') url += `&difficulty=${difficulty}`;
      const response = await authAxios.get(url);
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

export const fetchExercisesWithFilters = createAsyncThunk(
  'exercises/fetchExercisesWithFilters',
  async (
    { language, category, difficulty, page = 1, pageSize = 10 }: { language?: string; category?: string; difficulty?: string; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      let url = `/exercises?page=${page}&page_size=${pageSize}`;
      if (language && language !== 'all') url += `&programming_language=${language}`;
      if (category && category !== 'all') url += `&category_id=${category}`;
      if (difficulty && difficulty !== 'all') url += `&difficulty=${difficulty}`;
      const response = await authAxios.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch exercises');
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
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedDifficulty: (state, action: PayloadAction<string>) => {
      state.selectedDifficulty = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setExerciseSolved: (state, action: PayloadAction<string>) => {
      const ex = state.exercises.find(e => e.id === action.payload);
      if (ex) ex.is_solved = true;
      if (state.currentExercise?.id === action.payload && state.currentExercise)
        state.currentExercise.is_solved = true;
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
        if (action.payload.page > 1) {
          state.exercises = [...state.exercises, ...action.payload.exercises];
        } else {
          state.exercises = action.payload.exercises;
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
      .addCase(addUserExercise.fulfilled, (state, action) => {
        const exercise = state.exercises.find(e => e.id === action.payload);
        if (exercise) {
          exercise.is_user_exercise = true;
        }
        if (state.currentExercise?.id === action.payload) {
          state.currentExercise.is_user_exercise = true;
        }
      })
      .addCase(removeUserExercise.fulfilled, (state, action) => {
        const exercise = state.exercises.find(e => e.id === action.payload);
        if (exercise) {
          exercise.is_user_exercise = false;
        }
        if (state.currentExercise?.id === action.payload) {
          state.currentExercise.is_user_exercise = false;
        }
      })
      .addCase(fetchExercisesWithFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExercisesWithFilters.fulfilled, (state, action: PayloadAction<ExerciseListResponse>) => {
        state.loading = false;
        if (action.payload.page > 1) {
          state.exercises = [...state.exercises, ...action.payload.exercises];
        } else {
          state.exercises = action.payload.exercises;
        }
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.page_size,
          total: action.payload.total,
          hasNext: action.payload.has_next,
          hasPrev: action.payload.has_prev,
        };
      })
      .addCase(fetchExercisesWithFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exercises';
      });
  },
});

export const { clearError, clearCurrentExercise, setCurrentExercise, setCurrentPage, setSelectedLanguage, setSelectedCategory, setSelectedDifficulty, setSearchTerm, setExerciseSolved } = exerciseSlice.actions;
export default exerciseSlice.reducer; 