import React, { useState, useEffect } from 'react'
import { FiEye, FiClock, FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi'
import { depositAPI } from '../../api/memberAPI'
import { toast } from 'react-hot-toast'
import BankIcon from '../../components/BankIcon'

const DepositHistory: React.FC = () => {
  const [deposits, setDeposits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  })
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  })
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null)

  useEffect(() => {
    loadDeposits()
  }, [filters, pagination.offset])

  const loadDeposits = async () => {
    setLoading(true)
    try {
      const response = await depositAPI.getDeposits({
        status: filters.status as 'PENDING' | 'SUCCESS' | 'REJECTED' | 'CANCELLED' | undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: pagination.limit,
        offset: pagination.offset
      })
      const deposits = response.data?.data || response.data || []
      setDeposits(Array.isArray(deposits) ? deposits : [])
      setPagination(prev => ({ ...prev, total: deposits.length || 0 }))
    } catch (error) {
      console.error('Load deposits error:', error)
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

  const getStatusBadge = (status: string) => {
    const config: any = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'รอตรวจสอบ', icon: FiClock },
      SUCCESS: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'สำเร็จ', icon: FiCheckCircle },
      REJECTED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'ถูกปฏิเสธ', icon: FiXCircle },
      CANCELLED: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'ยกเลิก', icon: FiXCircle },
    }

    const conf = config[status] || config.PENDING
    const Icon = conf.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium border ${conf.color}`}>
        <Icon size={14} />
        {conf.label}
      </span>
    )
  }

  const handlePageChange = (newOffset: number) => {
    setPagination(prev => ({ ...prev, offset: newOffset }))
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white">ประวัติการฝากเงิน</h1>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-white" />
          <h2 className="text-white font-medium">กรองข้อมูล</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">สถานะ</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="" className="bg-gray-800">ทั้งหมด</option>
              <option value="PENDING" className="bg-gray-800">รอตรวจสอบ</option>
              <option value="SUCCESS" className="bg-gray-800">สำเร็จ</option>
              <option value="REJECTED" className="bg-gray-800">ถูกปฏิเสธ</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">จากวันที่</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">ถึงวันที่</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                <th className="px-6 py-4 text-left text-white font-medium">จำนวน</th>
                <th className="px-6 py-4 text-left text-white font-medium">ธนาคาร</th>
                <th className="px-6 py-4 text-left text-white font-medium">สถานะ</th>
                <th className="px-6 py-4 text-left text-white font-medium">สลิป</th>
                <th className="px-6 py-4 text-left text-white font-medium">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  </td>
                </tr>
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/60">
                    ไม่พบรายการฝากเงิน
                  </td>
                </tr>
              ) : (
                deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white whitespace-nowrap">
                      {formatDate(deposit.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-400 font-bold">
                        ฿{formatCurrency(deposit.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {deposit.bankAccount ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <BankIcon bankCode={deposit.bankAccount.bankCode} size="sm" />
                            <span className="text-white font-medium">{deposit.bankAccount.bankName}</span>
                          </div>
                          <span className="text-white/60 text-sm">{deposit.bankAccount.accountNumber}</span>
                          <span className="text-white/60 text-xs">{deposit.bankAccount.accountName}</span>
                        </div>
                      ) : (
                        <span className="text-white/40 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(deposit.status)}
                    </td>
                    <td className="px-6 py-4">
                      {deposit.slipUrl && (
                        <button
                          onClick={() => setSelectedSlip(deposit.slipUrl)}
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <FiEye size={16} />
                          <span className="text-sm">ดูสลิป</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {deposit.rejectReason && (
                        <span className="text-red-400 text-sm">{deposit.rejectReason}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/60 text-sm">
              แสดง {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} จาก {pagination.total} รายการ
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.offset - pagination.limit)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSlip(null)}>
          <div className="relative max-w-2xl max-h-screen" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FiXCircle size={24} />
            </button>
            <img src={selectedSlip} alt="Slip" className="max-w-full max-h-screen rounded-xl" />
          </div>
        </div>
      )}
    </div>
  )
}

export default DepositHistory
