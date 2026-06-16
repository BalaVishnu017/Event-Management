import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      // false = use cached token (fast); refresh happens in response interceptor on 401
      const token = await user.getIdToken(false);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Proceed without token in demo mode
  }
  return config;
});

// On 401: force-refresh the token and retry once, then reject
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      auth.currentUser
    ) {
      originalRequest._retry = true;
      try {
        const freshToken = await auth.currentUser.getIdToken(true); // force refresh
        originalRequest.headers.Authorization = `Bearer ${freshToken}`;
        return api(originalRequest);
      } catch {
        // Token refresh failed — user must re-login
      }
    }
    const message = error.response?.data?.error || error.message || 'Network error';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

export default api;
