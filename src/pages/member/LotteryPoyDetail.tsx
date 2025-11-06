import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiFileText, FiCalendar, FiClock, FiAward } from 'react-icons/fi'
import { memberLotteryAPI } from '@api/memberLotteryAPI'
import { toast } from 'react-hot-toast'

interface PoyItem {
  id: string
  numberBet: string
  betType: string
  price: number
  multiply: number
  winAmount: number
  isWin: boolean
}

interface PoyDetail {
  id: string
  stockId: number
  memberId: string
  huayId: number
  poyType: string
  poyName: string
  poyNumber: string
  dateBuy: string
  totalPrice: number
  winPrice: number
  balanceAfter: number
  note?: string
  status: number
  items: PoyItem[]
  // Results
  result3Up?: string
  result2Down?: string
  result3Front?: string
  result3Down?: string
}

const LotteryPoyDetail: React.FC = () => {
  const { poyId } = useParams<{ poyId: string }>()
  const navigate = useNavigate()
  const [poy, setPoy] = useState<PoyDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPoyDetail()
  }, [poyId])

  const loadPoyDetail = async () => {
    if (!poyId) return

    setLoading(true)
    try {
      const data = await memberLotteryAPI.getPoyDetail(poyId)
      setPoy(data)
    } catch (error: any) {
      console.error('Failed to load poy detail:', error)
      toast.error('ไม่สามารถโหลดข้อมูลโพยได้')
      navigate('/member/lottery')
    } finally {
      setLoading(false)
    }
  }

  const getBetTypeName = (betType: string): string => {
    const types: Record<string, string> = {
      'teng_bon_3': '3 ตัวบน',
      'teng_lang_3': '3 ตัวล่าง',
      'teng_lang_nha_3': '3 ตัวหน้า',
      'tode_3': '3 ตัวโต๊ด',
      'teng_bon_2': '2 ตัวบน',
      'teng_lang_2': '2 ตัวล่าง',
      'teng_bon_1': 'วิ่งบน',
      'teng_lang_1': 'วิ่งล่าง',
      'tode_4': '4 ตัวโต๊ด',
      'teng_bon_4': '4 ตัวบน'
    }
    return types[betType] || betType
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-rose-600/20 border border-red-400/30 rounded-lg text-red-300 font-semibold text-sm">
            ยกเลิกแล้ว
          </span>
        )
      case 1:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-400/30 rounded-lg text-yellow-300 font-semibold text-sm">
            รอออกผล
          </span>
        )
      case 2:
        return (
          <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg text-green-300 font-semibold text-sm">
            ออกผลแล้ว
          </span>
        )
      default:
        return null
    }
  }

  const getItemStatus = (item: PoyItem, status: number) => {
    if (status === 0) {
      return { label: 'ยกเลิก', style: 'bg-red-500/20 text-red-300 border-red-400/30' }
    }
    if (status === 1) {
      return { label: 'รอออกผล', style: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' }
    }
    if (item.isWin) {
      return { label: 'ถูกรางวัล', style: 'bg-green-500/20 text-green-300 border-green-400/30' }
    }
    return { label: 'ไม่ถูกรางวัล', style: 'bg-gray-500/20 text-gray-400 border-gray-400/30' }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-5xl text-purple-400"
        >
          <FiFileText />
        </motion.div>
      </div>
    )
  }

  if (!poy) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl text-white mb-2">ไม่พบข้อมูลโพย</h2>
          <button
            onClick={() => navigate('/member/lottery')}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate('/member/lottery')}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
            >
              <FiArrowLeft className="text-xl" />
              <span>กลับ</span>
            </button>

            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
              รายละเอียดโพย
            </h1>
          </motion.div>

          {/* Poy Header Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-900/95 via-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-2xl border border-purple-400/20 overflow-hidden mb-6"
          >
            {/* Poy Number Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-3 px-6 text-center border-b border-purple-400/30">
              <div className="flex items-center justify-center gap-2 text-white">
                <FiFileText className="text-xl" />
                <span className="text-lg font-semibold">โพยเลขที่ #{poy.poyNumber}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{poy.poyName}</span>
                  {getStatusBadge(poy.status)}
                </div>
                <div className="flex items-center justify-center md:justify-end gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="text-blue-400" />
                    <span>{formatDate(poy.dateBuy)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="text-blue-400" />
                    <span>{formatTime(poy.dateBuy)}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-4 border border-purple-400/20">
                  <p className="text-purple-300 text-sm mb-1 flex items-center gap-1">
                    <span>💰</span> ยอดแทง
                  </p>
                  <p className="text-white font-bold text-2xl">{poy.totalPrice.toFixed(2)}</p>
                  <p className="text-gray-500 text-xs">บาท</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-sm rounded-xl p-4 border border-green-400/20">
                  <p className="text-green-300 text-sm mb-1 flex items-center gap-1">
                    <span>🎁</span> ผลได้เสีย
                  </p>
                  <p className={`font-bold text-2xl ${poy.winPrice > 0 ? 'text-green-400' : 'text-white'}`}>
                    {poy.winPrice > 0 ? '+' : ''}{poy.winPrice.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-xs">บาท</p>
                </div>
              </div>

              {poy.note && (
                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl">
                  <p className="text-indigo-300 text-xs mb-1">หมายเหตุ</p>
                  <p className="text-gray-300 text-sm">{poy.note}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          {poy.status === 2 && (poy.result3Up || poy.result2Down) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-900/95 via-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-2xl border border-purple-400/20 overflow-hidden mb-6"
            >
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 py-3 px-6 text-center border-b border-yellow-400/30">
                <div className="flex items-center justify-center gap-2 text-white">
                  <FiAward className="text-xl" />
                  <span className="text-lg font-semibold">เลขที่ออก</span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {poy.result3Up && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">3 ตัวตรง</p>
                      <p className="text-3xl font-bold text-yellow-400">{poy.result3Up}</p>
                    </div>
                  )}
                  {poy.result2Down && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">2 ตัวล่าง</p>
                      <p className="text-3xl font-bold text-blue-400">{poy.result2Down}</p>
                    </div>
                  )}
                  {poy.result3Front && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">3 ตัวหน้า</p>
                      <p className="text-3xl font-bold text-green-400">{poy.result3Front}</p>
                    </div>
                  )}
                  {poy.result3Down && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">3 ตัวหลัง</p>
                      <p className="text-3xl font-bold text-pink-400">{poy.result3Down}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Items List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📋</span>
              รายการแทงทั้งหมด ({poy.items.length} รายการ)
            </h2>

            {/* Grid 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {poy.items.map((item, index) => {
                const status = getItemStatus(item, poy.status)
                const payout = item.price * item.multiply

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.02 }}
                    className="bg-gradient-to-br from-slate-900/95 via-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-xl border border-purple-400/20 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-purple-400/20 bg-black/20">
                      <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                      <span className={`px-2 py-0.5 rounded-lg border text-xs font-semibold ${status.style}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      {/* Number and Type */}
                      <div className="text-center mb-3">
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-1">
                          {item.numberBet}
                        </p>
                        <p className="text-gray-400 text-xs">{getBetTypeName(item.betType)}</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">เลขที่ออก</span>
                          <span className="text-yellow-300 font-semibold">
                            {poy.status === 2 ? (poy.result3Up || poy.result2Down || '-') : 'รอออกผล'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">ราคาจ่าย</span>
                          <span className="text-blue-300 font-semibold">{payout.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1.5 border-t border-purple-400/20">
                          <span className="text-gray-400">ราคาแทง</span>
                          <span className="text-white font-semibold">{item.price.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">ผลได้เสีย</span>
                          <span className={`font-bold ${item.winAmount > 0 ? 'text-green-400' : 'text-gray-300'}`}>
                            {item.winAmount > 0 ? '+' : ''}{item.winAmount.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LotteryPoyDetail
