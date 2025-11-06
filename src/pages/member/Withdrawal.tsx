import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTrendingUp, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { withdrawalAPI, profileAPI } from '../../api/memberAPI'
import { toast } from 'react-hot-toast'
import BankIcon from '../../components/BankIcon'

const Withdrawal: React.FC = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null)
  const [amount, setAmount] = useState<number | string>('')
  const [loading, setLoading] = useState(false)

  const MIN_WITHDRAWAL = 100
  const MAX_WITHDRAWAL = 100000

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profileRes, banksRes] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getBankAccounts()
      ])

      setBalance(profileRes.data.balance || 0)
      setBankAccounts(banksRes.data.data || [])

      // Auto select primary bank
      const primaryBank = banksRes.data.data?.find((b: any) => b.isPrimary)
      if (primaryBank) {
        setSelectedBankId(primaryBank.id)
      }
    } catch (error) {
      console.error('Load data error:', error)
      toast.error('โหลดข้อมูลไม่สำเร็จ')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const withdrawAmount = Number(amount)

    if (!selectedBankId) {
      toast.error('กรุณาเลือกบัญชีธนาคาร')
      return
    }

    if (!withdrawAmount || withdrawAmount < MIN_WITHDRAWAL) {
      toast.error(`ยอดถอนขั้นต่ำ ${MIN_WITHDRAWAL} บาท`)
      return
    }

    if (withdrawAmount > MAX_WITHDRAWAL) {
      toast.error(`ยอดถอนสูงสุด ${MAX_WITHDRAWAL.toLocaleString()} บาท`)
      return
    }

    if (withdrawAmount > balance) {
      toast.error('ยอดเงินไม่เพียงพอ')
      return
    }

    setLoading(true)

    try {
      await withdrawalAPI.requestWithdrawal({
        bankAccountId: selectedBankId,
        amount: withdrawAmount
      })

      toast.success('ส่งคำขอถอนเงินสำเร็จ กรุณารอการตรวจสอบ')
      navigate('/member/withdrawal/history')
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      toast.error(error.response?.data?.message || 'ถอนเงินไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const selectedBank = bankAccounts.find(b => b.id === selectedBankId)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">ถอนเงิน</h1>
        <p className="text-white/80">กรอกข้อมูลเพื่อถอนเงินออกจากระบบ</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
        <p className="text-white/80 mb-2">ยอดเงินคงเหลือ</p>
        <p className="text-4xl font-bold text-white">฿{formatCurrency(balance)}</p>
      </div>

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 space-y-6">
        {/* Select Bank Account */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-3">เลือกบัญชีธนาคาร</label>
          {bankAccounts.length === 0 ? (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">
                กรุณาเพิ่มบัญชีธนาคารก่อนถอนเงิน
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bankAccounts.map(bank => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    selectedBankId === bank.id
                      ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-2 border-blue-500'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <BankIcon bankCode={bank.bankCode || bank.bankName} size="md" />
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{bank.bankName}</p>
                    <p className="text-white/60 text-sm">{bank.accountNumber}</p>
                    <p className="text-white/60 text-sm">{bank.accountName}</p>
                  </div>
                  {selectedBankId === bank.id && (
                    <FiCheck className="text-blue-400" size={24} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-3">จำนวนเงินที่ต้องการถอน</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-2xl font-bold placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="0.00"
            min={MIN_WITHDRAWAL}
            max={Math.min(MAX_WITHDRAWAL, balance)}
          />
          <div className="flex items-center justify-between mt-2 text-sm">
            <p className="text-white/60">ขั้นต่ำ: ฿{MIN_WITHDRAWAL.toLocaleString()}</p>
            <p className="text-white/60">สูงสุด: ฿{Math.min(MAX_WITHDRAWAL, balance).toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <p className="text-white/80 text-sm mb-3">เลือกจำนวนเร็ว</p>
          <div className="grid grid-cols-4 gap-2">
            {[500, 1000, 5000, 10000].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                disabled={value > balance}
                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                  amount === value
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {value.toLocaleString()}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAmount(balance)}
            disabled={balance === 0}
            className="w-full mt-2 px-3 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถอนทั้งหมด (฿{formatCurrency(balance)})
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
          <div className="flex gap-3">
            <FiAlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200 space-y-1">
              <p>• ระยะเวลาดำเนินการ 1-5 นาที (ในเวลาทำการ)</p>
              <p>• ตรวจสอบชื่อบัญชีให้ตรงกับที่ลงทะเบียน</p>
              <p>• ติดต่อฝ่ายบริการหากมีปัญหา</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedBank && amount && Number(amount) >= MIN_WITHDRAWAL && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-2">
            <p className="text-white/80 text-sm">สรุปการถอน</p>
            <div className="flex justify-between">
              <span className="text-white/60">จำนวนที่ถอน:</span>
              <span className="text-white font-bold">฿{formatCurrency(Number(amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">โอนเข้าบัญชี:</span>
              <span className="text-white">{selectedBank.bankName} - {selectedBank.accountNumber}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-white/60">คงเหลือหลังถอน:</span>
              <span className="text-white font-bold">฿{formatCurrency(balance - Number(amount))}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedBankId || !amount || Number(amount) < MIN_WITHDRAWAL || bankAccounts.length === 0}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>กำลังส่งคำขอ...</span>
            </>
          ) : (
            <>
              <FiTrendingUp />
              <span>ยืนยันถอนเงิน</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default Withdrawal
