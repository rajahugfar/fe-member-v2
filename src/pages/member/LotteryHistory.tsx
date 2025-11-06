import React, { useState, useEffect } from 'react'
import { memberLotteryAPI, MyBet } from '@api/memberLotteryAPI'
import toast from 'react-hot-toast'
import {
  FiDownload,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiX,
  FiCalendar,
} from 'react-icons/fi'

const LotteryHistory: React.FC = () => {
  const [bets, setBets] = useState<MyBet[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [filterLotteryType, setFilterLotteryType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // Statistics
  const [stats, setStats] = useState({
    total_bet: 0,
    total_win: 0,
    net_profit: 0,
    total_bets: 0,
  })

  // Result modal
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<MyBet | null>(null)

  useEffect(() => {
    fetchBets()
  }, [page, filterLotteryType, filterStatus])

  const fetchBets = async () => {
    setLoading(true)
    try {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }
      if (filterLotteryType !== 'all') params.lottery_type = filterLotteryType
      if (filterStatus !== 'all') params.status = filterStatus
      if (dateFrom) params.start_date = dateFrom
      if (dateTo) params.end_date = dateTo

      const data = await memberLotteryAPI.getMyBets(params)
      setBets(data.bets)
      setTotal(data.total)

      // Calculate statistics
      calculateStats(data.bets)
    } catch (error) {
      console.error('Failed to fetch bets:', error)
      toast.error('ไม่สามารถโหลดประวัติได้')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (betsList: MyBet[]) => {
    const totalBet = betsList.reduce((sum, bet) => sum + bet.amount, 0)
    const totalWin = betsList.reduce((sum, bet) => sum + (bet.win_amount || 0), 0)
    const netProfit = totalWin - totalBet
    const totalBets = betsList.length

    setStats({
      total_bet: totalBet,
      total_win: totalWin,
      net_profit: netProfit,
      total_bets: totalBets,
    })
  }

  const handleExportCSV = () => {
    if (bets.length === 0) {
      toast.error('ไม่มีข้อมูลให้ Export')
      return
    }

    const headers = [
      'วันที่',
      'หวย',
      'งวดที่',
      'ประเภท',
      'เลข',
      'ยอดเดิมพัน',
      'อัตราจ่าย',
      'สถานะ',
      'ยอดถูกรางวัล',
    ]

    const rows = bets.map((bet) => [
      new Date(bet.created_at).toLocaleDateString('th-TH'),
      bet.lottery_name,
      bet.period_name,
      getBetTypeLabel(bet.bet_type),
      bet.number,
      bet.amount,
      bet.payout_rate,
      getStatusLabel(bet.status),
      bet.win_amount || 0,
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `lottery_history_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('ส่งออกข้อมูลสำเร็จ')
  }

  const handleViewResult = (bet: MyBet) => {
    setSelectedBet(bet)
    setResultModalOpen(true)
  }

  const getBetTypeLabel = (betType: string): string => {
    const labels: { [key: string]: string } = {
      '3top': '3ตัวบน',
      '3tod': '3ตัวโต๊ด',
      '3bottom': '3ตัวล่าง',
      '2top': '2ตัวบน',
      '2bottom': '2ตัวล่าง',
      'run_top': 'วิ่งบน',
      'run_bottom': 'วิ่งล่าง',
      '4d': '4ตัว',
    }
    return labels[betType] || betType
  }

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      PENDING: 'รอผล',
      WIN: 'ถูกรางวัล',
      LOSE: 'ไม่ถูก',
      CANCELLED: 'ยกเลิก',
    }
    return labels[status] || status
  }

  const getBetTypeBadge = (betType: string): string => {
    const badges: { [key: string]: string } = {
      '3top': 'bg-blue-100 text-blue-700',
      '3tod': 'bg-purple-100 text-purple-700',
      '3bottom': 'bg-indigo-100 text-indigo-700',
      '2top': 'bg-green-100 text-green-700',
      '2bottom': 'bg-teal-100 text-teal-700',
      'run_top': 'bg-orange-100 text-orange-700',
      'run_bottom': 'bg-yellow-100 text-yellow-700',
      '4d': 'bg-pink-100 text-pink-700',
    }
    return badges[betType] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadge = (status: string): string => {
    const badges: { [key: string]: string } = {
      PENDING: 'bg-gray-100 text-gray-700',
      WIN: 'bg-green-100 text-green-700',
      LOSE: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-orange-100 text-orange-700',
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ประวัติการแทง</h1>
            <p className="text-gray-600">ดูประวัติการแทงหวยของคุณ</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={bets.length === 0}
          >
            <FiDownload />
            Export CSV
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยอดเดิมพัน</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_bet.toLocaleString('th-TH')}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiDollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยอดถูกรางวัล</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.total_win.toLocaleString('th-TH')}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiAward className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">กำไร/ขาดทุน</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stats.net_profit >= 0 ? '+' : ''}
                  {stats.net_profit.toLocaleString('th-TH')}
                </p>
              </div>
              <div
                className={`${
                  stats.net_profit >= 0 ? 'bg-green-100' : 'bg-red-100'
                } p-3 rounded-full`}
              >
                {stats.net_profit >= 0 ? (
                  <FiTrendingUp className="text-green-600" size={24} />
                ) : (
                  <FiTrendingDown className="text-red-600" size={24} />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">จำนวนโพย</p>
                <p className="text-2xl font-bold text-purple-600">{stats.total_bets}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiCalendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทหวย</label>
              <select
                value={filterLotteryType}
                onChange={(e) => {
                  setFilterLotteryType(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="government">หวยรัฐบาล</option>
                <option value="stock">หวยหุ้น</option>
                <option value="yeekee">หวยยี่กี</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="PENDING">รอผล</option>
                <option value="WIN">ถูกรางวัล</option>
                <option value="LOSE">ไม่ถูก</option>
                <option value="CANCELLED">ยกเลิก</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchBets}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ค้นหา
            </button>
          </div>
        </div>

        {/* Bets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลด...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      วันที่/เวลา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หวย</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">งวดที่</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">เลข</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      ยอดเดิมพัน
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      ยอดถูกรางวัล
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      ดูผล
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bets.map((bet) => (
                    <tr key={bet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(bet.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bet.lottery_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {bet.period_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getBetTypeBadge(
                            bet.bet_type
                          )}`}
                        >
                          {getBetTypeLabel(bet.bet_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-900">
                        {bet.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600">
                        {bet.amount.toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                            bet.status
                          )}`}
                        >
                          {getStatusLabel(bet.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {bet.status === 'WIN' ? (
                          <span className="font-bold text-green-600">
                            {(bet.win_amount || 0).toLocaleString('th-TH')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {bet.announced_at && (
                          <button
                            onClick={() => handleViewResult(bet)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            ดูผล
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && bets.length === 0 && (
            <div className="p-8 text-center text-gray-500">ไม่พบประวัติการแทง</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              หน้า {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {resultModalOpen && selectedBet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">ผลการออกรางวัล</h3>
              <button
                onClick={() => setResultModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">{selectedBet.lottery_name}</div>
              <div className="text-xs text-blue-600">{selectedBet.period_name}</div>
              <div className="text-xs text-gray-600">
                {new Date(selectedBet.period_date).toLocaleDateString('th-TH')}
              </div>
            </div>

            <div className="space-y-4">
              {selectedBet.result_3d_top && (
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">3 ตัวบน</span>
                  <span className="text-3xl font-bold text-blue-600">{selectedBet.result_3d_top}</span>
                </div>
              )}
              {selectedBet.result_3d_bottom && (
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">3 ตัวล่าง</span>
                  <span className="text-3xl font-bold text-indigo-600">
                    {selectedBet.result_3d_bottom}
                  </span>
                </div>
              )}
              {selectedBet.result_2d_top && (
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">2 ตัวบน</span>
                  <span className="text-3xl font-bold text-green-600">{selectedBet.result_2d_top}</span>
                </div>
              )}
              {selectedBet.result_2d_bottom && (
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">2 ตัวล่าง</span>
                  <span className="text-3xl font-bold text-teal-600">
                    {selectedBet.result_2d_bottom}
                  </span>
                </div>
              )}
              {selectedBet.result_4d && (
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">4 ตัว</span>
                  <span className="text-3xl font-bold text-pink-600">{selectedBet.result_4d}</span>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">โพยของคุณ</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-500">{getBetTypeLabel(selectedBet.bet_type)}</div>
                  <div className="text-2xl font-bold text-gray-800">{selectedBet.number}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">แทง</div>
                  <div className="text-lg font-medium text-blue-600">
                    {selectedBet.amount.toLocaleString('th-TH')} บาท
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">สถานะ</span>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded ${getStatusBadge(
                      selectedBet.status
                    )}`}
                  >
                    {getStatusLabel(selectedBet.status)}
                  </span>
                </div>
                {selectedBet.status === 'WIN' && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium text-gray-700">ยอดถูกรางวัล</span>
                    <span className="text-2xl font-bold text-green-600">
                      {(selectedBet.win_amount || 0).toLocaleString('th-TH')} บาท
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setResultModalOpen(false)}
                className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LotteryHistory
