import apiClient from './client'
import type {
  Transaction,
  Deposit,
  Withdrawal,
  BankAccount,
  DepositRequest,
  WithdrawalRequest,
} from '../types/transaction'

export const transactionAPI = {
  // Get user balance
  getBalance: async (): Promise<{ balance: number }> => {
    const response = await apiClient.get('/user/balance')
    return response.data
  },

  // Get transaction history
  getTransactions: async (params?: {
    type?: string
    limit?: number
    offset?: number
  }): Promise<{ transactions: Transaction[]; total: number }> => {
    const response = await apiClient.get('/user/transactions', { params })
    return response.data
  },

  // Deposits
  createDeposit: async (data: DepositRequest): Promise<Deposit> => {
    const formData = new FormData()
    formData.append('amount', data.amount.toString())
    formData.append('channel', data.channel)
    if (data.slipImage) {
      formData.append('slipImage', data.slipImage)
    }

    const response = await apiClient.post('/deposits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getDeposits: async (params?: {
    limit?: number
    offset?: number
  }): Promise<{ deposits: Deposit[]; total: number }> => {
    const response = await apiClient.get('/deposits', { params })
    return response.data
  },

  getDepositById: async (id: string): Promise<Deposit> => {
    const response = await apiClient.get(`/deposits/${id}`)
    return response.data
  },

  // Withdrawals
  createWithdrawal: async (data: WithdrawalRequest): Promise<Withdrawal> => {
    const response = await apiClient.post('/withdrawals', data)
    return response.data
  },

  getWithdrawals: async (params?: {
    limit?: number
    offset?: number
  }): Promise<{ withdrawals: Withdrawal[]; total: number }> => {
    const response = await apiClient.get('/withdrawals', { params })
    return response.data
  },

  getWithdrawalById: async (id: string): Promise<Withdrawal> => {
    const response = await apiClient.get(`/withdrawals/${id}`)
    return response.data
  },

  cancelWithdrawal: async (id: string): Promise<void> => {
    await apiClient.post(`/withdrawals/${id}/cancel`)
  },

  // Bank accounts
  getBankAccounts: async (): Promise<BankAccount[]> => {
    const response = await apiClient.get('/user/bank-accounts')
    return response.data
  },

  addBankAccount: async (data: Omit<BankAccount, 'id' | 'userId' | 'createdAt'>): Promise<BankAccount> => {
    const response = await apiClient.post('/user/bank-accounts', data)
    return response.data
  },

  deleteBankAccount: async (id: string): Promise<void> => {
    await apiClient.delete(`/user/bank-accounts/${id}`)
  },

  setDefaultBankAccount: async (id: string): Promise<void> => {
    await apiClient.post(`/user/bank-accounts/${id}/set-default`)
  },
}
