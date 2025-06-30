import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAxios } from '../../service/http-common';

export interface Difficulty {
  name: string;
  value: string;
}

interface DifficultyState {
  difficulties: Difficulty[];
  loading: boolean;
  error: string | null;
}

const initialState: DifficultyState = {
  difficulties: [],
  loading: false,
  error: null,
};

export const fetchDifficulties = createAsyncThunk(
  'difficulties/fetchDifficulties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxios.get('/difficulties');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch difficulties');
    }
  }
);

const difficultySlice = createSlice({
  name: 'difficulties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDifficulties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDifficulties.fulfilled, (state, action) => {
        state.loading = false;
        state.difficulties = action.payload;
      })
      .addCase(fetchDifficulties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default difficultySlice.reducer; 