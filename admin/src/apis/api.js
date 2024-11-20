import axios from 'axios';

const BASE_URL = 'http://192.168.1.100:3000'; 

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
};
