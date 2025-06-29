import axios, { AxiosInstance } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

export const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_BASE_URL + '/api'
  : 'http://localhost:8080/api';

const authAxios: AxiosInstance = axios.create({ baseURL: baseURL, timeout: 30000 });
const publicAxios: AxiosInstance = axios.create({ baseURL: baseURL, timeout: 30000 });

createAuthRefreshInterceptor(authAxios, async (failedRequest) => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    localStorage.removeItem('accessToken');
    return Promise.reject();
  }
  try {
    const response = await publicAxios.post('/user/refresh', {}, { withCredentials: true });
    const { access_token } = response.data;
    localStorage.setItem('accessToken', access_token);
    failedRequest.response.config.headers['Authorization'] = 'Bearer ' + access_token;
    return Promise.resolve();
  } catch (e) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return Promise.reject();
  }
});

authAxios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export { authAxios, publicAxios };