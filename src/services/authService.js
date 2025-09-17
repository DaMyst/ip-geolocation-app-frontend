import api from './api';
import { getPublicIP } from '../utils/ipUtils';

const authService = {
  login: async (email, password) => {
    try {
      // Try to get public IP, but don't block login if it fails
      let ipAddress = 'unknown';
      try {
        ipAddress = await getPublicIP();
        console.log('Detected public IP:', ipAddress);
      } catch (ipError) {
        console.warn('Could not get public IP:', ipError);
      }
      
      const response = await api.post('/auth/login', { 
        email, 
        password,
        ipAddress
      });
      
      if (!response.data) {
        throw new Error('No response data from server');
      }
      
      // Make sure to return the token and user data in the expected format
      return {
        token: response.data.token,
        user: response.data.user || { email }
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  register: async (email, password) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  getMe: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching user data with token:', token.substring(0, 10) + '...');
      const response = await api.get('/auth/me');
      
      if (!response.data || (!response.data.user && !response.data._id)) {
        console.error('Invalid response format from /auth/me:', response.data);
        throw new Error('Invalid user data received');
      }
      
      // Return the user object from the response
      return response.data.user || response.data;
    } catch (error) {
      console.error('Error in getMe:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Only clear token on 401 Unauthorized
      if (error.response?.status === 401) {
        console.log('Clearing invalid token');
        localStorage.removeItem('token');
      }
      
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },
};

export default authService;
