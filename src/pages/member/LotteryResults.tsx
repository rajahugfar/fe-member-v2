import React, { useState, useEffect } from 'react'
import { memberLotteryAPI, MyBet } from '@api/memberLotteryAPI'
import toast from 'react-hot-toast'
import { FiAward, FiCalendar, FiClock, FiRefreshCw } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DailyResultsSection from '../../components/lottery/DailyResultsSection'

interface ResultPeriod {
  id: string
  lottery_code: string
  lottery_name: string
  lottery_type: string
  period_name: string
  period_date: string
  result_3d_top?: string
  result_3d_bottom?: string
  result_2d_top?: string
  result_2d_bottom?: string
  result_4d?: string
  announced_at?: string
}

const LotteryResults: React.FC = () => {
  const navigate = useNavigate()
  const [results, setResults] = useState<ResultPeriod[]>([])
  const [loading, setLoading] = useState(false)
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [filterLotteryType, setFilterLotteryType] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchResults()

    // Auto-refresh every 60 seconds for today's results
    if (autoRefresh && filterDate === new Date().toISOString().split('T')[0]) {
      const interval = setInterval(() => {
        fetchResults()
      }, 60000)
      return () => clearInterval(interval)
    }
  }, [filterDate, filterLotteryType, autoRefresh])

  const fetchResults = async () => {
    setLoading(true)
    try {
      // Fetch bets with results (ANNOUNCED or WIN/LOSE status)
      const data = await memberLotteryAPI.getMyBets({
        start_date: filterDate,
        end_date: filterDate,
        limit: 100,
        offset: 0,
      })

      // Extract unique periods with results
      const periodsMap = new Map<string, ResultPeriod>()

      data.bets.forEach((bet: MyBet) => {
        if (bet.announced_at && !periodsMap.has(bet.period_id)) {
          periodsMap.set(bet.period_id, {
            id: bet.period_id,
            lottery_code: bet.lottery_code,
            lottery_name: bet.lottery_name,
            lottery_type: bet.lottery_type,
            period_name: bet.period_name,
            period_date: bet.period_date,
            result_3d_top: bet.result_3d_top,
            result_3d_bottom: bet.result_3d_bottom,
            result_2d_top: bet.result_2d_top,
            result_2d_bottom: bet.result_2d_bottom,
            result_4d: bet.result_4d,
            announced_at: bet.announced_at,
          })
        }
      })

      let resultsList = Array.from(periodsMap.values())

      // Filter by lottery type
      if (filterLotteryType !== 'all') {
        resultsList = resultsList.filter((r) => r.lottery_type === filterLotteryType)
      }

      // Sort by announced time (newest first)
      resultsList.sort((a, b) => {
        if (!a.announced_at || !b.announced_at) return 0
        return new Date(b.announced_at).getTime() - new Date(a.announced_at).getTime()
      })

      setResults(resultsList)
    } catch (error) {
      console.error('Failed to fetch results:', error)
      toast.error('ไม่สามารถโหลดผลรางวัลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleViewMyBets = (periodId: string) => {
    navigate(`/member/lottery/history?period_id=${periodId}`)
  }

  const getLotteryTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      government: 'หวยรัฐบาล',
      stock: 'หวยหุ้น',
      yeekee: 'หวยยี่กี',
    }
    return labels[type] || type
  }

  const getLotteryTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      government: 'from-blue-500 to-blue-600',
      stock: 'from-purple-500 to-purple-600',
      yeekee: 'from-green-500 to-green-600',
    }
    return colors[type] || 'from-gray-500 to-gray-600'
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
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ผลรางวัล</h1>
            <p className="text-gray-600">ดูผลการออกรางวัลหวย</p>
          </div>
          <button
            onClick={fetchResults}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiRefreshCw />
            รีเฟรช
          </button>
        </div>

        {/* ส่วนแสดงผลหวยวันนี้ */}
        <DailyResultsSection date={filterDate} />

        {/* Divider */}
        <div className="my-8 border-t border-gray-300"></div>

        {/* ส่วนเดิม - ผลหวยที่แทงไว้ */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">โพยที่ฉันแทง</h2>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เลือกวันที่</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทหวย</label>
              <select
                value={filterLotteryType}
                onChange={(e) => setFilterLotteryType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="government">หวยรัฐบาล</option>
                <option value="stock">หวยหุ้น</option>
                <option value="yeekee">หวยยี่กี</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รีเฟรชอัตโนมัติ</label>
              <div className="flex items-center h-[42px]">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="mr-2 w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    เปิดใช้งาน (ทุก 60 วินาที)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FiAward className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">ยังไม่มีผลรางวัล</h3>
            <p className="text-gray-600">ยังไม่มีการประกาศผลรางวัลในวันนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r ${getLotteryTypeColor(
                    result.lottery_type
                  )} text-white p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {getLotteryTypeLabel(result.lottery_type)}
                    </span>
                    <FiAward size={20} />
                  </div>
                  <h3 className="text-xl font-bold">{result.lottery_name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <FiCalendar size={14} />
                      {formatDate(result.period_date)}
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="p-6 space-y-3">
                  {result.result_3d_top && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">3 ตัวบน</div>
                      <div className="text-4xl font-bold text-blue-600 text-center tracking-wider">
                        {result.result_3d_top}
                      </div>
                    </div>
                  )}

                  {result.result_3d_bottom && (
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">3 ตัวล่าง</div>
                      <div className="text-4xl font-bold text-indigo-600 text-center tracking-wider">
                        {result.result_3d_bottom}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {result.result_2d_top && (
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">2 ตัวบน</div>
                        <div className="text-3xl font-bold text-green-600 text-center tracking-wider">
                          {result.result_2d_top}
                        </div>
                      </div>
                    )}

                    {result.result_2d_bottom && (
                      <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">2 ตัวล่าง</div>
                        <div className="text-3xl font-bold text-teal-600 text-center tracking-wider">
                          {result.result_2d_bottom}
                        </div>
                      </div>
                    )}
                  </div>

                  {result.result_4d && (
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">4 ตัว</div>
                      <div className="text-4xl font-bold text-pink-600 text-center tracking-wider">
                        {result.result_4d}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <FiClock size={12} />
                      <span>ประกาศเมื่อ {result.announced_at ? formatTime(result.announced_at) : '-'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewMyBets(result.id)}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition"
                  >
                    ดูโพยของฉัน
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LotteryResults
