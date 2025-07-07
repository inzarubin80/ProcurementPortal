import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAxios } from '../../service/http-common';

export interface UserStats {
  user_id: number;
  total_exercises: number;
  completed_exercises: number;
  average_score: number;
  total_time: number;
  total_attempts: number;
}

interface UserStatsState {
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserStatsState = {
  userStats: null,
  isLoading: false,
  error: null,
};

export const fetchUserStats = createAsyncThunk(
  'userStats/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxios.get(`/user/stats`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch user stats');
    }
  }
);

const userStatsSlice = createSlice({
  name: 'userStats',
  initialState,
  reducers: {
    clearUserStats: (state) => {
      state.userStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action: PayloadAction<UserStats>) => {
        state.isLoading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.userStats = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserStats } = userStatsSlice.actions;
export default userStatsSlice.reducer; 