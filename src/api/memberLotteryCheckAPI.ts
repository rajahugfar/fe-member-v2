import { apiClient } from './client'

export interface CheckMultiplyRequest {
  huayId: number
  stockType: string
  huayOption: string
  poyNumber: string
  multiply: number
  value: number
}

export interface CheckMultiplyResponse {
  result: number // 1=ok, 2=reduced, 99=max reached
  multiply: number // actual multiply rate
  limitprice: number // max price can bet
  codition: string // description
  totalPoy?: number // times bought
  DAUmultiply?: number // max price per user
  isSpecialNumber?: boolean // true if in huay_limit (หวยอั๋น)
  soldAmount?: number // total sold for this number
  remainingAmount?: number // remaining available (for special numbers)
  maxSaleAmount?: number // max sale amount (p_price from huay_limit)
}

export const memberLotteryCheckAPI = {
  /**
   * Check multiply rate for a lottery bet
   * @param data - Check multiply request data
   */
  checkMultiply: async (data: CheckMultiplyRequest): Promise<CheckMultiplyResponse> => {
    const response = await apiClient.post('/member/lottery/check-multiply', data)
    return response.data.data
  }
}

export default memberLotteryCheckAPI
