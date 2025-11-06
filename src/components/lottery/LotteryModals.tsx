import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiCheck, FiDownload, FiRefreshCw, FiPlusCircle } from 'react-icons/fi'
import { FaCheckCircle } from 'react-icons/fa'
import html2canvas from 'html2canvas'
import { CartItem } from '@/hooks/useLotteryState'
import { formatNumber } from '@/utils/lotteryHelpers'

/**
 * Bulk Price Modal
 * Modal สำหรับใส่ราคาทั้งหมด
 */
interface BulkPriceModalProps {
  show: boolean
  onClose: () => void
  onApply: (price: number) => void
}

export const BulkPriceModal: React.FC<BulkPriceModalProps> = ({
  show,
  onClose,
  onApply
}) => {
  const [price, setPrice] = useState('')

  const handleApply = () => {
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) return

    onApply(priceNum)
    setPrice('')
    onClose()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 max-w-md w-full border-2 border-white/20 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">ใส่ราคาทั้งหมด</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white mb-2 block">จำนวนเงิน (บาท)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white text-lg focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="ใส่จำนวนเงิน"
              autoFocus
            />
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 5, 10, 20, 50, 100].map(amount => (
              <button
                key={amount}
                onClick={() => setPrice(amount.toString())}
                className="py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-yellow-400 text-white rounded-lg font-semibold transition-all"
              >
                {amount}฿
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleApply}
              disabled={!price || parseFloat(price) <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              ใส่ราคา
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Confirmation Modal
 * Modal สำหรับยืนยันก่อนส่งโพย
 */
interface ConfirmationModalProps {
  show: boolean
  onClose: () => void
  onConfirm: (note: string) => void
  cart: CartItem[]
  periodName: string
  huayName: string
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  cart,
  periodName,
  huayName
}) => {
  const [note, setNote] = useState('')

  const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0)
  const totalPotentialWin = cart.reduce((sum, item) => sum + item.potential_win, 0)

  // Group by bet type
  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.bet_type_label]) {
      acc[item.bet_type_label] = []
    }
    acc[item.bet_type_label].push(item)
    return acc
  }, {} as Record<string, CartItem[]>)

  const handleConfirm = () => {
    onConfirm(note)
    setNote('')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 max-w-2xl w-full border-2 border-white/20 shadow-2xl my-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">ยืนยันการแทง</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Lottery Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
          <div className="text-yellow-300 font-bold text-lg">{huayName}</div>
          <div className="text-white/70 text-sm">{periodName}</div>
        </div>

        {/* Cart Items */}
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar mb-4 space-y-3">
          {Object.entries(groupedCart).map(([betTypeLabel, items]) => (
            <div key={betTypeLabel} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white font-bold mb-3 flex items-center justify-between">
                <span>{betTypeLabel}</span>
                <span className="text-sm text-white/70">{items.length} รายการ</span>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-white/70">{idx + 1}. {item.number}</span>
                    <div className="flex gap-4">
                      <span className="text-white">{formatNumber(item.amount)} ฿</span>
                      <span className="text-green-400">→ {formatNumber(item.potential_win)} ฿</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl p-4 mb-4 border border-yellow-400/30">
          <div className="flex justify-between text-white mb-2">
            <span className="font-semibold">ยอดรวมทั้งหมด:</span>
            <span className="text-2xl font-bold text-yellow-300">{formatNumber(totalAmount)} ฿</span>
          </div>
          <div className="flex justify-between text-sm text-white/80">
            <span>ถ้าถูกทุกรายการ:</span>
            <span className="text-lg font-bold text-green-400">{formatNumber(totalPotentialWin)} ฿</span>
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="text-white mb-2 block">บันทึกช่วยจำ (ถ้ามี)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
            placeholder="📝 บันทึกช่วยจำ..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
          >
            กลับไปแก้ไข
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <FiCheck className="text-xl" />
            ยืนยันการแทง
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Success Modal
 * Modal แสดงผลสำเร็จพร้อมบันทึกภาพ
 */
interface SuccessModalProps {
  show: boolean
  onClose: () => void
  poyId: string
  cart: CartItem[]
  totalAmount: number
  totalPotentialWin: number
  periodName: string
  huayName: string
  note?: string
  onViewHistory: () => void
  onBetAgain: () => void
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  show,
  poyId,
  cart,
  totalAmount,
  totalPotentialWin,
  periodName,
  huayName,
  note,
  onViewHistory,
  onBetAgain
}) => {
  const [saving, setSaving] = useState(false)

  // Group by bet type
  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.bet_type_label]) {
      acc[item.bet_type_label] = []
    }
    acc[item.bet_type_label].push(item)
    return acc
  }, {} as Record<string, CartItem[]>)

  const handleSaveImage = async () => {
    setSaving(true)
    try {
      const element = document.getElementById('poy-capture')
      if (!element) return

      const canvas = await html2canvas(element, {
        backgroundColor: '#1e1b4b',
        scale: 2
      })

      const link = document.createElement('a')
      link.download = `lottery-poy-${poyId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Save image error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 max-w-2xl w-full border-2 border-white/20 shadow-2xl my-8"
      >
        {/* Success Icon */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <FaCheckCircle className="text-green-400 text-6xl mx-auto mb-4" />
          </motion.div>
          <h3 className="text-3xl font-bold text-white mb-2">ส่งโพยสำเร็จ!</h3>
          <p className="text-white/70">โพยเลขที่ #{poyId}</p>
        </div>

        {/* Capture Area */}
        <div id="poy-capture" className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 mb-6 border border-white/20">
          {/* Header */}
          <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/20">
            <div>
              <div className="text-yellow-300 font-bold text-xl">{huayName}</div>
              <div className="text-white/70 text-sm">{periodName}</div>
            </div>
            <div className="text-right">
              <div className="text-white/50 text-xs">โพยเลขที่</div>
              <div className="text-2xl font-bold text-white">#{poyId}</div>
            </div>
          </div>

          {/* Date Time */}
          <div className="text-sm text-white/60 mb-4">
            ทำรายการเมื่อ: {new Date().toLocaleString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Cart Items */}
          <div className="space-y-3 mb-4">
            {Object.entries(groupedCart).map(([betTypeLabel, items]) => (
              <div key={betTypeLabel} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-white font-semibold mb-2">{betTypeLabel}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {items.map((item, idx) => (
                    <div key={item.id} className="flex justify-between text-white/80">
                      <span>{idx + 1}. {item.number}</span>
                      <span className="text-yellow-300">{formatNumber(item.amount)}฿</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-green-600/20 rounded-lg p-4 border border-green-400/30">
            <div className="flex justify-between text-white mb-1">
              <span>ยอดรวม:</span>
              <span className="text-xl font-bold text-yellow-300">{formatNumber(totalAmount)} ฿</span>
            </div>
            <div className="flex justify-between text-sm text-white/80">
              <span>ถูกรางวัลได้:</span>
              <span className="text-green-400 font-bold">{formatNumber(totalPotentialWin)} ฿</span>
            </div>
          </div>

          {/* Note */}
          {note && (
            <div className="mt-4 bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-white/50 text-xs mb-1">📝 บันทึก</div>
              <div className="text-white text-sm">{note}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleSaveImage}
            disabled={saving}
            className="py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FiDownload />
            {saving ? 'กำลังบันทึก...' : 'บันทึกภาพ'}
          </button>
          <button
            onClick={onViewHistory}
            className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FiRefreshCw />
            ประวัติโพย
          </button>
          <button
            onClick={onBetAgain}
            className="py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <FiPlusCircle />
            แทงต่อ
          </button>
        </div>
      </motion.div>
    </div>
  )
}
