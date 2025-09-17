import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const TestComponent = () => {
  console.log('TestComponent rendered');
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        backgroundColor: '#e3f2fd', 
        margin: 2,
        borderLeft: '4px solid #1976d2',
        borderRadius: '4px'
      }}
    >
      <Typography variant="h5" color="primary" gutterBottom>
        🚀 Application Status
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" component="div">
          ✅ React is working correctly!
        </Typography>
        <Typography variant="body1" component="div">
          ✅ Material-UI components are rendering
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Current time: {new Date().toLocaleString()}
      </Typography>
    </Paper>
  );
};

export default TestComponent;
