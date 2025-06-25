import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.paysim-sandbox.com/v1',
  headers: {
    'Content-Type': 'application/json',
    // 'x-api-key': 'YOUR_API_KEY', // Uncomment and set for real API
  },
});

export default api; 