import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  TextField, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  IconButton, 
  Checkbox,
  Tabs, 
  Tab,
  Grid,
  Alert,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import { 
  TabPanel,
  TabContext,
  TabList
} from '@mui/lab';
import { 
  Search as SearchIcon, 
  History as HistoryIcon, 
  LocationOn as LocationIcon, 
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import geolocationService from '../../services/geolocationService';
import { useAuth } from '../../context/AuthContext';
import LoginHistory from '../../components/LoginHistory';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [ipAddress, setIpAddress] = useState('');
  const [error, setError] = useState('');
  const [selectedHistory, setSelectedHistory] = useState(new Set());

  // Load search history
  const loadSearchHistory = useCallback(async () => {
    try {
      const history = await geolocationService.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      setError('Failed to load search history');
      console.error('Error loading search history:', error);
    }
  }, []);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      await loadSearchHistory();
      setIsLoading(true);
      setError('');
      
      // Load current location
      const data = await geolocationService.getMyLocation();
      setLocationData(data);
      
      // Load search history
      const history = await geolocationService.getSearchHistory();
      setSearchHistory(history);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === '2') { // Search History tab
      loadSearchHistory();
    }
  };

  const handleHistoryItemClick = async (ip) => {
    setIpAddress(ip);
    setTabValue('1'); // Switch to search tab
  };

  const handleToggleHistoryItem = (id) => {
    setSelectedHistory(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedHistory.size === 0) return;
    
    try {
      await geolocationService.deleteHistoryItems(Array.from(selectedHistory));
      setSelectedHistory(new Set());
      await loadSearchHistory();
    } catch (error) {
      setError('Failed to delete selected items');
      console.error('Delete error:', error);
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation(); // Prevent triggering the row click
    try {
      await geolocationService.deleteHistoryItems([id]);
      // Remove from selected if it was selected
      setSelectedHistory(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(id);
        return newSelection;
      });
      await loadSearchHistory();
    } catch (error) {
      setError('Failed to delete history item');
      console.error('Delete error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!ipAddress.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const data = await geolocationService.lookupIp(ipAddress);
      setLocationData(data);
      // Refresh search history after new search
      await loadSearchHistory();
    } catch (err) {
      setError(err.message || 'Failed to fetch location data');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = async () => {
    setIpAddress('');
    setError('');
    setIsSearching(true);
    
    try {
      // Get the user's current location
      const data = await geolocationService.getMyLocation();
      setLocationData(data);
    } catch (err) {
      setError('Failed to get current location');
      console.error('Error getting current location:', err);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography>Loading your IP information...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              IP Geolocation Dashboard
            </Typography>
            <Box>
              <Typography component="span" sx={{ mr: 2, display: { xs: 'none', sm: 'inline' } }}>
                Welcome, {user?.email}
              </Typography>
              <Button 
                color="inherit" 
                onClick={logout}
                startIcon={<LogoutIcon />}
                sx={{ textTransform: 'none' }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <TabList onChange={handleTabChange} aria-label="dashboard tabs" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="IP Lookup" value="1" {...a11yProps(0)} />
            <Tab label="Search History" value="2" {...a11yProps(1)} />
            <Tab label="Login History" value="3" disabled={!user} {...a11yProps(2)} />
          </TabList>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* IP Lookup Tab */}
        <TabPanel value="1">
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter IP address"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              size="small"
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSearching || !ipAddress.trim()}
              startIcon={<SearchIcon />}
              sx={{ minWidth: '120px' }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={handleClearSearch}
              disabled={isSearching}
              sx={{ minWidth: '120px' }}
            >
              Clear Search
            </Button>
          </Box>
              
          {locationData && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box mb={3}>
                  <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    IP Address
                  </Typography>
                  <Typography variant="h6">
                    {locationData.ip}
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    Location
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationIcon color="action" fontSize="small" />
                    <Typography>
                      {[locationData.city, locationData.region, locationData.country]
                        .filter(Boolean).join(', ')}
                    </Typography>
                  </Box>
                  {locationData.loc && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Coordinates: {locationData.loc}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box mb={3}>
                  <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    Timezone
                  </Typography>
                  <Typography>{locationData.timezone || 'N/A'}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    Internet Service Provider
                  </Typography>
                  <Typography>{locationData.org || 'N/A'}</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </TabPanel>
        
        {/* Search History Tab */}
        <TabPanel value="2">
          <Paper sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                Search History
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={handleDeleteSelected}
                disabled={selectedHistory.size === 0}
                size="small"
              >
                Delete Selected ({selectedHistory.size})
              </Button>
            </Box>
            <List>
              {searchHistory.map((item) => (
                <React.Fragment key={item._id}>
                  <ListItem 
                    button 
                    onClick={() => handleHistoryItemClick(item.ip)}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover',
                        '& .MuiIconButton-root': { visibility: 'visible' }
                      },
                      pl: 1
                    }}
                  >
                    <Checkbox
                      checked={selectedHistory.has(item._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleHistoryItem(item._id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <ListItemText
                      primary={item.ip}
                      secondary={`${formatDate(item.createdAt)} - ${item.city || ''}, ${item.country || ''}`}
                      sx={{ ml: 1 }}
                    />
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={(e) => handleDeleteHistory(item._id, e)}
                      sx={{ visibility: 'hidden' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </TabPanel>
        
        {/* Login History Tab */}
        <TabPanel value="3">
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Login History
            </Typography>
            <LoginHistory />
          </Paper>
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default DashboardPage;
