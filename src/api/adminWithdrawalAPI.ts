import adminClient from './client'

// Types
export interface WithdrawalWithMember {
  id: string
  memberId: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  bankCode: string
  bankNumber: string
  bankName: string
  autoApproved: boolean
  memberPhone: string
  memberFullname: string
  memberCredit: number
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  remark?: string
}

export interface PendingWithdrawalsResponse {
  withdrawals: WithdrawalWithMember[]
  total: number
  page: number
  pageSize: number
}

export interface WithdrawalDetailsResponse {
  withdrawal: WithdrawalWithMember
  member: any
  recentWithdrawals: WithdrawalWithMember[]
  recentDeposits: any[]
  totalWithdrawals: number
  totalWithdrawalAmount: number
}

export interface ApproveWithdrawalRequest {
  paymentMethod?: 'manual' | 'auto'
  gateway?: string
  slipUrl?: string
  pinCode?: string
  remark?: string
}

export interface RejectWithdrawalRequest {
  reason: string
  pinCode?: string
}

export interface BulkApproveRequest {
  withdrawalIds: string[]
  paymentMethod?: 'manual' | 'auto'
  gateway?: string
  pinCode?: string
}

export interface AutoWithdrawalSettings {
  id: string
  enabled: boolean
  maxAutoAmount: number
  minMemberDeposits: number
  minAccountAgeDays: number
  requireBankVerification: boolean
  notifyAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateAutoWithdrawalSettingsRequest {
  enabled: boolean
  maxAutoAmount: number
  minMemberDeposits: number
  minAccountAgeDays: number
  requireBankVerification: boolean
  notifyAdmin: boolean
}

// Admin Withdrawal APIs
export const adminWithdrawalAPI = {
  // Get pending withdrawals
  getPendingWithdrawals: async (limit = 20, offset = 0): Promise<PendingWithdrawalsResponse> => {
    const response = await adminClient.get('/admin/withdrawals/pending', {
      params: { limit, offset },
    })
    return response.data.data
  },

  // Get withdrawal details
  getWithdrawalDetails: async (id: string): Promise<WithdrawalDetailsResponse> => {
    const response = await adminClient.get(`/admin/withdrawals/${id}`)
    return response.data.data
  },

  // Approve withdrawal
  approveWithdrawal: async (id: string, data?: ApproveWithdrawalRequest): Promise<void> => {
    await adminClient.post(`/admin/withdrawals/${id}/approve`, data || {})
  },

  // Reject withdrawal
  rejectWithdrawal: async (id: string, data: RejectWithdrawalRequest): Promise<void> => {
    await adminClient.post(`/admin/withdrawals/${id}/reject`, data)
  },

  // Bulk approve withdrawals
  bulkApproveWithdrawals: async (data: BulkApproveRequest): Promise<void> => {
    await adminClient.post('/admin/withdrawals/bulk-approve', data)
  },

  // Get withdrawal history
  getWithdrawalHistory: async (params?: {
    status?: string
    memberId?: string
    limit?: number
    offset?: number
  }): Promise<PendingWithdrawalsResponse> => {
    const response = await adminClient.get('/admin/withdrawals/history', { params })
    return response.data.data
  },

  // Get auto-approval settings
  getAutoSettings: async (): Promise<AutoWithdrawalSettings> => {
    const response = await adminClient.get('/admin/withdrawals/auto-settings')
    return response.data.data
  },

  // Update auto-approval settings
  updateAutoSettings: async (data: UpdateAutoWithdrawalSettingsRequest): Promise<AutoWithdrawalSettings> => {
    const response = await adminClient.put('/admin/withdrawals/auto-settings', data)
    return response.data.data
  },
}

export default adminWithdrawalAPI
