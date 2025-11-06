import apiClient from './client'

// Types
export interface WithdrawalBalance {
  credit: number
  creditGame: number
}

export interface Withdrawal {
  id: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  bankAccount: string
  bankCode: string
  accountName: string
  createdAt: string
  approvedAt?: string
  remark?: string
}

export interface CreateWithdrawalRequest {
  amount: number
}

export interface WithdrawalHistoryParams {
  limit?: number
  offset?: number
  status?: string
}

// Member Withdrawal APIs
export const withdrawalAPI = {
  // Get member balance
  getBalance: async (): Promise<WithdrawalBalance> => {
    const response = await apiClient.get('/member/balance')
    return response.data.data
  },

  // Create withdrawal request
  createWithdrawal: async (data: CreateWithdrawalRequest): Promise<Withdrawal> => {
    const response = await apiClient.post('/member/withdrawals', data)
    return response.data.data
  },

  // Get withdrawal history
  getWithdrawalHistory: async (params?: WithdrawalHistoryParams): Promise<Withdrawal[]> => {
    const response = await apiClient.get('/member/withdrawals', { params })
    return response.data.data
  },
}

export default withdrawalAPI
