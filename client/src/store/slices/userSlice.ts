import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAxios } from '../../service/http-common';

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
}

// Начальное состояние
const initialState: UserState = {
  userID: localStorage.getItem('userID') ? Number(localStorage.getItem('userID')) : null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunk для логина
export const loginUser = createAsyncThunk(
  'user/login',
  async (loginData: any, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
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

// Async thunk для обновления access token
export const refreshAccessToken = createAsyncThunk(
  'user/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/user/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Token refresh failed');
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
      if (action.payload.Token) {
        localStorage.setItem('accessToken', action.payload.Token);
      }
      if (action.payload.UserID) {
        localStorage.setItem('userID', String(action.payload.UserID));
      }
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
        if (action.payload.Token) {
          localStorage.setItem('accessToken', action.payload.Token);
        }
        if (action.payload.UserID) {
          localStorage.setItem('userID', String(action.payload.UserID));
        }
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
      })
      .addCase(getUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.userID = null;
        state.accessToken = null;
      })
      // Update name
      .addCase(updateUserName.fulfilled, (state, action) => {
        state.userID = action.payload.id;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.userID = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setLoginData } = userSlice.actions;
export default userSlice.reducer; 