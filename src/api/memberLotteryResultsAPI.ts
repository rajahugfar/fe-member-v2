import { memberAPIClient } from './memberLotteryAPI'

export interface LotteryResultItem {
  id: number
  name: string
  huayCode: string
  icon: string
  has4d: boolean
  time: string
  status: number
  lotteryGroup: number
  result3Up: string
  result2Up: string
  result2Low: string
  result4Up: string
  result3Front: string
  result3Down: string
}

export interface LotteryResultsResponse {
  lotteries: LotteryResultItem[]
}

export const memberLotteryResultsAPI = {
  /**
   * Get lottery results for member
   */
  getResults: async (params?: { date?: string; status?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.date) queryParams.append('date', params.date)
    if (params?.status !== undefined) queryParams.append('status', params.status.toString())

    const response = await memberAPIClient.get<{ status: string; data: LotteryResultsResponse }>(
      `/lottery/results${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    )
    return response.data
  },
}

export default memberLotteryResultsAPI
