import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Public Lottery API - no auth required
const publicLotteryAPI = axios.create({
  baseURL: `${API_URL}/api/v1/lottery`,
  headers: { 'Content-Type': 'application/json' }
})

export interface DailyResult {
  id: number
  name: string
  huayCode: string
  icon: string
  has4d: boolean
  time: string
  status: number // 1=OPEN, 2=CLOSED_WITH_RESULT, 3=CANCELLED
  lotteryGroup: number
  stockType: number
  result3Up: string
  result2Up: string
  result2Low: string
  result4Up: string
  resultFull: string
  result3Front: string
  result3Down: string
}

export const publicLotteryResultsAPI = {
  /**
   * Get today's lottery results (public endpoint)
   */
  getTodayResults: async (date?: string): Promise<DailyResult[]> => {
    const targetDate = date || new Date().toISOString().split('T')[0]
    const response = await publicLotteryAPI.get(`/results/daily?date=${targetDate}`)
    return response.data.data || []
  },
}

export default publicLotteryResultsAPI
