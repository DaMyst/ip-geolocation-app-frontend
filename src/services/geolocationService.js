import api from './api';

const IPINFO_API_URL = 'https://ipinfo.io/geo';

const geolocationService = {
  // Save search result to our backend
  saveSearchToHistory: async (ip, geoData) => {
    try {
      console.log('Saving search to history:', { ip, geoData });
      const response = await api.post('/geo/save-search', {
        ip,
        geoData
      });
      console.log('Search saved to history:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving search to history:', error);
      // Don't throw error to prevent breaking the main search functionality
      return null;
    }
  },
  // Get current user's location using ipinfo.io
  getMyLocation: async () => {
    try {
      console.log(`Fetching from: ${IPINFO_API_URL}`);
      const response = await fetch(IPINFO_API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Raw API Response:', data);
      
      if (!data.ip) {
        throw new Error('No IP address in response');
      }
      
      // Transform the response to match our expected format
      const [lat, lon] = data.loc ? data.loc.split(',').map(Number) : [0, 0];
      
      const result = {
        ip: data.ip,
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country: data.country || 'Unknown',
        loc: data.loc || '0,0',
        latitude: lat,
        longitude: lon,
        postal: data.postal || '',
        timezone: data.timezone || 'UTC',
        org: data.org || 'Unknown ISP'
      };
      
      console.log('Processed location data:', result);
      return result;
      
    } catch (error) {
      console.error('Error in getMyLocation:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to get your location: ${error.message}`);
    }
  },

  // Lookup geolocation by IP using ipinfo.io and save to our backend
  lookupIp: async (ip) => {

    const token = "2333abd29a1eae"; // replace with your actual token
    try {
      const url = `https://ipinfo.io/${ip}/json?token=${token}`;
      console.log(`Fetching IP info for: ${ip} from ${url}`);
      
      // Fetch data from ipinfo.io
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw IP Lookup Response:', data);

      if (!data.ip) {
        throw new Error('No IP address in response');
      }

      // Transform the response to match our expected format
      const [lat, lon] = data.loc ? data.loc.split(',').map(Number) : [0, 0];
      
      const result = {
        ip: data.ip,
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        country: data.country || 'Unknown',
        loc: data.loc || '0,0',
        latitude: lat,
        longitude: lon,
        postal: data.postal || '',
        timezone: data.timezone || 'UTC',
        org: data.org || 'Unknown ISP',
        isp: data.org || 'Unknown ISP',
        query: data.ip
      };

      // Save the search to our backend (don't await to not block the UI)
      geolocationService.saveSearchToHistory(ip, result);

      return result;
    } catch (error) {
      console.error('Error in lookupIp:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to lookup IP address: ${error.message}`);
    }
  },

  // Get search history
  getSearchHistory: async () => {
    try {
      console.log('Fetching search history...');
      const response = await api.get('/history');
      console.log('Search history response:', response.data);
      return response.data.history || [];
    } catch (error) {
      console.error('Error fetching search history:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Return empty array for 401 errors (unauthorized) instead of throwing
      if (error.response?.status === 401) {
        console.log('User not authenticated - returning empty history');
        return [];
      }
      
      throw new Error(error.response?.data?.error || 'Failed to fetch search history');
    }
  },

  // Delete search history items
  deleteHistoryItems: async (ids) => {
    try {
      console.log('Deleting history items:', ids);
      const response = await api.delete('/history', { data: { ids } });
      console.log('Delete history response:', response.data);
      return true;
    } catch (error) {
      console.error('Error deleting history items:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.error || 'Failed to delete history items');
    }
  },
};

export default geolocationService;
