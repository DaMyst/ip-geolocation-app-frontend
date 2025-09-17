import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  Computer as ComputerIcon,
  PhoneIphone as MobileIcon,
  TabletMac as TabletIcon,
  DesktopWindows as DesktopIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import userLoginService from '../services/userLoginService';

const LoginHistory = () => {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        console.log('Fetching login history...');
        setLoading(true);
        const data = await userLoginService.getLoginHistory();
        console.log('Login history data received:', data);
        setLogins(data);
        setError('');
      } catch (err) {
        console.error('Error fetching login history:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.response?.data?.error || 'Failed to load login history');
      } finally {
        setLoading(false);
      }
    };

    fetchLoginHistory();
  }, []);

  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <DesktopIcon />;
    
    if (userAgent.includes('Mobile')) {
      return <MobileIcon />;
    } else if (userAgent.includes('Tablet')) {
      return <TabletIcon />;
    }
    return <ComputerIcon />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (logins.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body1" color="textSecondary">
          No login history found.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box p={2} bgcolor={theme.palette.primary.main} color="white">
        <Typography variant="h6">Login History</Typography>
        <Typography variant="body2">Recent account access activity</Typography>
      </Box>
      
      <List>
        {logins.map((login, index) => (
          <React.Fragment key={login._id}>
            <ListItem>
              <ListItemIcon>
                {getDeviceIcon(login.userAgent)}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box component="span" display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                    <Box component="span">
                      {userLoginService.getDeviceInfo(login.userAgent)}
                    </Box>
                    <Chip
                      size="small"
                      label={login.isCurrent ? 'Current Session' : 'Previous Session'}
                      color={login.isCurrent ? 'primary' : 'default'}
                      variant="outlined"
                      component="span"
                      sx={{ display: 'inline-flex' }}
                    />
                  </Box>
                }
                secondary={
                  <Box component="span" display="block" mt={1}>
                    <Box component="span" display="block" mb={1}>
                      {login.ipAddress && (
                        <Box component="span" display="flex" alignItems="center" gap={1} mb={1}>
                          <PublicIcon fontSize="small" color="action" />
                          <span>IP: {login.ipAddress}</span>
                        </Box>
                      )}
                      <Box component="span" display="flex" alignItems="center" gap={1}>
                        <LocationIcon fontSize="small" color="action" />
                        <span>
                          {userLoginService.getLocationString(login) || 'Location not available'}
                        </span>
                      </Box>
                    </Box>
                    <Box component="span" display="flex" alignItems="center" gap={1}>
                      <TimeIcon fontSize="small" color="action" />
                      <span style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                        {userLoginService.formatLoginDate(login.createdAt)}
                      </span>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            {index < logins.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default LoginHistory;
