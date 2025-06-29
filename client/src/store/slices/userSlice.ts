import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Типы для пользователя
export interface User {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface AuthData {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  AuthorizationCode: string;
  ProviderKey: string;
}

// Состояние пользователя
interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: UserState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunk для авторизации
export const loginUser = createAsyncThunk(
  'user/login',
  async (loginData: LoginRequest, { rejectWithValue }) => {
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

// Async thunk для получения сессии
export const getSession = createAsyncThunk(
  'user/getSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/user/session`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Session not found');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Session check failed');
    }
  }
);

// Async thunk для обновления имени пользователя
export const updateUserName = createAsyncThunk(
  'user/updateName',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/user/name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Update failed');
    }
  }
);

// Async thunk для выхода
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/user/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
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
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      state.isAuthenticated = true;
      state.error = null;
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
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get session
      .addCase(getSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      // Update name
      .addCase(updateUserName.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setLoginData } = userSlice.actions;
export default userSlice.reducer; 