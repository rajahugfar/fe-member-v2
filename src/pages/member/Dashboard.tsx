import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiDollarSign,
  FiTrendingUp,
  FiGrid,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiZap,
  FiStar,
  FiAward,
} from 'react-icons/fi'
import { GiTwoCoins, GiDiamonds, GiCrystalBall, GiMagicSwirl, GiSparkles } from 'react-icons/gi'
import { transactionAPI, lotteryAPI } from '../../api/memberAPI'
import { useMemberStore } from '../../store/memberStore'
import toast from 'react-hot-toast'

const Dashboard: React.FC = () => {
  const { member } = useMemberStore()
  const [summary, setSummary] = useState<any>({
    todayDeposit: 0,
    todayWithdrawal: 0,
    todayBet: 0,
    todayWin: 0,
    todayProfit: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [activeLotteries, setActiveLotteries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [summaryRes, transactionsRes, lotteriesRes] = await Promise.all([
        transactionAPI.getDashboardSummary(),
        transactionAPI.getRecentTransactions(5),
        lotteryAPI.getLotteries({ status: 'ACTIVE', limit: 5 }),
      ])

      console.log('Summary response:', summaryRes.data)
      console.log('Transactions response:', transactionsRes.data)
      console.log('Lotteries response:', lotteriesRes.data)

      setSummary(summaryRes.data?.data || summaryRes.data || summary)

      // Handle transactions response - ensure it's an array
      const transactionsData = transactionsRes.data?.data || transactionsRes.data
      setRecentTransactions(Array.isArray(transactionsData) ? transactionsData : [])

      setActiveLotteries(lotteriesRes.data?.lotteries || lotteriesRes.data?.data || [])
    } catch (error) {
      console.error('Load dashboard error:', error)
      toast.error('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      PENDING: { color: 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-amber-500/20', label: 'รอดำเนินการ', icon: FiClock },
      SUCCESS: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-500/20', label: 'สำเร็จ', icon: FiCheckCircle },
      COMPLETED: { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-500/20', label: 'สำเร็จ', icon: FiCheckCircle },
      FAILED: { color: 'bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-rose-500/20', label: 'ไม่สำเร็จ', icon: FiXCircle },
      REJECTED: { color: 'bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-rose-500/20', label: 'ถูกปฏิเสธ', icon: FiXCircle },
      CANCELLED: { color: 'bg-slate-500/20 text-slate-300 border-slate-400/40 shadow-slate-500/20', label: 'ยกเลิก', icon: FiXCircle },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-lg ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    )
  }

  const getTransactionTypeLabel = (type: string) => {
    const types: any = {
      DEPOSIT: 'ฝากเงิน',
      WITHDRAWAL: 'ถอนเงิน',
      BET: 'แทงหวย/เกม',
      WIN: 'ถูกรางวัล',
      BONUS: 'โบนัส',
      TRANSFER_IN: 'โอนเข้า',
      TRANSFER_OUT: 'โอนออก',
      REFUND: 'คืนเงิน'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
          <GiMagicSwirl className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" size={32} />
        </div>
        <p className="text-purple-300 font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Epic Welcome Banner with Fantasy Theme */}
      <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 rounded-3xl p-8 shadow-[0_0_60px_rgba(139,92,246,0.5)] border-2 border-purple-500/30 overflow-hidden group">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }} />
          <div className="absolute top-20 right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        </div>

        {/* Sparkle effects */}
        <GiSparkles className="absolute top-4 right-4 text-yellow-300 animate-pulse" size={32} />
        <GiSparkles className="absolute bottom-4 left-8 text-purple-300 animate-pulse" size={24} style={{ animationDelay: '0.5s' }} />
        <GiDiamonds className="absolute top-1/2 right-12 text-cyan-300 animate-bounce" size={28} style={{ animationDuration: '3s' }} />

        <div className="relative z-10 flex items-center gap-6">
          <div className="hidden md:flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.6)] group-hover:scale-110 transition-transform duration-300">
            <GiCrystalBall className="text-white" size={40} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
              ยินดีต้อนรับ, {member?.fullname || 'นักผจญภัย'}! 🌟
            </h1>
            <p className="text-purple-200 text-lg font-medium flex items-center gap-2">
              <GiMagicSwirl className="animate-spin" style={{ animationDuration: '3s' }} />
              ขอให้โชคดีในวันนี้ เพิ่มโชค
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-4 border border-yellow-400/30">
            <GiTwoCoins className="text-yellow-400 animate-bounce" size={32} style={{ animationDuration: '2s' }} />
            <div>
              <p className="text-purple-200 text-xs mb-1">ยอดเงินคงเหลือ</p>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                ฿{formatCurrency(member?.credit || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Magical Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/member/deposit"
          className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-2xl p-6 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all duration-300 group overflow-hidden border-2 border-emerald-400/30"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <GiSparkles className="absolute top-2 right-2 text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" size={20} />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <FiDollarSign className="text-white" size={32} />
            </div>
            <div>
              <span className="text-white font-bold text-lg block">ฝากเงิน</span>
              <span className="text-emerald-200 text-xs">เติมเครดิต</span>
            </div>
          </div>
        </Link>

        <Link
          to="/member/withdrawal"
          className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-300 group overflow-hidden border-2 border-blue-400/30"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <GiSparkles className="absolute top-2 right-2 text-blue-200 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" size={20} />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <FiTrendingUp className="text-white" size={32} />
            </div>
            <div>
              <span className="text-white font-bold text-lg block">ถอนเงิน</span>
              <span className="text-blue-200 text-xs">รับรางวัล</span>
            </div>
          </div>
        </Link>

        <Link
          to="/member/lottery"
          className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-2xl p-6 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300 group overflow-hidden border-2 border-purple-400/30"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <GiSparkles className="absolute top-2 right-2 text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" size={20} />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <GiCrystalBall className="text-white" size={32} />
            </div>
            <div>
              <span className="text-white font-bold text-lg block">แทงหวย</span>
              <span className="text-purple-200 text-xs">ทำนายโชค</span>
            </div>
          </div>
        </Link>

        <Link
          to="/member/games"
          className="relative bg-gradient-to-br from-pink-600 via-pink-700 to-pink-800 rounded-2xl p-6 hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] transition-all duration-300 group overflow-hidden border-2 border-pink-400/30"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <GiSparkles className="absolute top-2 right-2 text-pink-200 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" size={20} />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <FiGrid className="text-white" size={32} />
            </div>
            <div>
              <span className="text-white font-bold text-lg block">เล่นเกม</span>
              <span className="text-pink-200 text-xs">ผจญภัย</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Mystical Stats Section */}
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 flex items-center gap-3">
            <GiDiamonds className="text-purple-400" size={28} />
            สถิติวันนี้
          </h2>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 rounded-xl text-purple-200 hover:text-white transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
          >
            <FiRefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-medium">รีเฟรช</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="relative bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 backdrop-blur-lg border-2 border-emerald-400/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 group">
            <div className="absolute top-2 right-2">
              <FiArrowDown className="text-emerald-300 opacity-30 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
            <div className="flex items-center gap-2 text-emerald-300 mb-3">
              <GiTwoCoins size={20} />
              <span className="text-sm font-bold">ฝากวันนี้</span>
            </div>
            <p className="text-3xl font-black text-white drop-shadow-lg">
              ฿{formatCurrency(summary.todayDeposit)}
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-lg border-2 border-blue-400/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 group">
            <div className="absolute top-2 right-2">
              <FiArrowUp className="text-blue-300 opacity-30 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
            <div className="flex items-center gap-2 text-blue-300 mb-3">
              <FiZap size={20} />
              <span className="text-sm font-bold">ถอนวันนี้</span>
            </div>
            <p className="text-3xl font-black text-white drop-shadow-lg">
              ฿{formatCurrency(summary.todayWithdrawal)}
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-lg border-2 border-purple-400/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 group">
            <div className="absolute top-2 right-2">
              <GiCrystalBall className="text-purple-300 opacity-30 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
            <div className="flex items-center gap-2 text-purple-300 mb-3">
              <FiGrid size={20} />
              <span className="text-sm font-bold">แทงหวย</span>
            </div>
            <p className="text-3xl font-black text-white drop-shadow-lg">
              ฿{formatCurrency(summary.todayBet)}
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-amber-900/50 to-amber-800/30 backdrop-blur-lg border-2 border-amber-400/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 group">
            <div className="absolute top-2 right-2">
              <FiStar className="text-amber-300 opacity-30 group-hover:opacity-100 transition-opacity animate-pulse" size={24} />
            </div>
            <div className="flex items-center gap-2 text-amber-300 mb-3">
              <FiAward size={20} />
              <span className="text-sm font-bold">ถูกรางวัล</span>
            </div>
            <p className="text-3xl font-black text-white drop-shadow-lg">
              ฿{formatCurrency(summary.todayWin)}
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-pink-900/50 to-pink-800/30 backdrop-blur-lg border-2 border-pink-400/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(236,72,153,0.2)] hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all duration-300 group">
            <div className="absolute top-2 right-2">
              <FiTrendingUp className="text-pink-300 opacity-30 group-hover:opacity-100 transition-opacity" size={24} />
            </div>
            <div className="flex items-center gap-2 text-pink-300 mb-3">
              <GiDiamonds size={20} />
              <span className="text-sm font-bold">กำไร/ขาดทุน</span>
            </div>
            <p className={`text-3xl font-black drop-shadow-lg ${summary.todayProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {summary.todayProfit >= 0 ? '+' : ''}฿{formatCurrency(summary.todayProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Enchanted Transactions & Lotteries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions - Scroll of History */}
        <div className="relative bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-lg border-2 border-indigo-400/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 flex items-center gap-2">
              <GiMagicSwirl className="text-indigo-400" size={24} />
              ประวัติการทำรายการ
            </h2>
            <Link
              to="/member/transactions"
              className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors font-bold flex items-center gap-1 group"
            >
              ดูทั้งหมด
              <FiArrowUp className="group-hover:translate-x-1 transition-transform" size={14} />
            </Link>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-900/20">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <GiCrystalBall className="mx-auto text-indigo-400/30 mb-3" size={48} />
                <p className="text-white/60 font-medium">ยังไม่มีรายการ</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 group"
                >
                  <div className="flex-1">
                    <p className="text-white font-bold mb-1 flex items-center gap-2">
                      {getTransactionTypeLabel(transaction.type)}
                      {['WIN', 'BONUS'].includes(transaction.type) && (
                        <GiSparkles className="text-yellow-400 animate-pulse" size={16} />
                      )}
                    </p>
                    <p className="text-sm text-white/50">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className={`text-lg font-black ${
                      ['DEPOSIT', 'WIN', 'BONUS', 'REFUND'].includes(transaction.type)
                        ? 'text-emerald-300'
                        : 'text-rose-300'
                    }`}>
                      {['DEPOSIT', 'WIN', 'BONUS', 'REFUND'].includes(transaction.type) ? '+' : '-'}
                      ฿{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Lotteries - Crystal Ball */}
        <div className="relative bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg border-2 border-purple-400/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 flex items-center gap-2">
              <GiCrystalBall className="text-purple-400 animate-pulse" size={24} />
              หวยที่เปิดรับ
            </h2>
            <Link
              to="/member/lottery"
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors font-bold flex items-center gap-1 group"
            >
              แทงเลย
              <FiZap className="group-hover:scale-125 transition-transform" size={14} />
            </Link>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-900/20">
            {activeLotteries.length === 0 ? (
              <div className="text-center py-12">
                <GiCrystalBall className="mx-auto text-purple-400/30 mb-3 animate-bounce" size={48} style={{ animationDuration: '3s' }} />
                <p className="text-white/60 font-medium">ไม่มีหวยที่เปิดรับ</p>
              </div>
            ) : (
              activeLotteries.map((lottery) => (
                <Link
                  key={lottery.id}
                  to="/member/lottery"
                  className="block p-5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 border-2 border-purple-500/30 hover:border-purple-400/60 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GiSparkles className="text-yellow-400 group-hover:animate-spin" size={20} />
                        <p className="text-white font-bold text-lg">{lottery.name}</p>
                      </div>
                      <p className="text-sm text-purple-200">
                        งวดวันที่ {formatDate(lottery.drawDate)}
                      </p>
                    </div>
                    <div className="text-right bg-black/30 rounded-xl px-4 py-2 border border-yellow-400/20">
                      <p className="text-xs text-yellow-300 mb-1 font-bold">ปิดรับ</p>
                      <p className="text-sm text-yellow-400 font-black">
                        {formatDate(lottery.closeTime)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Magical Promotions */}
      <div className="relative bg-gradient-to-br from-orange-900/40 via-amber-900/40 to-yellow-900/40 backdrop-blur-lg border-2 border-amber-400/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.3)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
        <GiSparkles className="absolute top-4 right-4 text-amber-300 animate-pulse" size={32} />
        <GiSparkles className="absolute bottom-6 left-6 text-yellow-300 animate-pulse" size={24} style={{ animationDelay: '0.5s' }} />

        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-200 mb-6 flex items-center gap-3">
          <FiAward className="text-amber-400" size={28} />
          โปรโมชั่นพิเศษ
        </h2>
        <div className="space-y-4">
          <div className="relative p-5 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 hover:from-amber-600/30 hover:to-yellow-600/30 rounded-xl border-2 border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 group">
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full animate-bounce shadow-lg">
              HOT!
            </div>
            <h3 className="text-white font-black text-lg mb-2 flex items-center gap-2">
              🎉 รับโบนัส 100% สำหรับสมาชิกใหม่!
            </h3>
            <p className="text-sm text-amber-100 mb-3">
              ฝากครั้งแรกรับโบนัสเพิ่มทันที 100% สูงสุด 5,000 บาท
            </p>
            <Link
              to="/member/promotions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold rounded-lg shadow-lg hover:shadow-amber-500/50 transition-all duration-300"
            >
              ดูรายละเอียด
              <FiArrowUp className="group-hover:translate-x-1 transition-transform" size={16} />
            </Link>
          </div>
          <div className="relative p-5 bg-gradient-to-r from-emerald-600/20 to-green-600/20 hover:from-emerald-600/30 hover:to-green-600/30 rounded-xl border-2 border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 group">
            <h3 className="text-white font-black text-lg mb-2 flex items-center gap-2">
              💰 คืนยอดเสีย 10% ทุกวัน
            </h3>
            <p className="text-sm text-emerald-100 mb-3">
              เล่นเสียไม่ต้องกังวล คืนให้ 10% ทุกวัน ไม่มีเงื่อนไข
            </p>
            <Link
              to="/member/promotions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
            >
              ดูรายละเอียด
              <FiArrowUp className="group-hover:translate-x-1 transition-transform" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
