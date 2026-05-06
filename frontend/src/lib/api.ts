// [AI-Agent: Skills] Axios API instance — Firebase token interceptor ile her istekte auth header gönderir.
import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Her API isteğinde Firebase token gönder
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else if (localStorage.getItem('demo_mode') === 'true') {
    // Demo modda token göndermiyoruz — backend DEMO_MODE=true ile bypass eder
  }
  return config;
});

// Response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz — login sayfasına yönlendir
      localStorage.removeItem('demo_mode');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
