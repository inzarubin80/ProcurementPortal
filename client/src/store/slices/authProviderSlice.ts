import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthProvider } from '../../types/api';
import { publicAxios, authAxios } from '../../service/http-common';

// Новый тип для привязанных провайдеров пользователя
export interface UserAuthProvider {
  user_id: number;
  provider_uid: string;
  provider: string;
  name: string;
  display_name?: string;
  icon_svg?: string;
}

// Состояние слайса
interface AuthProviderState {
  providers: AuthProvider[];
  loading: boolean;
  error: string | null;
  userLinkedProviders: UserAuthProvider[];
  userLinkedLoading: boolean;
  userLinkedError: string | null;
}

// Начальное состояние
const initialState: AuthProviderState = {
  providers: [],
  loading: false,
  error: null,
  userLinkedProviders: [],
  userLinkedLoading: false,
  userLinkedError: null,
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

// Получить провайдеры, привязанные к пользователю
export const fetchUserLinkedProviders = createAsyncThunk(
  'authProviders/fetchUserLinkedProviders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxios.get('/user/providers');
      return response.data as UserAuthProvider[];
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch linked providers');
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
      state.userLinkedError = null;
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
      })
      // user linked providers
      .addCase(fetchUserLinkedProviders.pending, (state) => {
        state.userLinkedLoading = true;
        state.userLinkedError = null;
      })
      .addCase(fetchUserLinkedProviders.fulfilled, (state, action: PayloadAction<UserAuthProvider[]>) => {
        state.userLinkedLoading = false;
        state.userLinkedProviders = action.payload;
      })
      .addCase(fetchUserLinkedProviders.rejected, (state, action) => {
        state.userLinkedLoading = false;
        state.userLinkedError = action.error.message || 'Failed to fetch linked providers';
      });
  },
});

export const { clearError } = authProviderSlice.actions;
export default authProviderSlice.reducer; 