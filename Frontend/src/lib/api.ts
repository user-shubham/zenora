
import axios from 'axios'
import { useAuthStore } from './store'

// Base URL for all API requests
const API_BASE_URL = 'https://api.zenora.example' // Replace with actual API URL when available

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },

  signup: async (name: string, email: string, password: string) => {
    const response = await api.post('/api/auth/signup', { name, email, password })
    return response.data
  },
}

// Assessment services
export const assessmentService = {
  saveAssessment: async (data: any) => {
    const response = await api.post('/api/assessments', data)
    return response.data
  },

  getAssessments: async () => {
    const response = await api.get('/api/assessments')
    return response.data
  },
}

// Journal services
export const journalService = {
  saveJournal: async (data: any) => {
    const response = await api.post('/api/journal', data)
    return response.data
  },

  getJournals: async () => {
    const response = await api.get('/api/journal')
    return response.data
  },
}

// Chat services
export const chatService = {
  sendMessage: async (message: string) => {
    const response = await api.post('/api/chat', { message })
    return response.data
  },

  getMessages: async () => {
    const response = await api.get('/api/chat')
    return response.data
  },
}

export default api
