import React, { useState, useEffect } from 'react'
import { FiGift, FiClock, FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi'
import { promotionAPI } from '../../api/memberAPI'
import toast from 'react-hot-toast'

const BonusHistory: React.FC = () => {
  const [bonuses, setBonuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  })
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 })

  useEffect(() => {
    loadBonuses()
  }, [filters, pagination.offset])

  const loadBonuses = async () => {
    setLoading(true)
    try {
      const response = await promotionAPI.getBonuses({
        status: filters.status as 'PENDING' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED' | undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: pagination.limit,
        offset: pagination.offset
      })
      setBonuses(response.data.bonuses || [])
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }))
    } catch (error) {
      console.error('Load bonuses error:', error)
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
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'รอรับ', icon: FiClock },
      CLAIMED: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'รับแล้ว', icon: FiCheckCircle },
      EXPIRED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'หมดอายุ', icon: FiXCircle },
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

  const getBonusTypeLabel = (type: string) => {
    const types: any = {
      DEPOSIT: 'โบนัสฝากเงิน',
      CASHBACK: 'คืนยอดเสีย',
      REFERRAL: 'แนะนำเพื่อน',
      SPECIAL: 'โบนัสพิเศษ',
      WELCOME: 'โบนัสต้อนรับ',
    }
    return types[type] || type
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white">ประวัติโบนัส</h1>
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
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-gray-800">ทั้งหมด</option>
              <option value="PENDING" className="bg-gray-800">รอรับ</option>
              <option value="CLAIMED" className="bg-gray-800">รับแล้ว</option>
              <option value="EXPIRED" className="bg-gray-800">หมดอายุ</option>
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
                <th className="px-6 py-4 text-left text-white font-medium">วันที่</th>
                <th className="px-6 py-4 text-left text-white font-medium">โปรโมชั่น</th>
                <th className="px-6 py-4 text-left text-white font-medium">ประเภท</th>
                <th className="px-6 py-4 text-right text-white font-medium">จำนวน</th>
                <th className="px-6 py-4 text-left text-white font-medium">สถานะ</th>
                <th className="px-6 py-4 text-left text-white font-medium">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  </td>
                </tr>
              ) : bonuses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/60">
                    ไม่พบรายการโบนัส
                  </td>
                </tr>
              ) : (
                bonuses.map((bonus) => (
                  <tr key={bonus.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white/80 whitespace-nowrap text-sm">
                      {formatDate(bonus.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiGift className="text-yellow-400" />
                        <span className="text-white">{bonus.promotionName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/80 text-sm">{getBonusTypeLabel(bonus.type)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-400 font-bold">
                        +฿{formatCurrency(bonus.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(bonus.status)}
                    </td>
                    <td className="px-6 py-4 text-white/60 text-sm">
                      {bonus.note || '-'}
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

export default BonusHistory
