import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAxios, publicAxios } from '../../service/http-common';
import { getStoredToken, clearStoredAuth, setStoredAuth, isTokenValid, hasStoredUserData, getStoredUserData } from '../../utils/authUtils';

// Типы для пользователя
export interface User {
  user_id: number;
  name: string;
  is_admin: boolean 
}

export interface AuthData {
  user: User;
  refresh_token:string;
  access_token:string;
}

export interface LoginRequest {
  AuthorizationCode: string;
  ProviderKey: string;
}

// Состояние пользователя
interface UserState {
  user: User| null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

}

// Начальное состояние
const initialState: UserState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
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
      const response = await publicAxios.post('/user/refresh', {}, {
        withCredentials: true,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Token refresh failed');
    }
  }
);

// Async thunk для инициализации состояния пользователя
export const initializeUserState = createAsyncThunk(
  'user/initializeUserState',
  async (_, { rejectWithValue }) => {
    try {
      // Проверяем наличие сохраненных данных пользователя
      if (!hasStoredUserData()) {
        throw new Error('No stored user data found');
      }
      
      const response = await authAxios.get('/user');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'User initialization failed');
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

// Async thunk для восстановления состояния пользователя из localStorage
export const restoreUserState = createAsyncThunk(
  'user/restoreUserState',
  async (_, { rejectWithValue }) => {
    try {
      const { token, userID } = getStoredUserData();
      if (!token || !userID) {
        throw new Error('No stored user data found');
      }
      
      // Возвращаем базовые данные пользователя из localStorage
      return {
        user_id: userID,
        name: 'Пользователь', // Временное имя, будет обновлено при загрузке с сервера
        is_admin: false, // Временное значение, будет обновлено при загрузке с сервера
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to restore user state');
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
      state.isAuthenticated = true;
      state.error = null;
      setStoredAuth(action.payload.access_token, action.payload.user.user_id);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
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
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
        // Сохраняем данные пользователя в localStorage
        setStoredAuth(action.payload.access_token, action.payload.user.user_id);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // refreshAccessTokennpm
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
        // Сохраняем данные пользователя в localStorage
        setStoredAuth(action.payload.access_token, action.payload.user.user_id);
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Initialize user state
      .addCase(initializeUserState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeUserState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Сохраняем данные пользователя в localStorage
        if (action.payload && action.payload.user.user_id) {
          setStoredAuth(getStoredToken() || '', action.payload.user.user_id);
        }
      })
      .addCase(initializeUserState.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = action.payload as string;
        clearStoredAuth();
      })

      // Get user
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Сохраняем данные пользователя в localStorage
        if (action.payload && action.payload.user_id) {
          setStoredAuth(getStoredToken() || '', action.payload.user_id);
        }
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = action.payload as string;
        clearStoredAuth();
      })

      // Restore user state
      .addCase(restoreUserState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreUserState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(restoreUserState.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = action.payload as string;
        clearStoredAuth();
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        clearStoredAuth();
      })
      .addCase(logoutUser.rejected, (state) => {
        // Даже если logout на сервере не удался, очищаем локальное состояние
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        clearStoredAuth();
      })
      
      
      ;
  },
});

export const { clearError, setLoginData, logout } = userSlice.actions;
export default userSlice.reducer; 