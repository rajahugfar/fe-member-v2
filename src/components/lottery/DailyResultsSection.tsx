import React, { useState, useEffect } from 'react'
import { adminLotteryDailyAPI, DailyLotteryItem } from '@api/adminLotteryDailyAPI'
import toast from 'react-hot-toast'
import { FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { FaTrophy } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

interface DailyResultsSectionProps {
  date?: string
}

const DailyResultsSection: React.FC<DailyResultsSectionProps> = ({ date }) => {
  const { t } = useTranslation()
  const [results, setResults] = useState<DailyLotteryItem[]>([])
  const [gloResult, setGloResult] = useState<DailyLotteryItem | null>(null)
  const [loading, setLoading] = useState(false)
  const targetDate = date || new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchDailyResults()
  }, [targetDate])

  const fetchDailyResults = async () => {
    try {
      setLoading(true)
      console.log('Fetching daily results for date:', targetDate)
      // Call admin API endpoint (public accessible)
      const response = await adminLotteryDailyAPI.getDailyList({ date: targetDate })

      console.log('Daily results response:', response)

      if (response.status === 'success' && response.data) {
        const lotteries = response.data.lotteries || []
        console.log('Total lotteries:', lotteries.length)

        // แยกหวย GLO ล่าสุดที่ออกผลแล้ว (status=2)
        const gloLotteries = lotteries.filter((l: DailyLotteryItem) => l.huayCode === 'GLO' && l.status === 2)
        if (gloLotteries.length > 0) {
          // เอาล่าสุด
          gloLotteries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          setGloResult(gloLotteries[0])
          console.log('Found GLO result:', gloLotteries[0])
        } else {
          setGloResult(null)
          console.log('No GLO result found')
        }

        // หวยอื่นๆ ทั้งหมด
        setResults(lotteries)
      } else {
        console.error('Invalid response format:', response)
      }
    } catch (error: any) {
      console.error('Failed to fetch daily results:', error)
      console.error('Error details:', error.response?.data || error.message)
      toast.error('ไม่สามารถโหลดผลหวยได้: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (lottery: DailyLotteryItem) => {
    const now = new Date()
    const closeTime = new Date(lottery.time)

    if (lottery.status === 2) {
      return { text: 'ออกผลแล้ว', color: 'text-green-600', icon: FiCheckCircle }
    } else if (lottery.status === 1 && now > closeTime) {
      return { text: 'รอผลหวยออก', color: 'text-yellow-600', icon: FiClock }
    } else if (lottery.status === 1) {
      return { text: 'เปิดแทง', color: 'text-blue-600', icon: FiCheckCircle }
    } else {
      return { text: t("common:buttons.cancel"), color: 'text-red-600', icon: FiAlertCircle }
    }
  }

  const getFlagEmoji = (iconCode: string) => {
    const flags: { [key: string]: string } = {
      'th': '🇹🇭', 'la': '🇱🇦', 'vn': '🇻🇳', 'cn': '🇨🇳',
      'jp': '🇯🇵', 'kr': '🇰🇷', 'sg': '🇸🇬', 'tw': '🇹🇼',
      'hk': '🇭🇰', 'gb': '🇬🇧', 'de': '🇩🇪', 'ru': '🇷🇺', 'us': '🇺🇸',
    }
    return flags[iconCode?.toLowerCase()] || '🏳️'
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดผลหวย...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* หวย GLO พิเศษ */}
      {gloResult && (
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <FaTrophy className="text-3xl text-red-600" />
            <div>
              <h3 className="text-2xl font-bold text-red-800">{gloResult.name}</h3>
              <p className="text-sm text-red-600">งวดล่าสุด</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gloResult.result3Up && (
              <div className="bg-white rounded-xl p-4 text-center shadow">
                <div className="text-xs text-gray-500 mb-1">3 ตัวบน</div>
                <div className="text-3xl font-bold text-red-600">{gloResult.result3Up}</div>
              </div>
            )}
            {gloResult.result2Up && (
              <div className="bg-white rounded-xl p-4 text-center shadow">
                <div className="text-xs text-gray-500 mb-1">2 ตัวบน</div>
                <div className="text-3xl font-bold text-blue-600">{gloResult.result2Up}</div>
              </div>
            )}
            {gloResult.result2Low && (
              <div className="bg-white rounded-xl p-4 text-center shadow">
                <div className="text-xs text-gray-500 mb-1">2 ตัวล่าง</div>
                <div className="text-3xl font-bold text-green-600">{gloResult.result2Low}</div>
              </div>
            )}
            {gloResult.has4d && gloResult.result4Up && (
              <div className="bg-white rounded-xl p-4 text-center shadow">
                <div className="text-xs text-gray-500 mb-1">4 ตัว</div>
                <div className="text-2xl font-bold text-purple-600">{gloResult.result4Up}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ตารางหวยอื่นๆ */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">ผลหวยวันนี้</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{t("navigation:menu.lottery")}</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">เวลาปิด</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">3 ตัวบน</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">2 ตัวบน</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">2 ตัวล่าง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีข้อมูลหวยในวันนี้
                  </td>
                </tr>
              ) : (
                results.map((lottery) => {
                  const status = getStatusText(lottery)
                  const StatusIcon = status.icon

                  return (
                    <tr key={lottery.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getFlagEmoji(lottery.icon)}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{lottery.name}</div>
                            <div className="text-xs text-gray-500">{lottery.huayCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {new Date(lottery.time).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className={`inline-flex items-center gap-1 ${status.color} font-medium text-sm`}>
                          <StatusIcon className="text-base" />
                          <span>{status.text}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lottery.result3Up ? (
                          <span className="text-lg font-bold text-blue-600">{lottery.result3Up}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lottery.result2Up ? (
                          <span className="text-lg font-bold text-green-600">{lottery.result2Up}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lottery.result2Low ? (
                          <span className="text-lg font-bold text-purple-600">{lottery.result2Low}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DailyResultsSection
