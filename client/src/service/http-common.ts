import axios, { AxiosInstance } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

export const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_BASE_URL + '/api'
  : 'http://localhost:8080/api';

const authAxios: AxiosInstance = axios.create({ baseURL: baseURL, timeout: 30000 });
const publicAxios: AxiosInstance = axios.create({ baseURL: baseURL, timeout: 30000 });

createAuthRefreshInterceptor(authAxios, async (failedRequest) => {


  try {
    const response = await publicAxios.post('/user/refresh', {}, { withCredentials: true });
    const { Token } = response.data;
    localStorage.setItem('accessToken', Token);
    failedRequest.response.config.headers['Authorization'] = 'Bearer ' + Token;
    return Promise.resolve();
  } catch (e) {
    localStorage.removeItem('accessToken');
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

// --- Автоматическое обновление accessToken раз в 20 минут ---
setInterval(async () => {
  try {
    const response = await publicAxios.post('/user/refresh', {}, { withCredentials: true });
    const { Token } = response.data;
    localStorage.setItem('accessToken', Token);
  } catch (e) {
    localStorage.removeItem('accessToken');

  }
}, 10 * 60 * 1000); // 20 минут

export { authAxios, publicAxios };