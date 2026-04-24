import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5179/api/dashboard',
});

export const getDashboard = async () => {
  const response = await api.get('/');
  return response.data;
};