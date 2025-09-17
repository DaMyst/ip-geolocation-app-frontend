import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Function to handle authentication check
  const checkAuth = useCallback(async () => {
    console.log('--- checkAuth called ---');
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.log('No token found, user not authenticated');
      setIsLoading(false);
      return false;
    }
    
    try {
      console.log('Calling authService.getMe()...');
      const userData = await authService.getMe();
      console.log('User data received from getMe:', userData);
      
      if (!userData) {
        console.error('No user data returned from getMe');
        return false;
      }
      
      console.log('Setting user and authenticated state');
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Auth check failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return false;
    }
  }, []);

  // Initial authentication check on mount
  useEffect(() => {
    let isMounted = true;
    
    const verifyAuth = async () => {
      setIsLoading(true);
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated && isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error during initial auth check:', error);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    verifyAuth();
    
    return () => {
      isMounted = false;
    };
  }, [checkAuth]);
  
  // Set up periodic auth check
  useEffect(() => {
    const authCheckInterval = setInterval(() => {
      checkAuth().catch(console.error);
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(authCheckInterval);
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user || { email });
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: 'No token received from server' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (email, password) => {
    try {
      const { user: userData, token } = await authService.register(email, password);
      localStorage.setItem('token', token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
