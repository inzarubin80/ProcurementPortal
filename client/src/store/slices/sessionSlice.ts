import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Session, UserStats } from '../../types/api';
import { authAxios, publicAxios } from '../../service/http-common';

interface SessionState {
  sessions: Session[];
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  sessions: [],
  userStats: null,
  loading: false,
  error: null,
};

export const createSession = createAsyncThunk(
  'session/createSession',
  async (sessionData: Omit<Session, 'id' | 'created_at'>, { rejectWithValue }) => {
    try {
      const response = await authAxios.post('/sessions/create', sessionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create session');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'session/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicAxios.get('/user/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch user stats');
    }
  }
);

export const fetchExerciseStats = createAsyncThunk(
  'session/fetchExerciseStats',
  async (exerciseId: string, { rejectWithValue }) => {
    try {
      const response = await publicAxios.get(`/exercises/${exerciseId}/stats`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch exercise stats');
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserStats: (state) => {
      state.userStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action: PayloadAction<Session>) => {
        state.loading = false;
        state.sessions.push(action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create session';
      })
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action: PayloadAction<UserStats>) => {
        state.loading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user stats';
      })
      .addCase(fetchExerciseStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExerciseStats.fulfilled, (state, action: PayloadAction<UserStats>) => {
        state.loading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchExerciseStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exercise stats';
      });
  },
});

export const { clearError, clearUserStats } = sessionSlice.actions;
export default sessionSlice.reducer; 