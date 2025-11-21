import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }).then(res => res.data),
  
  register: (email: string, password: string, name: string) =>
    api.post('/api/auth/register', { email, password, name }).then(res => res.data),
  
  getCurrentUser: () =>
    api.get('/api/auth/me').then(res => res.data.user),
  
  logout: () =>
    api.post('/api/auth/logout'),
};

export const messagesAPI = {
  send: (recipientEmail: string, subject: string, message: string) =>
    api.post('/api/messages/send', { recipientEmail, subject, message }).then(res => res.data),
  
  getInbox: (page: number = 1, limit: number = 20) =>
    api.get(`/api/messages/inbox?page=${page}&limit=${limit}`).then(res => res.data),
  
  getSent: (page: number = 1, limit: number = 20) =>
    api.get(`/api/messages/sent?page=${page}&limit=${limit}`).then(res => res.data),
  
  getMessage: (id: string) =>
    api.get(`/api/messages/${id}`).then(res => res.data),
  
  deleteMessage: (id: string) =>
    api.delete(`/api/messages/${id}`).then(res => res.data),
};

export const keysAPI = {
  getPublicKey: (email: string) =>
    api.get(`/api/keys/public/${email}`).then(res => res.data),
  
  rotateKeys: () =>
    api.post('/api/keys/rotate').then(res => res.data),
};

export const usersAPI = {
  search: (query: string) =>
    api.get(`/api/users/search?query=${query}`).then(res => res.data),
  
  updateProfile: (name: string) =>
    api.put('/api/users/profile', { name }).then(res => res.data),
};

export default api;
