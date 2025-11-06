import React, { useState, useEffect } from 'react'
import { FiFilter, FiDownload, FiArrowDown, FiArrowUp, FiGrid, FiDollarSign } from 'react-icons/fi'
import { transactionAPI } from '../../api/memberAPI'
import { toast } from 'react-hot-toast'

const TRANSACTION_TYPES = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'DEPOSIT', label: 'ฝากเงิน' },
  { value: 'WITHDRAWAL', label: 'ถอนเงิน' },
  { value: 'BET', label: 'แทง' },
  { value: 'WIN', label: 'ถูกรางวัล' },
  { value: 'BONUS', label: 'โบนัส' },
  { value: 'TRANSFER', label: 'โอน' },
]

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  })
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, netProfit: 0 })
  const [pagination, setPagination] = useState({ limit: 50, offset: 0, total: 0 })

  useEffect(() => {
    loadTransactions()
  }, [filters, pagination.offset])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const response = await transactionAPI.getAllTransactions({
        type: filters.type as 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'BONUS' | 'TRANSFER' | 'REFUND' | undefined,
        status: filters.status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: pagination.limit,
        offset: pagination.offset
      })
      setTransactions(response.data.transactions || [])
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }))

      // Calculate summary
      const totalIn = response.data.transactions
        ?.filter((t: any) => ['DEPOSIT', 'WIN', 'BONUS', 'REFUND'].includes(t.type))
        ?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0
      const totalOut = response.data.transactions
        ?.filter((t: any) => ['WITHDRAWAL', 'BET', 'TRANSFER_OUT'].includes(t.type))
        ?.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0

      setSummary({ totalIn, totalOut, netProfit: totalIn - totalOut })
    } catch (error) {
      console.error('Load transactions error:', error)
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
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getTypeIcon = (type: string) => {
    const icons: any = {
      DEPOSIT: { icon: FiArrowDown, color: 'text-green-400' },
      WITHDRAWAL: { icon: FiArrowUp, color: 'text-red-400' },
      BET: { icon: FiGrid, color: 'text-orange-400' },
      WIN: { icon: FiDollarSign, color: 'text-green-400' },
      BONUS: { icon: FiDollarSign, color: 'text-purple-400' },
      TRANSFER_IN: { icon: FiArrowDown, color: 'text-blue-400' },
      TRANSFER_OUT: { icon: FiArrowUp, color: 'text-blue-400' },
    }
    const config = icons[type] || { icon: FiDollarSign, color: 'text-white' }
    const Icon = config.icon
    return <Icon className={config.color} size={20} />
  }

  const getTypeLabel = (type: string) => {
    const labels: any = {
      DEPOSIT: 'ฝากเงิน',
      WITHDRAWAL: 'ถอนเงิน',
      BET: 'แทงหวย/เกม',
      WIN: 'ถูกรางวัล',
      BONUS: 'โบนัส',
      TRANSFER_IN: 'โอนเข้า',
      TRANSFER_OUT: 'โอนออก',
      REFUND: 'คืนเงิน'
    }
    return labels[type] || type
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white">ประวัติรายการ</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400 text-sm mb-1">รายรับทั้งหมด</p>
          <p className="text-2xl font-bold text-white">+฿{formatCurrency(summary.totalIn)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm mb-1">รายจ่ายทั้งหมด</p>
          <p className="text-2xl font-bold text-white">-฿{formatCurrency(summary.totalOut)}</p>
        </div>
        <div className={`bg-gradient-to-r ${summary.netProfit >= 0 ? 'from-blue-600/20 to-cyan-600/20 border-blue-500/30' : 'from-orange-600/20 to-red-600/20 border-orange-500/30'} border rounded-xl p-4`}>
          <p className={`${summary.netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'} text-sm mb-1`}>กำไร/ขาดทุน</p>
          <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary.netProfit >= 0 ? '+' : ''}฿{formatCurrency(summary.netProfit)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-white" />
            <h2 className="text-white font-medium">กรองข้อมูล</h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <FiDownload size={16} />
            <span>ส่งออก CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">ประเภท</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {TRANSACTION_TYPES.map(type => (
                <option key={type.value} value={type.value} className="bg-gray-800">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">สถานะ</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-gray-800">ทั้งหมด</option>
              <option value="SUCCESS" className="bg-gray-800">สำเร็จ</option>
              <option value="PENDING" className="bg-gray-800">รอดำเนินการ</option>
              <option value="FAILED" className="bg-gray-800">ไม่สำเร็จ</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">จากวันที่</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">ถึงวันที่</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white font-medium">วันที่/เวลา</th>
                <th className="px-6 py-4 text-left text-white font-medium">ประเภท</th>
                <th className="px-6 py-4 text-left text-white font-medium">รายละเอียด</th>
                <th className="px-6 py-4 text-right text-white font-medium">จำนวน</th>
                <th className="px-6 py-4 text-right text-white font-medium">คงเหลือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/60">
                    ไม่พบรายการ
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white/80 whitespace-nowrap text-sm">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="text-white text-sm">{getTypeLabel(transaction.type)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${
                        ['DEPOSIT', 'WIN', 'BONUS', 'REFUND'].includes(transaction.type)
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {['DEPOSIT', 'WIN', 'BONUS', 'REFUND'].includes(transaction.type) ? '+' : '-'}
                        ฿{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium">
                      ฿{formatCurrency(transaction.balanceAfter)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/60 text-sm">
              แสดง {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} จาก {pagination.total} รายการ
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset - prev.limit }))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory
