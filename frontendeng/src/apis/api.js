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
  addWord: (word, definition, phonetic = '', example = '') => apiClient.post('/api/words', { word, definition, phonetic, example }),  
  searchWord: (keyword) => apiClient.get('/api/search', { params: { keyword } }),
  updateUserLevel: (id, levelId) => apiClient.put(`/account/users/${id}/level`, { levelId }),
  fetchLevels: () => apiClient.get('/account/levels'),
  fetchRandomWordsByLevel: (levelId) => apiClient.get('/api/random-words', { params: { levelId } }),
  toggleFavoriteWord: (userId, wordId) => apiClient.post('/api/toggle-favorite-word', { userId, wordId }),
  fetchFavoriteWords: (userId) => apiClient.get('/api/favorite-words', { params: { userId } }),
  fetchTests: (userId) => apiClient.get('/test/quiz', { params: { userId } }),
  submitQuiz: (userId, answers) => apiClient.post('/test/submit', { userId, answers }),
  fetchWordGuess: (userId) => apiClient.get('/games/random-word-for-guess', { params: { userId } }),
  submitWordGuess: (userId, wordId, answer) => apiClient.post('/games/submit-answer', { userId, wordId, answer }),
};
