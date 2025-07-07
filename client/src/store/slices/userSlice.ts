import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAxios, publicAxios } from '../../service/http-common';
import { getStoredToken, getStoredUserID, clearStoredAuth, setStoredAuth, isTokenValid } from '../../utils/authUtils';

// Типы для пользователя
export interface User {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface AuthData {
  Token: string;
  UserID: number;
}

export interface LoginRequest {
  AuthorizationCode: string;
  ProviderKey: string;
}

// Состояние пользователя
interface UserState {
  userID: number | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userName: string | null;
}

// Начальное состояние
const initialState: UserState = {
  userID: getStoredUserID(),
  accessToken: getStoredToken(),
  isAuthenticated: isTokenValid(),
  isLoading: false,
  error: null,
  userName: null,
};

// Async thunk для логина
export const loginUser = createAsyncThunk(
  'user/login',
  async (loginData: any, { rejectWithValue }) => {
    try {
      const response = await publicAxios.post('/user/login', loginData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk для получения пользователя
export const getUser = createAsyncThunk(
  'user/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxios.get('/user');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'User check failed');
    }
  }
);

// Async thunk для обновления имени пользователя
export const updateUserName = createAsyncThunk(
  'user/updateName',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await authAxios.post('/user/name', { name });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Update failed');
    }
  }
);

// Async thunk для выхода
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAxios.get('/user/logout');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Logout failed');
    }
  }
);

// Async thunk для проверки токена при загрузке приложения
export const checkAuthToken = createAsyncThunk(
  'user/checkAuthToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = getStoredToken();
      const userID = getStoredUserID();
      
      if (!token || !userID) {
        throw new Error('No token found');
      }

      const response = await authAxios.get('/user');
      return response.data;
    } catch (error: any) {
      // Если токен недействителен, очищаем localStorage
      clearStoredAuth();
      return rejectWithValue(error?.response?.data?.message || 'Token validation failed');
    }
  }
);

// Async thunk для обновления access token
export const refreshAccessToken = createAsyncThunk(
  'user/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicAxios.post('/user/refresh', {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Token refresh failed');
    }
  }
);

// Создание slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoginData: (state, action: PayloadAction<AuthData>) => {
      state.userID = action.payload.UserID;
      state.accessToken = action.payload.Token;
      state.isAuthenticated = true;
      state.error = null;
      setStoredAuth(action.payload.Token, action.payload.UserID);
    },
    logout: (state) => {
      state.userID = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.userName = null;
      clearStoredAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userID = action.payload.UserID;
        state.accessToken = action.payload.Token;
        state.isAuthenticated = true;
        state.error = null;
        setStoredAuth(action.payload.Token, action.payload.UserID);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get user
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
        state.userID = action.payload.ID;
        state.userName = action.payload.Name;
      })
      .addCase(getUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.userID = null;
        state.accessToken = null;
        state.userName = null;
        clearStoredAuth();
      })
      // Update name
      .addCase(updateUserName.fulfilled, (state, action) => {
        state.userID = action.payload.ID;
        state.userName = action.payload.Name;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.userID = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        clearStoredAuth();
      })
      .addCase(logoutUser.rejected, (state) => {
        // Даже если logout на сервере не удался, очищаем локальное состояние
        state.userID = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        clearStoredAuth();
      })
      // Check auth token
      .addCase(checkAuthToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.userID = null;
        state.accessToken = null;
        state.error = action.payload as string;
        clearStoredAuth();
      });
  },
});

export const { clearError, setLoginData, logout } = userSlice.actions;
export default userSlice.reducer; 