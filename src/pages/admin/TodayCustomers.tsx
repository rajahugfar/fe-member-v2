import { useState, useEffect } from 'react'
import { FiRefreshCw, FiCheckCircle, FiClock, FiEye } from 'react-icons/fi'
import { adminMemberAPI } from '@/api/adminAPI'
import toast from 'react-hot-toast'

interface Member {
  id: string
  phone: string
  fullname: string | null
  credit: number
  totalDeposits: number
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
}

interface MembersResponse {
  members: Member[]
  total: number
}

export default function TodayCustomers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'deposited' | 'notDeposited'>('all')

  useEffect(() => {
    fetchTodayMembers()
  }, [])

  const fetchTodayMembers = async () => {
    try {
      setLoading(true)

      // Get today's date in YYYY-MM-DD format
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0]

      const response: MembersResponse = await adminMemberAPI.listMembers({
        startDate: dateStr,
        endDate: dateStr,
        page: 1,
        pageSize: 100,
      })

      setMembers(response.members || [])
    } catch (error: any) {
      console.error('Failed to fetch today\'s members:', error)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('th-TH', {
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

  const filteredMembers = members.filter((member) => {
    if (filter === 'deposited') return member.totalDeposits > 0
    if (filter === 'notDeposited') return member.totalDeposits === 0
    return true
  })

  const stats = {
    total: members.length,
    deposited: members.filter((m) => m.totalDeposits > 0).length,
    notDeposited: members.filter((m) => m.totalDeposits === 0).length,
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gold-500 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/10 rounded-lg flex items-center justify-center">
              <FiEye className="w-5 h-5 text-info" />
            </div>
            ลูกค้าสมัครวันนี้
          </h1>
          <p className="text-sm text-brown-300 ml-13">
            {new Date().toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={fetchTodayMembers}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-info to-info/80 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 font-semibold"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => setFilter('all')}
          className={`p-5 rounded-xl shadow-lg cursor-pointer transition-all border ${
            filter === 'all'
              ? 'bg-gradient-to-br from-info/20 to-info/10 border-info/30 ring-2 ring-info/20'
              : 'bg-gradient-to-br from-admin-card to-admin-bg border-admin-border hover:shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiEye className="w-4 h-4" />
                สมัครทั้งหมด
              </div>
              <div className={`text-3xl font-bold ${filter === 'all' ? 'text-info' : 'text-brown-100'}`}>{stats.total}</div>
              <div className="text-xs text-brown-500 mt-1">รายการ</div>
            </div>
            <div className={`w-14 h-14 ${filter === 'all' ? 'bg-info/20' : 'bg-info/10'} rounded-xl flex items-center justify-center`}>
              <FiEye className={`w-7 h-7 ${filter === 'all' ? 'text-info' : 'text-info/70'}`} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilter('deposited')}
          className={`p-5 rounded-xl shadow-lg cursor-pointer transition-all border ${
            filter === 'deposited'
              ? 'bg-gradient-to-br from-success/20 to-success/10 border-success/30 ring-2 ring-success/20'
              : 'bg-gradient-to-br from-admin-card to-admin-bg border-admin-border hover:shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4" />
                เติมเงินแล้ว
              </div>
              <div className={`text-3xl font-bold ${filter === 'deposited' ? 'text-success' : 'text-brown-100'}`}>{stats.deposited}</div>
              <div className="text-xs text-brown-500 mt-1">
                {stats.total > 0 ? `${((stats.deposited / stats.total) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className={`w-14 h-14 ${filter === 'deposited' ? 'bg-success/20' : 'bg-success/10'} rounded-xl flex items-center justify-center`}>
              <FiCheckCircle className={`w-7 h-7 ${filter === 'deposited' ? 'text-success' : 'text-success/70'}`} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setFilter('notDeposited')}
          className={`p-5 rounded-xl shadow-lg cursor-pointer transition-all border ${
            filter === 'notDeposited'
              ? 'bg-gradient-to-br from-warning/20 to-warning/10 border-warning/30 ring-2 ring-warning/20'
              : 'bg-gradient-to-br from-admin-card to-admin-bg border-admin-border hover:shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brown-400 text-sm mb-1 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                ยังไม่เติมเงิน
              </div>
              <div className={`text-3xl font-bold ${filter === 'notDeposited' ? 'text-warning' : 'text-brown-100'}`}>{stats.notDeposited}</div>
              <div className="text-xs text-brown-500 mt-1">
                {stats.total > 0 ? `${((stats.notDeposited / stats.total) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
            <div className={`w-14 h-14 ${filter === 'notDeposited' ? 'bg-warning/20' : 'bg-warning/10'} rounded-xl flex items-center justify-center`}>
              <FiClock className={`w-7 h-7 ${filter === 'notDeposited' ? 'text-warning' : 'text-warning/70'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-card border border-admin-border rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-admin-bg to-admin-bg/50 border-b border-admin-border">
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  เวลาสมัคร
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  เบอร์โทร
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  เครดิต
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  ยอดฝากทั้งหมด
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-brown-200 uppercase tracking-wider">
                  สถานะเติมเงิน
                </th>
              </tr>
            </thead>
            <tbody className="bg-admin-card divide-y divide-admin-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown-400">
                    <div className="flex items-center justify-center gap-2">
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      <span>กำลังโหลด...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-brown-400">
                    {filter === 'all' ? 'ยังไม่มีลูกค้าสมัครวันนี้' : 'ไม่พบข้อมูล'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-admin-hover/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-100">
                      {formatTime(member.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brown-100">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-100">
                      {member.fullname || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-100">
                      ฿{formatCurrency(member.credit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-100">
                      ฿{formatCurrency(member.totalDeposits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.totalDeposits > 0 ? (
                        <span className="px-3 py-1 bg-success/10 text-success border border-success/30 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                          <FiCheckCircle className="w-3 h-3" />
                          เติมเงินแล้ว
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-warning/10 text-warning border border-warning/30 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                          <FiClock className="w-3 h-3" />
                          ยังไม่เติมเงิน
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
