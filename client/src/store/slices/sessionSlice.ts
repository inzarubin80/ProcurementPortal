import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Session, UserStats } from '../../types/api';
import { sessionApi } from '../../services/api';

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
  async (sessionData: Omit<Session, 'id' | 'created_at'>) => {
    const response = await sessionApi.createSession(sessionData);
    return response;
  }
);

export const fetchUserStats = createAsyncThunk(
  'session/fetchUserStats',
  async (exerciseId: string) => {
    const response = await sessionApi.getUserStats(exerciseId);
    return response;
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
      });
  },
});

export const { clearError, clearUserStats } = sessionSlice.actions;
export default sessionSlice.reducer; 