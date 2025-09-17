import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const MinimalApp = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <App />
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

export default MinimalApp;
