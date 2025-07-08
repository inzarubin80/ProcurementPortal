import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Exercise, ExerciseDetailse, ExerciseListWithUserResponse } from '../../types/api';
import { userExercisesApi, UserExercisesFilters } from '../../service/userExercisesApi';

interface UserExerciseState {
  userExercises: ExerciseDetailse[];
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
  userExerciseIds: string[];
}

const initialState: UserExerciseState = {
  userExercises: [],
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
  userExerciseIds: []
};

export const fetchUserExercises = createAsyncThunk(
  'userExercises/fetchUserExercises',
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const response = await userExercisesApi.getUserExercises({ page, page_size: pageSize });
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch user exercises');
    }
  }
);

export const fetchUserExercisesWithFilters = createAsyncThunk(
  'userExercises/fetchUserExercisesWithFilters',
  async (
    { language, category, page = 1, pageSize = 10 }: { language?: string; category?: string; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const filters: UserExercisesFilters = { page, page_size: pageSize };
      if (language && language !== 'all') filters.programming_language = language;
      if (category && category !== 'all') filters.category_id = category;
      
      const response = await userExercisesApi.getUserExercisesFiltered(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch user exercises');
    }
  }
);

export const addUserExercise = createAsyncThunk(
  'userExercises/addUserExercise',
  async (exerciseId: string, { rejectWithValue }) => {
    try {
      await userExercisesApi.addUserExercise(exerciseId);
      return exerciseId;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to add exercise');
    }
  }
);

export const removeUserExercise = createAsyncThunk(
  'userExercises/removeUserExercise',
  async (exerciseId: string, { rejectWithValue }) => {
    try {
      await userExercisesApi.removeUserExercise(exerciseId);
      return exerciseId;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to remove exercise');
    }
  }
);

const userExerciseSlice = createSlice({
  name: 'userExercises',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
    clearFilters: (state) => {
      state.selectedLanguage = 'all';
      state.selectedCategory = 'all';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserExercises.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserExercises.fulfilled, (state, action: PayloadAction<ExerciseListWithUserResponse>) => {
        state.loading = false;
        if (action.payload.page > 1) {
          state.userExercises = [...state.userExercises, ...action.payload.exercise_detailse];
        } else {
          state.userExercises = action.payload.exercise_detailse;
        }
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.page_size,
          total: action.payload.total,
          hasNext: action.payload.has_next,
          hasPrev: action.payload.has_prev,
        };
      })
      .addCase(fetchUserExercises.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user exercises';
      })
      .addCase(fetchUserExercisesWithFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserExercisesWithFilters.fulfilled, (state, action: PayloadAction<ExerciseListWithUserResponse>) => {
        state.loading = false;
        state.userExercises = action.payload.exercise_detailse;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.page_size,
          total: action.payload.total,
          hasNext: action.payload.has_next,
          hasPrev: action.payload.has_prev,
        };
      })
      .addCase(fetchUserExercisesWithFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user exercises';
      })
      .addCase(addUserExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserExercise.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addUserExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add exercise';
      })
      .addCase(removeUserExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUserExercise.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeUserExercise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove exercise';
      });
  },
});

export const {
  clearError,
  setCurrentPage,
  setSelectedLanguage,
  setSelectedCategory,
  clearFilters,
} = userExerciseSlice.actions;

export default userExerciseSlice.reducer; 