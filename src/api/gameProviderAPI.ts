import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Public API client (no auth required)
const publicClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface GameProvider {
  id: number
  product_name: string
  description: string
  category: string
  game_type: string
  image_path: string
  status: number
  is_featured: boolean
  order_no: number
}

export interface GameProviderResponse {
  success: boolean
  data: GameProvider[]
}

export const gameProviderAPI = {
  /**
   * Get game providers from database
   * @param featured - If true, only return featured providers
   */
  getProviders: async (featured?: boolean): Promise<GameProviderResponse> => {
    const url = featured
      ? '/public/game-providers?featured=true'
      : '/public/game-providers'
    const response = await publicClient.get<GameProviderResponse>(url)
    return response.data
  },

  /**
   * Get providers by category
   * Note: Backend doesn't support category filter yet, so we filter client-side
   */
  getProvidersByCategory: async (category: string): Promise<GameProviderResponse> => {
    // Get all providers first
    const response = await publicClient.get<GameProviderResponse>('/public/game-providers')

    // Filter by category if not 'all' or 'new'
    if (category && category !== 'all' && category !== 'new') {
      const filtered = response.data.data.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      )
      return {
        success: response.data.success,
        data: filtered
      }
    }

    return response.data
  },
}

export default gameProviderAPI
