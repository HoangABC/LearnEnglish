import axios from 'axios';

const BASE_URL = `http://26.169.114.72:3000`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const api = {
  login: (emailOrUsername, password) => apiClient.post('/account/login', { emailOrUsername, password }),
  register: (name, username, email, password) => apiClient.post('/account/register', { name, username, email, password }), 
  fetchCustomers: () => apiClient.get('/api/customers'),
  logout: () => apiClient.post('/account/logout'),
  googleLogin: (token) => apiClient.post('/auth/google/login', { token }),
  addWord: (word, definition, phonetic = '', example = '') => 
    apiClient.post('/api/words', { word, definition, phonetic, example }),  
  searchWord: (keyword) => apiClient.get('/api/search', { params: { keyword } }),
};
