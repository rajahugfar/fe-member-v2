import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAdminStore } from '@store/adminStore'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

export const adminClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add admin auth token
adminClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = useAdminStore.getState()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
adminClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message: string }>) => {
    // If error is 401, logout admin
    if (error.response?.status === 401) {
      useAdminStore.getState().logout()
      toast.error('กรุณาเข้าสู่ระบบอีกครั้ง')
      window.location.href = '/admin/login'
      return Promise.reject(error)
    }

    // Handle other errors
    const message = error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'

    // Don't show toast for specific error codes (let component handle it)
    const silentErrorCodes = [400, 404, 422]
    if (!silentErrorCodes.includes(error.response?.status || 0)) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default adminClient
