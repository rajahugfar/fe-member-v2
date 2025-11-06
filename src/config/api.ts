export const API_URL = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || "http://localhost:3000"}'
export const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

export const getApiUrl = (path: string = '') => {
  return `${API_URL}${path}`
}

export const getFullApiUrl = (path: string) => {
  return `${API_URL}${API_BASE_PATH}${path}`
}
