import axios from 'axios';

const BASE_URL = 'https://983e-171-239-30-182.ngrok-free.app'; 

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
  updateWordStatus: (id, newStatus) =>apiClient.put('/api/update-word-status', { id, newStatus }),
  addWord: (wordData) => apiClient.post('/api/add-word', wordData),
  editWord: (id, wordData) => apiClient.put(`/api/words/edit/${id}`, wordData),
  getAllUser: () => apiClient.get('/account/users'),
  login: (emailOrUsername, password) => apiClient.post('/ad/login', { emailOrUsername, password }),
  logout: () => apiClient.post('/ad/logout'),
  getAllFeedbacks: () => apiClient.get('/ad/feedbacks'),
  getFeedbackById: (id) => apiClient.get(`/ad/feedbacks/${id}`),
  getFeedbacksByUserId: (userId) => apiClient.get(`/ad/feedbacks/user/${userId}`),
  respondToFeedback: (feedbackId, responseText) => 
    apiClient.post('/ad/feedbacks/respond', { feedbackId, responseText }),
  getLearningStats: () => apiClient.get('/statistics/learning-stats'),
  getLevelDistribution: () => apiClient.get('/statistics/level-distribution'),
  updateUserStatus: (userId, status) => apiClient.put('/account/update-user-status', { userId, status }),
  getUsersByStatus1: () => apiClient.get('/account/users/status1'),
  getUsersByStatus0: () => apiClient.get('/account/users/status0'),
};
