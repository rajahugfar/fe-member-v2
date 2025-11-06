import React from 'react'
import { useMemberStore } from '@/store/memberStore'
import { FaWallet } from 'react-icons/fa'

interface CreditDisplayProps {
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({
  className = '',
  showIcon = true,
  size = 'md'
}) => {
  const { member } = useMemberStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (!member) return null

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <FaWallet className="text-yellow-400" />}
      <div className="flex items-baseline gap-1">
        <span className="text-white/70 text-xs">เครดิต:</span>
        <span className={`text-green-400 font-bold ${sizeClasses[size]}`}>
          {formatCurrency(member.credit)} ฿
        </span>
      </div>
    </div>
  )
}

export default CreditDisplay
