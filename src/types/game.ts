export interface GameProvider {
  id: string
  code: string
  name: string
  logo: string
  status: 'active' | 'inactive' | 'maintenance'
  gameCount: number
  category: GameCategory
}

export type GameCategory = 'lottery' | 'slot' | 'casino' | 'sport' | 'fishing' | 'arcade'

export interface Game {
  id: string
  providerId: string
  providerCode: string
  providerName: string
  gameCode: string
  name: string
  image: string
  category: GameCategory
  type: string
  isHot: boolean
  isNew: boolean
  status: 'active' | 'inactive' | 'maintenance'
  minBet?: number
  maxBet?: number
}

export interface GameLaunchResponse {
  gameUrl: string
  sessionId: string
  expiresAt: string
}

export interface LotteryType {
  id: string
  name: string
  code: string
  description: string
  drawTime: string
  minBet: number
  maxBet: number
  payoutRates: Record<string, number>
  status: 'active' | 'inactive' | 'closed'
}

export interface LotteryBet {
  id: string
  userId: string
  lotteryTypeId: string
  lotteryTypeName: string
  drawDate: string
  numbers: string[]
  betType: string
  amount: number
  status: 'pending' | 'win' | 'lose' | 'cancelled'
  winAmount?: number
  createdAt: string
}
