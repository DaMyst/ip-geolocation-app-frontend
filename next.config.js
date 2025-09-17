module.exports = {
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    REACT_APP_MAPBOX_ACCESS_TOKEN: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
  },
  // Add any other Next.js config here
};
