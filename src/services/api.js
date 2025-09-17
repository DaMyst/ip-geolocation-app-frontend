import axios from 'axios';

// Determine the API URL based on the environment
const getApiUrl = () => {
  // If REACT_APP_API_URL is set in environment, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // In production, use relative URL
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // Default to local development
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  // Only include credentials in development
  withCredentials: process.env.NODE_ENV !== 'production',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config.url.includes('/auth/');
      
      // Only redirect to login for auth-related 401s
      // This prevents logout when other endpoints return 401
      if (isAuthEndpoint && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
