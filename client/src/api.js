import axios from 'axios';
import { useAuthStore } from './store.js';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const instanceAPI = {
  create: (data) => api.post('/instances', data),
  getAll: () => api.get('/instances'),
  getById: (id) => api.get(`/instances/${id}`),
  update: (id, data) => api.put(`/instances/${id}`, data),
  delete: (id) => api.delete(`/instances/${id}`),
  reconnect: (id) => api.post(`/instances/${id}/reconnect`),
  getStatus: (id) => api.get(`/instances/${id}/status`),
  getQRCode: (id) => api.get(`/instances/${id}/status`), // Returns status + qr
};

export const userAPI = {
  create: (data) => api.post('/users', data),
  getByInstance: (instanceId) => api.get(`/users/instance/${instanceId}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  resetPasswordCustom: (id, password) => api.post(`/users/${id}/reset-password`, { password }),
  delete: (id) => api.delete(`/users/${id}`),
};

export const chatAPI = {
  getMyChats: () => api.get('/chats/agent/my-chats'),
  getInstanceChats: (instanceId) => api.get(`/chats/instance/${instanceId}`),
  getMessages: (chatId) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (chatId, content) => api.post(`/chats/${chatId}/send`, { content }),
  reassign: (chatId, newAgentId) => api.put(`/chats/${chatId}/reassign`, { newAgentId }),
  close: (chatId) => api.put(`/chats/${chatId}/close`),
};

export const clientAPI = {
  create: (data) => api.post('/clients', data),
  getByInstance: (instanceId) => api.get(`/clients/instance/${instanceId}`),
  startChat: (clientId) => api.post(`/clients/${clientId}/start-chat`),
};

export default api;
