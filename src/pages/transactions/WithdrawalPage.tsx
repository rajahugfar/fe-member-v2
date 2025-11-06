import { useState, useEffect } from 'react'
import { withdrawalAPI, type Withdrawal, type WithdrawalBalance } from '@/api/withdrawalAPI'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/utils/format'

const WithdrawalPage = () => {
  const [balance, setBalance] = useState<WithdrawalBalance | null>(null)
  const [amount, setAmount] = useState('')
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load balance and withdrawal history
  useEffect(() => {
    loadBalance()
    loadWithdrawalHistory()
  }, [])

  const loadBalance = async () => {
    try {
      const data = await withdrawalAPI.getBalance()
      setBalance(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลยอดเงินได้')
    }
  }

  const loadWithdrawalHistory = async () => {
    try {
      setLoading(true)
      const data = await withdrawalAPI.getWithdrawalHistory({ limit: 10, offset: 0 })
      setWithdrawals(data)
    } catch (error: any) {
      console.error('Failed to load withdrawal history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = parseFloat(amount)

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('กรุณากรอกจำนวนเงินที่ต้องการถอน')
      return
    }

    if (balance && withdrawAmount > balance.creditGame) {
      toast.error('ยอดเงินในกระเป๋าเกมไม่เพียงพอ')
      return
    }

    if (withdrawAmount < 1) {
      toast.error('จำนวนเงินขั้นต่ำในการถอนคือ 1 บาท')
      return
    }

    try {
      setSubmitting(true)
      const result = await withdrawalAPI.createWithdrawal({ amount: withdrawAmount })

      if (result.status === 'APPROVED') {
        toast.success('ถอนเงินสำเร็จ! อนุมัติอัตโนมัติแล้ว')
      } else {
        toast.success('ส่งคำขอถอนเงินสำเร็จ! รอการอนุมัติจากเจ้าหน้าที่')
      }

      setAmount('')
      loadBalance()
      loadWithdrawalHistory()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'ไม่สามารถส่งคำขอถอนเงินได้')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'รออนุมัติ' },
      APPROVED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'อนุมัติแล้ว' },
      REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'ปฏิเสธ' },
      CANCELLED: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'ยกเลิก' },
    }

    const badge = badges[status] || badges.PENDING
    return (
      <span className={`px-3 py-1 rounded-full text-sm ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">ถอนเงิน</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">ยอดเงินในกระเป๋าหลัก</p>
            <p className="text-3xl font-bold mt-1">
              {balance ? formatCurrency(balance.credit) : '...'} บาท
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">ยอดเงินในกระเป๋าเกม</p>
            <p className="text-2xl font-bold mt-1">
              {balance ? formatCurrency(balance.creditGame) : '...'} บาท
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">ขอถอนเงิน</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              จำนวนเงิน (บาท)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              step="0.01"
              disabled={submitting}
            />
            <p className="text-sm text-gray-400 mt-2">
              ยอดเงินที่สามารถถอนได้: {balance ? formatCurrency(balance.creditGame) : '0.00'} บาท
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              💡 <strong>หมายเหตุ:</strong> การถอนเงินจะหักจากกระเป๋าเกม โปรดตรวจสอบยอดเงินก่อนทำรายการ
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !amount}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'กำลังส่งคำขอ...' : 'ยืนยันการถอนเงิน'}
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">ประวัติการถอนเงิน</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-400">ไม่มีประวัติการถอนเงิน</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-3 px-2">วันที่</th>
                  <th className="pb-3 px-2">จำนวนเงิน</th>
                  <th className="pb-3 px-2">บัญชีธนาคาร</th>
                  <th className="pb-3 px-2">สถานะ</th>
                  <th className="pb-3 px-2">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-4 px-2 text-sm">
                      {formatDate(withdrawal.createdAt)}
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-yellow-400 font-semibold">
                        {formatCurrency(withdrawal.amount)} บาท
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm">
                      <div>
                        <p className="font-medium">{withdrawal.bankCode}</p>
                        <p className="text-gray-400 text-xs">{withdrawal.bankAccount}</p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-400">
                      {withdrawal.remark || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default WithdrawalPage
