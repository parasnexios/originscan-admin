import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('originscan_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.payload) {
      if (response.data.payload.data !== undefined) {
        response.data.data = response.data.payload.data
      } else {
        response.data.data = response.data.payload
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('originscan_token')
      localStorage.removeItem('originscan_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
