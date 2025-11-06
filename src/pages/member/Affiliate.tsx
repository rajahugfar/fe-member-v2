import React, { useState, useEffect } from 'react'
import { FiUsers, FiDollarSign, FiLink, FiCopy, FiCheck, FiTrendingUp, FiAward } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface AffiliateMember {
  id: string
  username: string
  fullname: string
  registeredAt: string
  totalDeposit: number
  commission: number
}

interface AffiliateStats {
  totalMembers: number
  totalCommission: number
  availableCommission: number
  withdrawnCommission: number
  thisMonthCommission: number
}

const Affiliate: React.FC = () => {
  const [stats, setStats] = useState<AffiliateStats>({
    totalMembers: 0,
    totalCommission: 0,
    availableCommission: 0,
    withdrawnCommission: 0,
    thisMonthCommission: 0
  })
  const [members, setMembers] = useState<AffiliateMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // สร้าง referral link (ตัวอย่าง - ต้องดึงจาก API จริง)
  const userId = localStorage.getItem('memberId') || '12345'
  const referralLink = `${window.location.origin}/register?ref=${userId}`

  useEffect(() => {
    loadAffiliateData()
  }, [])

  const loadAffiliateData = async () => {
    setLoading(true)
    try {
      // TODO: Backend ยังไม่มี Affiliate API - ใช้ mock data ชั่วคราว
      setTimeout(() => {
        setStats({
          totalMembers: 15,
          totalCommission: 45000,
          availableCommission: 12000,
          withdrawnCommission: 33000,
          thisMonthCommission: 5500
        })
        setMembers([
          {
            id: '1',
            username: 'user001',
            fullname: 'สมชาย ใจดี',
            registeredAt: '2025-01-15',
            totalDeposit: 50000,
            commission: 2500
          },
          {
            id: '2',
            username: 'user002',
            fullname: 'สมศรี มั่งคั่ง',
            registeredAt: '2025-01-20',
            totalDeposit: 35000,
            commission: 1750
          }
        ])
        setLoading(false)
      }, 500)
    } catch (error: any) {
      console.error('Load affiliate error:', error)
      toast.error(error.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ')
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('คัดลอกลิงก์สำเร็จ')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWithdrawCommission = async () => {
    if (stats.availableCommission < 100) {
      toast.error('ยอดคอมมิชชั่นขั้นต่ำ 100 บาท')
      return
    }
    // TODO: Backend ยังไม่มี Affiliate API - แสดง mock response
    toast.success('ส่งคำขอถอนค่าคอมมิชชั่นสำเร็จ')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.4)] border border-purple-400/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg flex items-center gap-3">
            <FiUsers size={36} />
            แนะนำเพื่อน
          </h1>
          <p className="text-white/90 text-lg">รับค่าคอมมิชชั่นจากการแนะนำเพื่อน</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiLink className="text-purple-400" size={24} />
          <h2 className="text-xl font-bold text-white">ลิงก์แนะนำเพื่อน</h2>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={handleCopyLink}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              copied
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
          </button>
        </div>

        <p className="text-white/60 text-sm mt-3">
          แชร์ลิงก์นี้ให้เพื่อนของคุณ เมื่อเพื่อนสมัครและฝากเงิน คุณจะได้รับค่าคอมมิชชั่น 5%
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <FiUsers size={24} />
            <span className="text-sm">สมาชิกในสายงาน</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalMembers}</p>
          <p className="text-sm text-white/60 mt-1">คน</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <FiDollarSign size={24} />
            <span className="text-sm">ค่าคอมมิชชั่นทั้งหมด</span>
          </div>
          <p className="text-3xl font-bold text-white">฿{formatCurrency(stats.totalCommission)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <FiAward size={24} />
            <span className="text-sm">คอมมิชชั่นคงเหลือ</span>
          </div>
          <p className="text-3xl font-bold text-white">฿{formatCurrency(stats.availableCommission)}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-600/20 to-pink-700/20 border border-pink-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 text-pink-400 mb-2">
            <FiTrendingUp size={24} />
            <span className="text-sm">คอมมิชชั่นเดือนนี้</span>
          </div>
          <p className="text-3xl font-bold text-white">฿{formatCurrency(stats.thisMonthCommission)}</p>
        </div>
      </div>

      {/* Withdraw Commission */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">ถอนค่าคอมมิชชั่น</h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/60 text-sm mb-1">ยอดที่สามารถถอนได้</p>
            <p className="text-3xl font-bold text-green-400">฿{formatCurrency(stats.availableCommission)}</p>
          </div>
          <button
            onClick={handleWithdrawCommission}
            disabled={stats.availableCommission < 100}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            ถอนค่าคอมมิชชั่น
          </button>
        </div>
        <p className="text-white/60 text-sm mt-4">
          * ยอดถอนขั้นต่ำ 100 บาท
        </p>
      </div>

      {/* Members List */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">สมาชิกในสายงาน</h2>

        {members.length === 0 ? (
          <p className="text-center text-white/60 py-8">ยังไม่มีสมาชิกในสายงาน</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/70 font-medium py-3 px-2">ลำดับ</th>
                  <th className="text-left text-white/70 font-medium py-3 px-2">ชื่อผู้ใช้</th>
                  <th className="text-left text-white/70 font-medium py-3 px-2">ชื่อ-นามสกุล</th>
                  <th className="text-left text-white/70 font-medium py-3 px-2">วันที่สมัคร</th>
                  <th className="text-right text-white/70 font-medium py-3 px-2">ยอดฝากรวม</th>
                  <th className="text-right text-white/70 font-medium py-3 px-2">คอมมิชชั่น</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={member.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 px-2 text-white">{index + 1}</td>
                    <td className="py-4 px-2 text-white">{member.username}</td>
                    <td className="py-4 px-2 text-white">{member.fullname}</td>
                    <td className="py-4 px-2 text-white/70">{formatDate(member.registeredAt)}</td>
                    <td className="py-4 px-2 text-right text-blue-400">฿{formatCurrency(member.totalDeposit)}</td>
                    <td className="py-4 px-2 text-right text-green-400 font-semibold">฿{formatCurrency(member.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FiAward className="text-yellow-400" />
          วิธีรับค่าคอมมิชชั่น
        </h3>
        <div className="space-y-3 text-white/80">
          <p>1. คัดลอกลิงก์แนะนำเพื่อนของคุณ</p>
          <p>2. แชร์ลิงก์ให้เพื่อนของคุณ</p>
          <p>3. เมื่อเพื่อนสมัครสมาชิกผ่านลิงก์ของคุณและฝากเงิน</p>
          <p>4. คุณจะได้รับค่าคอมมิชชั่น 5% จากยอดฝากของเพื่อน</p>
          <p>5. สามารถถอนค่าคอมมิชชั่นได้เมื่อมียอดขั้นต่ำ 100 บาท</p>
        </div>
      </div>
    </div>
  )
}

export default Affiliate
