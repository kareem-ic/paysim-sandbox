import axios, { AxiosError, AxiosResponse } from 'axios';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add authentication
api.interceptors.request.use(
  (config) => {
    // Add API key to all requests
    if (API_KEY) {
      config.headers['x-api-key'] = API_KEY;
    }
    
    // Add idempotency key for POST requests
    if (config.method === 'post') {
      config.headers['X-Idempotency-Key'] = generateIdempotencyKey();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Authentication failed. Please check your API key.');
          break;
        case 403:
          console.error('Access forbidden. Insufficient permissions.');
          break;
        case 429:
          console.error('Rate limit exceeded. Please try again later.');
          break;
        case 500:
          console.error('Server error. Please try again later.');
          break;
        default:
          console.error(`API Error ${status}:`, data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error. Please check your connection.');
    } else {
      // Other error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generate a unique idempotency key
function generateIdempotencyKey(): string {
  return `idemp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// API endpoints
export const endpoints = {
  // Payment endpoints
  authorize: '/payments/authorize',
  capture: '/payments/capture',
  refund: '/payments/refund',
  
  // Health check
  health: '/health',
  
  // Mock endpoints for frontend (these would be replaced with real endpoints)
  transactions: '/mock/transactions',
  metrics: '/mock/metrics',
  webhooks: '/mock/webhooks',
  webhookEndpoints: '/mock/webhook-endpoints',
};

export default api; 