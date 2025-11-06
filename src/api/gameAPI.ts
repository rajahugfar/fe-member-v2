import apiClient from './client'
import type { GameProvider, Game, GameLaunchResponse, GameCategory } from '../types/game'

export const gameAPI = {
  // Get all game providers
  getProviders: async (category?: GameCategory): Promise<GameProvider[]> => {
    const response = await apiClient.get('/games/providers', {
      params: { category },
    })
    return response.data
  },

  // Get games by provider
  getGamesByProvider: async (providerId: string): Promise<Game[]> => {
    const response = await apiClient.get(`/games/providers/${providerId}/games`)
    return response.data
  },

  // Get all games with filters
  getGames: async (params?: {
    category?: GameCategory
    providerId?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<{ games: Game[]; total: number }> => {
    const response = await apiClient.get('/games/list', { params })
    return response.data
  },

  // Launch game
  launchGame: async (gameId: string): Promise<GameLaunchResponse> => {
    const response = await apiClient.post(`/games/launch`, { gameId })
    return response.data
  },

  // Get game play history
  getGameHistory: async (params?: {
    limit?: number
    offset?: number
  }): Promise<any[]> => {
    const response = await apiClient.get('/games/history', { params })
    return response.data
  },
}
