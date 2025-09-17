import api from './api';

const userLoginService = {
  // Get user's login history
  getLoginHistory: async () => {
    try {
      console.log('Sending request to /api/user-logins');
      const response = await api.get('/user-logins');
      console.log('Login history response:', response.data);
      if (!response.data || !Array.isArray(response.data.logins)) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      return response.data.logins;
    } catch (error) {
      console.error('Error in getLoginHistory:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Format login date for display
  formatLoginDate: (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString(undefined, options);
  },

  // Get location string from login data
  getLocationString: (login) => {
    const { location } = login;
    if (!location) return 'Unknown location';
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown location';
  },

  // Get device info from user agent
  getDeviceInfo: (userAgent) => {
    if (!userAgent) return 'Unknown device';
    
    // Simple device detection (you can enhance this as needed)
    if (userAgent.includes('Mobile')) {
      return 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      return 'Tablet';
    } else if (userAgent.includes('Windows')) {
      return 'Windows PC';
    } else if (userAgent.includes('Mac')) {
      return 'Mac';
    } else if (userAgent.includes('Linux')) {
      return 'Linux PC';
    }
    
    return 'Unknown device';
  }
};

export default userLoginService;
