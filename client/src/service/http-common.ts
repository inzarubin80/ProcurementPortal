import axios, { AxiosInstance } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

export const baseURL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8090') + '/api';

const authAxios: AxiosInstance = axios.create({ baseURL: baseURL, timeout: 30000 });
const publicAxios: AxiosInstance = axios.create({ baseURL: baseURL, timeout: 30000 });

// Функция для инициализации interceptors с зависимостями
export const initializeAxiosInterceptors = (
  store: any,
  refreshAccessToken: any,
  logout: any
) => {
  createAuthRefreshInterceptor(authAxios, (failedRequest) => {
    return store.dispatch(refreshAccessToken()).then((response: any) => {
      if (failedRequest) {
        failedRequest.response.config.headers.Authorization = `Bearer ${response.payload.Token}`;
      }
      return Promise.resolve();
    }).catch(() => {
      store.dispatch(logout());
      return Promise.reject();
    });
  });

  authAxios.interceptors.request.use(
    (config) => {
      const accessToken = store.getState().user.accessToken;
      if (accessToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export { authAxios, publicAxios };