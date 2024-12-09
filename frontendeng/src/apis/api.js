import axios from 'axios';

const BASE_URL = `https://386a-171-239-205-196.ngrok-free.app`;


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
  fetchRandomWordsByLevel: (levelId, userId) => apiClient.get('/api/random-words', { params: { levelId, userId } }),
  toggleFavoriteWord: (userId, wordId) => apiClient.post('/api/toggle-favorite-word', { userId, wordId }),
  fetchFavoriteWords: (userId) => apiClient.get('/api/favorite-words', { params: { userId } }),
  fetchTests: (userId) => apiClient.get('/test/quiz', { params: { userId } }),
  submitQuiz: (userId, answers) => apiClient.post('/test/submit', { userId, answers }),
  fetchWordGuess: (userId) => apiClient.get('/games/random-word-for-guess', { params: { userId } }),
  submitWordGuess: (userId, wordId, answer) => apiClient.post('/games/submit-answer', { userId, wordId, answer }),
  getWord: (id) => apiClient.get('/api/word-detail', { params: { id } }),
  fetchListeningPractice: (userId) => apiClient.get('/listen/getListeningPractice', { params: { userId } }),
  submitListeningPractice: (userId, answer) => apiClient.post('/listen/submitListeningPractice', { userId, answer }),
  fetchMostFavoritedWordsToday: (levelId) => apiClient.get('/api/most-favorited-words-today', { params: { levelId } }),
  updateUserName: (userId, name) => apiClient.put(`/account/users/updateUser`, { userId, name }),
  changePassword: (userId, oldPassword, newPassword) => apiClient.put('/account/users/changePassword', { userId, oldPassword, newPassword }),
  createFeedback: (userId, feedbackText) => apiClient.post('feedback/create', { userId, feedbackText }),
  getFeedbacks: (userId) => apiClient.get(`/feedback/getfeedbacks`, { params: { userId } }),
  requestPasswordReset: (email) => apiClient.post('/account/request-password-reset', { email }),
  verifyResetToken: (email, token) => apiClient.post('/account/verify-reset-token', { email, token }),
  resetPassword: (email, newPassword) => apiClient.post('/account/reset-password', { email, newPassword }),
};
