import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5179/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('controlmed_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;