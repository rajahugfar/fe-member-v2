import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api/v1'

// Member API Client
export const memberAPIClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}/member`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add member token from localStorage
memberAPIClient.interceptors.request.use(
  (config) => {
    // Try multiple token sources for compatibility
    const token = localStorage.getItem('memberToken') ||
                  localStorage.getItem('token') ||
                  JSON.parse(localStorage.getItem('member-storage') || '{}')?.state?.token

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
memberAPIClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear all member tokens
      localStorage.removeItem('memberToken')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('member-storage')

      // Redirect to member login page
      window.location.replace('/member/login')
    }
    return Promise.reject(error)
  }
)

// ============================================
// TypeScript Interfaces
// ============================================

export interface AvailableLottery {
  id: string
  lottery_code: string
  lottery_name: string
  lottery_type: 'government' | 'stock' | 'yeekee'
  is_active: boolean
  allow_4d: boolean
  has_open_period: boolean
}

export interface OpenPeriod {
  id: string
  name: string
  round?: string
  closeTime: string
  resultTime: string
  huayCode: string
  icon?: string
  // Legacy fields for backward compatibility
  lotteryId?: number
  huayName?: string
  huayGroup?: number
  periodName?: string
  periodDate?: string
  openTime?: string
  drawTime?: string
  status?: 'OPEN'
  totalBetAmount?: number
  totalPayoutAmount?: number
  totalProfit?: number
  createdAt?: string
  updatedAt?: string
}

export interface LotteryRate {
  id: string
  bet_type: string
  multiply: number
  min_bet: number
  max_bet: number
  max_per_number: number
  is_active: boolean
}

export interface PlaceBetRequest {
  period_id: string
  bet_type: string
  number: string
  amount: number
}

export interface PlaceBulkBetsRequest {
  stockId: number
  bets: {
    betType: string
    number: string
    amount: number
  }[]
  note: string
}

export interface PlaceBulkBetsResponse {
  poyId: string
  poyNumber: string
  totalBets: number
  totalPrice: number
}

export interface BetResponse {
  id: string
  period_id: string
  bet_type: string
  number: string
  amount: number
  payout_rate: number
  status: 'PENDING'
  created_at: string
}

export interface MyBet {
  id: string
  lottery_code: string
  lottery_name: string
  lottery_type: string
  period_id: string
  period_name: string
  period_date: string
  bet_type: string
  number: string
  amount: number
  payout_rate: number
  status: 'PENDING' | 'WIN' | 'LOSE' | 'CANCELLED'
  win_amount?: number
  result_3d_top?: string
  result_3d_bottom?: string
  result_2d_top?: string
  result_2d_bottom?: string
  result_4d?: string
  announced_at?: string
  created_at: string
  cancelled_at?: string
}

// ============================================
// Member Lottery API
// ============================================

export const memberLotteryAPI = {
  // Get available lotteries with open periods
  getAvailableLotteries: async (): Promise<AvailableLottery[]> => {
    const response = await memberAPIClient.get('/lottery/available')
    return response.data.data
  },

  // Get active lotteries from stock_master
  getOpenPeriods: async (lotteryCode?: string): Promise<OpenPeriod[]> => {
    const response = await memberAPIClient.get('/lottery/active', {
      params: {
        status: 'ACTIVE',
        limit: 100,
        ...(lotteryCode ? { lottery_code: lotteryCode } : {})
      }
    })

    // Transform response to match OpenPeriod interface
    const lotteries = response.data.data || []
    return lotteries.map((lottery: any) => ({
      id: String(lottery.id),
      name: lottery.name,
      round: lottery.round,
      closeTime: lottery.closeTime,
      resultTime: lottery.resultTime,
      huayCode: lottery.huayCode,
      icon: lottery.icon,
      // Add computed fields for backward compatibility
      huayName: lottery.name,
      periodName: lottery.round || lottery.name,
      drawTime: lottery.resultTime,
      status: 'OPEN' as const
    }))
  },

  // Get lottery payout rates
  getLotteryRates: async (lotteryCode: string): Promise<LotteryRate[]> => {
    const response = await memberAPIClient.get(`/lottery/${lotteryCode}/rates`)
    return response.data.data
  },

  // Place single bet
  placeBet: async (data: PlaceBetRequest): Promise<BetResponse> => {
    const response = await memberAPIClient.post('/lottery/bet', data)
    return response.data.data
  },

  // Place multiple bets at once with poy
  placeBulkBets: async (request: PlaceBulkBetsRequest): Promise<PlaceBulkBetsResponse> => {
    const response = await memberAPIClient.post('/lottery/bet/bulk', request)
    return response.data.data
  },

  // Get my betting history
  getMyBets: async (params?: {
    lottery_code?: string
    period_id?: string
    status?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }): Promise<{ bets: MyBet[]; total: number }> => {
    const response = await memberAPIClient.get('/lottery/my-bets', { params })
    return response.data.data
  },

  // Cancel bet (only if period still OPEN)
  cancelBet: async (id: string): Promise<{ message: string }> => {
    const response = await memberAPIClient.post(`/lottery/bet/${id}/cancel`)
    return response.data.data
  },

  // Get poy history (lottery slips with items)
  getPoyHistory: async (params?: {
    stockId?: number
    limit?: number
    offset?: number
  }): Promise<any[]> => {
    const response = await memberAPIClient.get('/lottery/history', { params })
    return response.data.data || []
  },

  // Cancel poy (within 30 minutes)
  cancelPoy: async (poyId: string): Promise<{ message: string }> => {
    const response = await memberAPIClient.post(`/lottery/poy/${poyId}/cancel`)
    return response.data
  },

  // Get poy detail with items and results
  getPoyDetail: async (poyId: string): Promise<any> => {
    const response = await memberAPIClient.get(`/lottery/poy/${poyId}`)
    return response.data.data
  },
}

export default memberLotteryAPI
