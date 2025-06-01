import axios from 'axios'

interface RefreshResponse {
  access: string
}

// Feature flag for test mode
const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true'

// Get the API URL from environment variables, with fallback for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Only use withCredentials in test mode
  withCredentials: TEST_MODE
})

// Helper function to ensure URLs start with /api
const ensureApiPrefix = (url: string) => {
  // Skip prefix for production URLs that already include the full path
  if (url.startsWith('http')) {
    return url
  }
  
  // Only add /api prefix in test mode
  if (TEST_MODE && !url.startsWith('/api/')) {
    return `/api${url.startsWith('/') ? url : `/${url}`}`
  }
  return url
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Ensure all URLs have /api prefix in test mode
  if (config.url && TEST_MODE) {
    config.url = ensureApiPrefix(config.url)
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post<RefreshResponse>(
          `${API_URL}/api/token/refresh/`,
          { refresh: refreshToken }
        )

        const { access } = response.data
        localStorage.setItem('token', access)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`
        }
        return api(originalRequest)
      } catch (error) {
        console.error('Token refresh failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
) 