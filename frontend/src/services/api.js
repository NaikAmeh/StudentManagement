// src/services/api.js
import axios from 'axios';

// Get the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('Base API URL:', API_BASE_URL);
// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// === Request Interceptor ===
// Adds the JWT token to the Authorization header for relevant requests
api.interceptors.request.use(
  (config) => {
    // Don't add token to auth endpoints
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      return config;
    }

    const token = localStorage.getItem('authToken'); // Or get from context/state manager
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// === Response Interceptor ===
// Handles common responses, like 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);

      if (error.response.status === 401) {
        // Unauthorized - Token might be invalid or expired
        console.warn('Unauthorized access detected (401). Clearing token and redirecting to login.');
        localStorage.removeItem('authToken'); // Or use auth context logout
        localStorage.removeItem('authUser');
        // Redirect to login page (use vanilla JS for simplicity here, or integrate with router history)
        // Check if already on login page to prevent loop
        if (window.location.pathname !== '/login') {
           window.location.href = '/login'; // Force reload to clear state
        }

      } else if (error.response.status === 403) {
        // Forbidden - User is authenticated but doesn't have permission
        console.warn('Forbidden access detected (403).');
        // Maybe show a notification or redirect to an unauthorized page
      }
       // Optionally re-throw a more specific error or return a structured error object
      // return Promise.reject(new Error(error.response.data?.message || error.message));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
       // Network error, server down, CORS issue?
       // return Promise.reject(new Error('Network error or server is not responding.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }

    // Return a rejected promise to propagate the error
    return Promise.reject(error);
  }
);


export default api;