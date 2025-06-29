import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthProvider } from '../../types/api';
import { publicAxios } from '../../service/http-common';

// Состояние слайса
interface AuthProviderState {
  providers: AuthProvider[];
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: AuthProviderState = {
  providers: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchProviders = createAsyncThunk(
  'authProviders/fetchProviders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicAxios.get('/providers');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch providers');
    }
  }
);

// Слайс
const authProviderSlice = createSlice({
  name: 'authProviders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action: PayloadAction<AuthProvider[]>) => {
        state.loading = false;
        state.providers = action.payload;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch providers';
      });
  },
});

export const { clearError } = authProviderSlice.actions;
export default authProviderSlice.reducer; 