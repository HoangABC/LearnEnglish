import axios from 'axios';

const BASE_URL = 'http://26.169.114.72:3000'; // Địa chỉ của server backend

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const api = {
  getWordsStatus1: () => apiClient.get('/api/words/status1'),
  getWordsStatus0: () => apiClient.get('/api/words/status0'),
  updateWordStatus: (id, newStatus) =>
    apiClient.put('/api/update-word-status', { id, newStatus }),
};
