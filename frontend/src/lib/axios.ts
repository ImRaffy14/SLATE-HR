import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ErrorResponse } from '@/types';

const urlAPI = import.meta.env.VITE_SERVER_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: urlAPI,
  withCredentials: true,
});

// Request interceptor to add token to Authorization header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      // Optionally redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

