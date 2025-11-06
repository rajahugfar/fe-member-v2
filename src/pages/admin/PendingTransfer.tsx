import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  FiAlertTriangle,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
  FiClock,
  FiFilter,
} from 'react-icons/fi'
import { adminTransferAPI } from '../../api/adminAPI'

interface PendingTransferItem {
  id: string
  memberId: string
  memberPhone: string
  memberName: string
  type: 'TRANSFER_IN' | 'TRANSFER_OUT'
  amount: number
  balanceBefore: number
  balanceAfter: number
  currentBalance: number
  gameBalance: number
  missingAmount: number
  status: string
  remark: string
  createdAt: string
  isProblem: boolean
}

const PendingTransfer: React.FC = () => {
  const [transfers, setTransfers] = useState<PendingTransferItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'PROBLEM' | 'OK'>('PROBLEM')

  // Modals
  const [selectedTransfer, setSelectedTransfer] = useState<PendingTransferItem | null>(null)
  const [showReconcileModal, setShowReconcileModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [reconcileRemark, setReconcileRemark] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  // Stats
  const [stats, setStats] = useState({
    totalProblem: 0,
    totalMissingAmount: 0,
    totalTransfers: 0,
  })

  useEffect(() => {
    fetchTransfers()
  }, [page])

  const fetchTransfers = async () => {
    setLoading(true)
    try {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }

      if (search) params.search = search
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const response = await adminTransferAPI.getPendingTransfers(params)
      let data = response.transfers || []

      // Apply client-side filtering
      if (filterType === 'PROBLEM') {
        data = data.filter((t: PendingTransferItem) => t.isProblem)
      } else if (filterType === 'OK') {
        data = data.filter((t: PendingTransferItem) => !t.isProblem)
      }

      setTransfers(data)
      setTotal(response.total || 0)

      // Calculate stats
      const problemTransfers = (response.transfers || []).filter((t: PendingTransferItem) => t.isProblem)
      const totalMissing = problemTransfers.reduce((sum: number, t: PendingTransferItem) => sum + Math.abs(t.missingAmount), 0)

      setStats({
        totalProblem: problemTransfers.length,
        totalMissingAmount: totalMissing,
        totalTransfers: response.transfers?.length || 0,
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTransfers()
  }

  const handleReset = () => {
    setSearch('')
    setStartDate('')
    setEndDate('')
    setFilterType('PROBLEM')
    setPage(1)
    setTimeout(fetchTransfers, 100)
  }

  const handleReconcile = async () => {
    if (!selectedTransfer) return

    try {
      await adminTransferAPI.reconcileTransfer(selectedTransfer.id, reconcileRemark)
      toast.success('บันทึกการตรวจสอบเรียบร้อย')
      setShowReconcileModal(false)
      setReconcileRemark('')
      fetchTransfers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const handleRefund = async () => {
    if (!selectedTransfer || !refundAmount || !refundReason) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('จำนวนเงินไม่ถูกต้อง')
      return
    }

    try {
      await adminTransferAPI.refundTransfer(selectedTransfer.id, amount, refundReason)
      toast.success(`คืนเครดิต ${formatCurrency(amount)} บาท เรียบร้อย`)
      setShowRefundModal(false)
      setRefundAmount('')
      setRefundReason('')
      fetchTransfers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-warning/10 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-warning" />
            </div>
            เครดิตหาย - โยกเกมส์
          </h1>
          <p className="text-brown-300 ml-13">ตรวจสอบและแก้ไขปัญหาเครดิตหายจากการโยกเข้า-ออกเกม</p>
        </div>
        <button
          onClick={fetchTransfers}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-info to-info/80 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4" />
                รายการมีปัญหา
              </div>
              <div className="text-3xl font-bold text-error">{stats.totalProblem}</div>
              <div className="text-xs text-brown-500 mt-1">จากทั้งหมด {stats.totalTransfers} รายการ</div>
            </div>
            <div className="w-14 h-14 bg-error/10 rounded-xl flex items-center justify-center">
              <FiAlertTriangle className="w-7 h-7 text-error" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4" />
                เครดิตหายรวม
              </div>
              <div className="text-3xl font-bold text-warning">
                {formatCurrency(stats.totalMissingAmount)}
              </div>
              <div className="text-xs text-brown-500 mt-1">บาท</div>
            </div>
            <div className="w-14 h-14 bg-warning/10 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-7 h-7 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-admin-card to-admin-bg border border-admin-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                รายการทั้งหมด
              </div>
              <div className="text-3xl font-bold text-info">{total}</div>
              <div className="text-xs text-brown-500 mt-1">Transaction ที่ตรวจสอบได้</div>
            </div>
            <div className="w-14 h-14 bg-info/10 rounded-xl flex items-center justify-center">
              <FiClock className="w-7 h-7 text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg p-6 mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-100 mb-2">ค้นหา</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="เบอร์โทร, ชื่อ"
                  className="w-full pl-10 pr-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-100 mb-2">ประเภท</label>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full pl-10 pr-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500 appearance-none"
                >
                  <option value="PROBLEM">มีปัญหา</option>
                  <option value="OK">ปกติ</option>
                  <option value="ALL">ทั้งหมด</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-100 mb-2">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brown-100 mb-2">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-lg text-brown-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-info to-info/80 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                <FiSearch />
                ค้นหา
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-admin-bg hover:bg-admin-hover text-brown-300 border border-admin-border rounded-lg transition-all font-medium"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
            <span className="ml-4 text-brown-100 font-medium">กำลังโหลด...</span>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-admin-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-10 h-10 text-success" />
            </div>
            <p className="text-brown-400 text-lg">ไม่พบรายการที่มีปัญหา</p>
            <p className="text-brown-500 text-sm mt-2">รายการจะแสดงที่นี่เมื่อมีปัญหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-admin-bg to-admin-bg/50 border-b border-admin-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    วันที่/เวลา
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    สมาชิก
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    จำนวนโยก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    ยอดก่อนโยก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    ยอดที่ควรเป็น
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    ยอดปัจจุบัน
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    เครดิตหาย
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-brown-100 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {transfers.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className={`hover:bg-admin-hover/50 transition-all group ${
                      transfer.isProblem ? 'bg-error/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-100">
                      {formatDate(transfer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-brown-100">{transfer.memberName}</div>
                      <div className="text-sm text-brown-400">{transfer.memberPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {transfer.type === 'TRANSFER_IN' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-info/10 text-info">
                          <FiTrendingDown />
                          โยกเข้า
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-success/10 text-success">
                          <FiTrendingUp />
                          โยกออก
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-brown-100">
                      {formatCurrency(transfer.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-brown-400">
                      {formatCurrency(transfer.balanceBefore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-info">
                      {formatCurrency(transfer.balanceAfter)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-brown-100">
                      {formatCurrency(transfer.currentBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {transfer.isProblem ? (
                        <span className="font-bold text-error text-base">
                          -{formatCurrency(Math.abs(transfer.missingAmount))}
                        </span>
                      ) : (
                        <span className="text-success font-medium">ปกติ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransfer(transfer)
                            setShowReconcileModal(true)
                          }}
                          className="px-4 py-2 bg-info/10 hover:bg-info/20 text-info rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          ตรวจสอบแล้ว
                        </button>
                        {transfer.isProblem && (
                          <button
                            onClick={() => {
                              setSelectedTransfer(transfer)
                              setRefundAmount(Math.abs(transfer.missingAmount).toString())
                              setShowRefundModal(true)
                            }}
                            className="px-4 py-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                          >
                            คืนเครดิต
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="bg-admin-bg/50 px-6 py-4 flex items-center justify-between border-t border-admin-border">
            <div>
              <p className="text-sm text-brown-300">
                แสดง <span className="font-medium">{(page - 1) * pageSize + 1}</span> ถึง{' '}
                <span className="font-medium">{Math.min(page * pageSize, total)}</span> จาก{' '}
                <span className="font-medium">{total}</span> รายการ
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-admin-border text-sm font-medium rounded-lg text-brown-300 bg-admin-card hover:bg-admin-bg/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="px-4 py-2 border border-admin-border text-sm font-medium rounded-lg text-brown-300 bg-admin-card hover:bg-admin-bg/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reconcile Modal */}
      {showReconcileModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-brown-100 mb-4 flex items-center gap-2">
              <FiCheckCircle className="text-info" />
              บันทึกการตรวจสอบ
            </h3>

            <div className="mb-4 p-4 bg-info/10 rounded-lg">
              <p className="text-sm text-brown-400">สมาชิก</p>
              <p className="font-medium text-brown-100">{selectedTransfer.memberName}</p>
              <p className="text-sm text-brown-500">{selectedTransfer.memberPhone}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-brown-300 mb-2">หมายเหตุ</label>
              <textarea
                value={reconcileRemark}
                onChange={(e) => setReconcileRemark(e.target.value)}
                rows={3}
                placeholder="บันทึกผลการตรวจสอบ..."
                className="w-full px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-info"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReconcileModal(false)
                  setReconcileRemark('')
                }}
                className="flex-1 px-4 py-2 border border-admin-border text-brown-300 rounded-lg hover:bg-admin-bg/50 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReconcile}
                className="flex-1 px-4 py-2 bg-info text-white rounded-lg hover:bg-info/90 font-medium"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-card rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-brown-100 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-success" />
              คืนเครดิตให้ลูกค้า
            </h3>

            <div className="mb-4 p-4 bg-error/10 rounded-lg border border-error/30">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle className="text-error" />
                <p className="font-semibold text-error">เครดิตหาย</p>
              </div>
              <p className="text-sm text-brown-400">สมาชิก: {selectedTransfer.memberName}</p>
              <p className="text-sm text-brown-400">เบอร์: {selectedTransfer.memberPhone}</p>
              <p className="text-2xl font-bold text-error mt-2">
                ฿{formatCurrency(Math.abs(selectedTransfer.missingAmount))}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-brown-300 mb-2">จำนวนเงินที่คืน</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-brown-300 mb-2">เหตุผล *</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                placeholder="ระบุเหตุผลในการคืนเครดิต..."
                className="w-full px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false)
                  setRefundAmount('')
                  setRefundReason('')
                }}
                className="flex-1 px-4 py-2 border border-admin-border text-brown-300 rounded-lg hover:bg-admin-bg/50 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 font-medium"
              >
                คืนเครดิต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingTransfer
