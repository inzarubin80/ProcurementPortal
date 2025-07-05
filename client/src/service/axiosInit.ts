import { store } from '../store';
import { refreshAccessToken, logout } from '../store/slices/userSlice';
import { initializeAxiosInterceptors } from './http-common';

// Инициализируем interceptors после создания store
initializeAxiosInterceptors(store, refreshAccessToken, logout); 