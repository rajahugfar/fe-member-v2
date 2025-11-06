import React from 'react'
import { FaDice } from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'
import { BET_TYPES } from '@/utils/lotteryHelpers'
import { LotteryRate } from '@api/memberLotteryAPI'

interface BetTypeSelectorProps {
  selectedBetType: string
  onSelect: (betType: string) => void
  rates: LotteryRate[]
  disabled?: boolean
}

const BetTypeSelector: React.FC<BetTypeSelectorProps> = ({
  selectedBetType,
  onSelect,
  rates,
  disabled = false
}) => {
  // Update bet type configs with actual rates from API
  const betTypeConfigs = Object.values(BET_TYPES).map(config => {
    const rate = rates.find(r => r.bet_type === config.id)
    if (rate) {
      return {
        ...config,
        multiply: rate.multiply,
        min: rate.min_bet,
        max: rate.max_bet
      }
    }
    return config
  })

  // Filter out bet types that don't have rates (disabled lottery types)
  const availableBetTypes = betTypeConfigs.filter(config =>
    rates.some(r => r.bet_type === config.id)
  )

  const selectedConfig = availableBetTypes.find(c => c.id === selectedBetType)

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-xl p-3 border-2 border-white/20 shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        <FaDice className="text-yellow-400 text-sm" />
        <h2 className="text-sm font-bold text-white">ประเภทการแทง</h2>
        {selectedConfig && (
          <span className="text-yellow-300 text-xs ml-auto">
            x{selectedConfig.multiply.toLocaleString()}
          </span>
        )}
      </div>

      {/* Bet Type Pills - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {availableBetTypes.map(config => {
          const isActive = selectedBetType === config.id
          const isDisabled = disabled

          return (
            <button
              key={config.id}
              onClick={() => !isDisabled && onSelect(config.id)}
              disabled={isDisabled}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-sm transition-all border-2
                ${isActive
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-white shadow-lg'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-yellow-400/50'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-1">
                <span>{config.label}</span>
                {isActive && <FiCheck className="text-xs" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Compact Info */}
      {selectedConfig && (
        <div className="flex gap-3 text-xs text-white/70 mt-2 pt-2 border-t border-white/10">
          <span>ต่ำสุด: <span className="text-white font-semibold">{selectedConfig.min}฿</span></span>
          <span>สูงสุด: <span className="text-white font-semibold">{selectedConfig.max.toLocaleString()}฿</span></span>
        </div>
      )}
    </div>
  )
}

export default BetTypeSelector
