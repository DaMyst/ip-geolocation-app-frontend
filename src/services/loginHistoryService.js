import axios from 'axios';
import { API_URL } from '../config';
import authHeader from './auth-header';

const API_BASE_URL = `${API_URL}/api/auth`;

export const getLoginHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/login-history`, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching login history:', error);
    throw error;
  }
};

export const getCurrentSession = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/current-session`, { 
      headers: authHeader() 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current session:', error);
    throw error;
  }
};
