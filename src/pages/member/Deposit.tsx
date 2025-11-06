import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCreditCard, FiUpload, FiCamera, FiCheck, FiArrowRight, FiCopy, FiZap, FiX } from 'react-icons/fi'
import { GiTwoCoins, GiSparkles, GiDiamonds, GiMagicSwirl, GiCrystalBall } from 'react-icons/gi'
import { depositAPI } from '../../api/memberAPI'
import toast from 'react-hot-toast'
import BankIcon from '../../components/BankIcon'
import { Html5Qrcode } from 'html5-qrcode'

const QUICK_AMOUNTS = [100, 300, 500, 1000, 5000, 10000]

interface CompanyBank {
  id: string
  bankType: string
  bankCode: string
  bankName: string
  accountNumber: string
  accountName: string
  status: string
}

const Deposit: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // เริ่มที่ step 0 เพื่อเลือกวิธีการฝาก
  const [depositMethod, setDepositMethod] = useState<'transfer' | 'qr' | ''>('') // วิธีการฝาก
  const [amount, setAmount] = useState<number | string>('')
  const [selectedBank, setSelectedBank] = useState('')
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [slipPreview, setSlipPreview] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [companyBanks, setCompanyBanks] = useState<CompanyBank[]>([])
  const [showQrScanner, setShowQrScanner] = useState(false)
  const qrScannerRef = useRef<Html5Qrcode | null>(null)

  // QR Payment states
  const [qrPaymentData, setQrPaymentData] = useState<any>(null)
  const [showQrPayment, setShowQrPayment] = useState(false)

  useEffect(() => {
    loadCompanyBanks()
  }, [])

  const loadCompanyBanks = async () => {
    try {
      const response = await depositAPI.getCompanyBanks()
      const banks = response.data?.data || response.data
      setCompanyBanks(Array.isArray(banks) ? banks : [])
    } catch (error) {
      console.error('Failed to load company banks:', error)
      toast.error('โหลดบัญชีบริษัทไม่สำเร็จ')
    }
  }

  const handleAmountClick = (value: number) => {
    setAmount(value)
  }

  const handleCopyAccount = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber)
    toast.success('คัดลอกเลขบัญชีแล้ว')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ไฟล์ใหญ่เกิน 5MB')
      return
    }

    setSlipFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setSlipPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e: any) => handleFileSelect(e)
    input.click()
  }

  const startQrScanner = async () => {
    setShowQrScanner(true)

    try {
      const html5QrCode = new Html5Qrcode("qr-reader")
      qrScannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // QR Code successfully scanned
          toast.success('สแกน QR Code สำเร็จ!')
          stopQrScanner()

          // Parse QR code data (PromptPay format typically)
          // For now, just show the decoded text
          console.log('QR Code data:', decodedText)
          toast.success('ข้อมูล QR Code: ' + decodedText.substring(0, 20) + '...')
        },
        (errorMessage) => {
          // QR Code scan error - this is normal during scanning
          console.log('Scanning...', errorMessage)
        }
      )
    } catch (err) {
      console.error('Failed to start QR scanner:', err)
      toast.error('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้กล้อง')
      setShowQrScanner(false)
    }
  }

  const stopQrScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop()
        qrScannerRef.current.clear()
      } catch (err) {
        console.error('Failed to stop QR scanner:', err)
      }
    }
    setShowQrScanner(false)
  }

  const handleNext = async () => {
    if (step === 0) {
      if (!depositMethod) {
        toast.error('กรุณาเลือกวิธีการฝาก')
        return
      }
      setStep(1)
    } else if (step === 1) {
      if (!amount || Number(amount) < 100) {
        toast.error('ยอดฝากขั้นต่ำ 100 บาท')
        return
      }

      // ถ้าเลือก QR ให้เรียก API สร้าง QR เลย
      if (depositMethod === 'qr') {
        await handleCreateQRPayment()
      } else {
        setStep(2)
      }
    } else if (step === 2) {
      if (!selectedBank) {
        toast.error('กรุณาเลือกธนาคารที่โอน')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!slipFile) {
        toast.error('กรุณาอัพโหลดสลิปการโอน')
        return
      }
      setStep(4)
    }
  }

  const handleCreateQRPayment = async () => {
    setLoading(true)
    try {
      const response = await depositAPI.createDepositQR({
        amount: Number(amount),
        bankCode: 'SCB', // default bank for QR
        serviceId: 'DEPOSIT_' + Date.now(),
        redirectUrl: window.location.origin + '/member/deposit/history'
      })

      const data = response.data?.data || response.data
      setQrPaymentData(data)
      setShowQrPayment(true)
      toast.success('สร้าง QR Code สำเร็จ')
    } catch (error: any) {
      console.error('Create QR error:', error)
      toast.error(error.response?.data?.message || 'สร้าง QR Code ไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!amount || !selectedBank || !slipFile) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('amount', amount.toString())
      formData.append('bankCode', selectedBank)
      formData.append('slip', slipFile)
      if (promoCode) formData.append('promoCode', promoCode)

      await depositAPI.requestDeposit(formData)
      toast.success('ส่งคำขอฝากเงินสำเร็จ กรุณารอการตรวจสอบ')
      navigate('/member/deposit/history')
    } catch (error: any) {
      console.error('Deposit error:', error)
      toast.error(error.response?.data?.message || 'ฝากเงินไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const selectedBankInfo = companyBanks.find(b => b.bankCode === selectedBank)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Magical Header with Fantasy Theme */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 rounded-3xl p-8 shadow-[0_0_60px_rgba(16,185,129,0.4)] border-2 border-emerald-500/30 overflow-hidden group">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute top-20 right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '4s' }} />
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        </div>

        <GiSparkles className="absolute top-4 right-4 text-yellow-300 animate-pulse" size={32} />
        <GiSparkles className="absolute bottom-4 left-8 text-emerald-300 animate-pulse" size={24} style={{ animationDelay: '0.5s' }} />
        <GiTwoCoins className="absolute top-1/2 right-12 text-yellow-400 animate-bounce" size={28} style={{ animationDuration: '3s' }} />

        <div className="relative z-10 flex items-center gap-6">
          <div className="hidden md:flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform duration-300">
            <GiTwoCoins className="text-white" size={40} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-400 to-emerald-200 mb-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              เติมเหรียญทอง 💰
            </h1>
            <p className="text-emerald-200 text-lg font-medium flex items-center gap-2">
              <GiMagicSwirl className="animate-spin" style={{ animationDuration: '3s' }} />
              เติมพลังเพื่อการผจญภัย
            </p>
          </div>
        </div>
      </div>

      {/* Enchanted Progress Steps */}
      <div className="relative bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-lg border-2 border-indigo-400/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>

        <div className="flex items-center justify-between mb-10">
          {[
            { num: 0, label: 'วิธีฝาก', icon: GiMagicSwirl },
            { num: 1, label: 'จำนวน', icon: GiTwoCoins },
            { num: 2, label: 'ธนาคาร', icon: GiCrystalBall },
            { num: 3, label: 'สลิป', icon: GiDiamonds },
            { num: 4, label: 'ยืนยัน', icon: GiSparkles }
          ].map(({ num, label, icon: Icon }, index) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center gap-2">
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  step >= num
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-110'
                    : 'bg-white/10 text-white/40 border-2 border-white/20'
                }`}>
                  {step > num ? (
                    <FiCheck size={24} className="text-white" />
                  ) : (
                    <Icon size={24} className={step === num ? 'animate-pulse' : ''} />
                  )}
                  {step === num && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/50 to-green-600/50 animate-ping"></div>
                  )}
                </div>
                <span className={`text-sm font-bold text-center ${step >= num ? 'text-emerald-300' : 'text-white/40'}`}>
                  {label}
                </span>
              </div>
              {index < 4 && (
                <div className={`flex-1 h-2 mx-2 rounded-full transition-all duration-500 relative overflow-hidden ${
                  step > num ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-white/10'
                }`}>
                  {step > num && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0: เลือกวิธีการฝาก */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200 text-xl font-black mb-6 flex items-center gap-2">
                <GiMagicSwirl className="text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} size={24} />
                เลือกวิธีการฝากเงิน
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* โอนเงินปกติ */}
                <button
                  onClick={() => setDepositMethod('transfer')}
                  className={`relative p-8 rounded-2xl transition-all duration-300 overflow-hidden group ${
                    depositMethod === 'transfer'
                      ? 'bg-gradient-to-br from-emerald-600 to-green-600 border-2 border-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.6)] scale-105'
                      : 'bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-2 border-emerald-500/30 hover:border-emerald-400/60 hover:scale-105'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  {depositMethod === 'transfer' && (
                    <>
                      <GiSparkles className="absolute top-3 right-3 text-yellow-300 animate-pulse" size={24} />
                      <div className="absolute top-3 right-12">
                        <FiCheck className="text-white bg-emerald-500 rounded-full p-1" size={28} />
                      </div>
                    </>
                  )}

                  <div className="relative flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FiCreditCard size={40} className="text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-white font-black text-2xl mb-2">โอนเงินปกติ</h3>
                      <p className="text-emerald-200 text-sm">โอนผ่านธนาคารและอัพโหลดสลิป</p>
                    </div>
                  </div>
                </button>

                {/* สแกน QR Code */}
                <button
                  onClick={() => setDepositMethod('qr')}
                  className={`relative p-8 rounded-2xl transition-all duration-300 overflow-hidden group ${
                    depositMethod === 'qr'
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.6)] scale-105'
                      : 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500/30 hover:border-cyan-400/60 hover:scale-105'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  {depositMethod === 'qr' && (
                    <>
                      <GiMagicSwirl className="absolute top-3 right-3 text-cyan-300 animate-spin" style={{ animationDuration: '2s' }} size={24} />
                      <div className="absolute top-3 right-12">
                        <FiCheck className="text-white bg-cyan-500 rounded-full p-1" size={28} />
                      </div>
                    </>
                  )}

                  <div className="relative flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <GiCrystalBall size={40} className="text-white animate-pulse" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-white font-black text-2xl mb-2">สแกน QR Code</h3>
                      <p className="text-cyan-200 text-sm">สแกน QR PromptPay เพื่อฝากเงินง่ายๆ</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Magical Amount Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-green-200 text-xl font-black mb-6 flex items-center gap-2">
                <GiTwoCoins className="text-yellow-400" size={24} />
                เลือกจำนวนเหรียญทอง
              </label>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {QUICK_AMOUNTS.map(value => (
                  <button
                    key={value}
                    onClick={() => handleAmountClick(value)}
                    className={`relative px-4 py-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden group ${
                      amount === value
                        ? 'bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-105'
                        : 'bg-gradient-to-br from-emerald-900/40 to-green-900/40 text-emerald-200 border-2 border-emerald-500/30 hover:border-emerald-400/60 hover:scale-105'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    {amount === value && (
                      <GiSparkles className="absolute top-1 right-1 text-yellow-300 animate-pulse" size={16} />
                    )}
                    <div className="relative flex items-center justify-center gap-2">
                      <GiTwoCoins className={amount === value ? 'text-yellow-300' : 'text-emerald-400'} size={20} />
                      <span>฿{value.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>

              <label className="block text-emerald-200 text-sm mb-3 font-medium">หรือกรอกจำนวนเอง</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <GiTwoCoins className="text-yellow-400" size={28} />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-gradient-to-br from-emerald-900/50 to-green-900/50 border-2 border-emerald-500/30 rounded-2xl text-white text-3xl font-black placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all shadow-lg"
                  placeholder="0.00"
                  min="100"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10 pointer-events-none transition-all"></div>
              </div>
              <p className="mt-3 text-sm text-emerald-300/80 flex items-center gap-2">
                <FiZap size={16} />
                ยอดฝากขั้นต่ำ 100 บาท
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Mystical Bank Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 text-xl font-black mb-6 flex items-center gap-2">
                <GiCrystalBall className="text-purple-400 animate-pulse" size={24} />
                เลือกช่องทางโอนเงิน
              </label>
              <div className="grid gap-4">
                {companyBanks.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.bankCode)}
                    className={`relative flex items-center gap-5 p-6 rounded-2xl transition-all duration-300 overflow-hidden group ${
                      selectedBank === bank.bankCode
                        ? 'bg-gradient-to-r from-emerald-600/40 to-green-600/40 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105'
                        : 'bg-gradient-to-br from-slate-900/40 to-slate-800/40 border-2 border-slate-600/30 hover:border-emerald-500/50 hover:scale-102'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    {selectedBank === bank.bankCode && (
                      <>
                        <GiSparkles className="absolute top-2 right-2 text-yellow-300 animate-pulse" size={20} />
                        <GiSparkles className="absolute bottom-2 left-2 text-emerald-300 animate-pulse" size={16} style={{ animationDelay: '0.3s' }} />
                      </>
                    )}

                    <div className="relative">
                      <BankIcon bankCode={bank.bankCode} size="lg" className="group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <div className="relative flex-1 text-left">
                      <p className="text-white font-bold text-lg mb-1">{bank.bankName}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-emerald-200 font-mono text-lg">{bank.accountNumber}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyAccount(bank.accountNumber)
                          }}
                          className="p-1.5 bg-emerald-600/50 hover:bg-emerald-600 rounded-lg transition-colors"
                        >
                          <FiCopy className="text-white" size={14} />
                        </button>
                      </div>
                      <p className="text-emerald-300/80 text-sm">{bank.accountName}</p>
                    </div>

                    {selectedBank === bank.bankCode && (
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FiCheck className="text-white" size={24} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Magical Slip Upload */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-200 text-xl font-black mb-6 flex items-center gap-2">
                <GiDiamonds className="text-amber-400" size={24} />
                อัพโหลดหลักฐานการโอน
              </label>

              {slipPreview ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <img src={slipPreview} alt="Slip preview" className="w-full h-auto" />
                    <button
                      onClick={() => {
                        setSlipFile(null)
                        setSlipPreview('')
                      }}
                      className="absolute top-3 right-3 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg font-bold flex items-center gap-2"
                    >
                      <FiCheck size={16} />
                      ลบรูป
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="relative flex items-center justify-center gap-4 px-8 py-12 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-dashed border-indigo-400/40 rounded-2xl hover:border-indigo-400/80 hover:bg-indigo-900/60 cursor-pointer transition-all duration-300 group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="relative flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <FiUpload size={32} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-lg">เลือกไฟล์จากเครื่อง</span>
                        <span className="text-indigo-200/80 text-sm">คลิกเพื่ออัพโหลดสลิป</span>
                      </div>
                      <GiSparkles className="absolute top-3 right-3 text-purple-300 opacity-50 group-hover:opacity-100 transition-opacity" size={24} />
                    </div>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleCameraCapture}
                      className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.3)] group"
                    >
                      <FiCamera size={24} className="group-hover:scale-110 transition-transform" />
                      <span>ถ่ายรูปสลิป</span>
                      <GiSparkles className="animate-pulse" size={20} />
                    </button>

                    <button
                      onClick={startQrScanner}
                      className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] group"
                    >
                      <GiCrystalBall size={24} className="group-hover:scale-110 transition-transform animate-pulse" />
                      <span>สแกน QR Code</span>
                      <GiMagicSwirl className="animate-spin" style={{ animationDuration: '3s' }} size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-amber-200/80 text-center font-medium flex items-center justify-center gap-2">
                    <FiZap size={14} />
                    รองรับไฟล์ JPG, PNG (ไม่เกิน 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Epic Confirmation */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-200 text-xl font-black mb-6 flex items-center gap-2">
                <GiSparkles className="text-yellow-400 animate-pulse" size={24} />
                ยืนยันข้อมูลการฝาก
              </label>

              <div className="space-y-4">
                <div className="relative p-6 bg-gradient-to-br from-emerald-900/50 to-green-900/50 border-2 border-emerald-400/40 rounded-2xl shadow-lg overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
                  <GiTwoCoins className="absolute top-3 right-3 text-yellow-400 opacity-20" size={48} />
                  <p className="text-emerald-300 text-sm mb-2 font-bold">จำนวนเงินที่ฝาก</p>
                  <p className="text-white text-4xl font-black flex items-center gap-3">
                    <GiTwoCoins className="text-yellow-400" size={36} />
                    ฿{Number(amount).toLocaleString()}
                  </p>
                </div>

                <div className="relative p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-2 border-indigo-400/40 rounded-2xl shadow-lg overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>
                  <p className="text-indigo-300 text-sm mb-4 font-bold">โอนเข้าบัญชี</p>
                  {selectedBankInfo && (
                    <div className="flex items-center gap-4">
                      <BankIcon bankCode={selectedBankInfo.bankCode} size="lg" />
                      <div className="flex-1">
                        <p className="text-white font-bold text-lg mb-1">{selectedBankInfo.bankName}</p>
                        <p className="text-indigo-200 font-mono text-base">{selectedBankInfo.accountNumber}</p>
                        <p className="text-indigo-300/80 text-sm">{selectedBankInfo.accountName}</p>
                      </div>
                    </div>
                  )}
                </div>

                {slipPreview && (
                  <div className="relative p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-400/40 rounded-2xl shadow-lg overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                    <p className="text-purple-300 text-sm mb-4 font-bold">สลิปการโอน</p>
                    <img src={slipPreview} alt="Slip" className="max-h-80 rounded-xl border-2 border-purple-400/30 shadow-lg" />
                  </div>
                )}

                <div className="relative p-6 bg-gradient-to-br from-amber-900/50 to-yellow-900/50 border-2 border-amber-400/40 rounded-2xl shadow-lg overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                  <label className="block text-amber-200 text-sm mb-3 font-bold flex items-center gap-2">
                    <GiDiamonds size={18} />
                    รหัสโปรโมชั่น (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full px-5 py-4 bg-amber-900/40 border-2 border-amber-500/30 rounded-xl text-white font-bold text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    placeholder="WELCOME100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Magical Navigation Buttons */}
        <div className="flex gap-4 mt-10">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 px-8 py-4 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600/50 text-white rounded-2xl hover:from-slate-600 hover:to-slate-700 hover:border-slate-500 transition-all font-bold text-lg shadow-lg group"
            >
              <span className="flex items-center justify-center gap-2">
                <FiArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={20} />
                ย้อนกลับ
              </span>
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center justify-center gap-2">
                ถัดไป
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-2xl hover:from-yellow-700 hover:to-amber-700 transition-all font-black text-lg shadow-[0_0_40px_rgba(234,179,8,0.5)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? (
                <span className="relative flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white/30 border-t-white"></div>
                  กำลังส่งคำขอ...
                </span>
              ) : (
                <span className="relative flex items-center justify-center gap-2">
                  <GiSparkles className="animate-pulse" size={22} />
                  ยืนยันฝากเงิน
                  <FiCheck size={22} />
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-indigo-900/95 to-purple-900/95 border-2 border-cyan-400/50 rounded-3xl p-6 max-w-lg w-full mx-4 shadow-[0_0_50px_rgba(6,182,212,0.5)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200 flex items-center gap-2">
                <GiCrystalBall className="text-cyan-400 animate-pulse" size={28} />
                สแกน QR Code
              </h3>
              <button
                onClick={stopQrScanner}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                <FiX className="text-white" size={24} />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-400/50 mb-4">
              <div id="qr-reader" className="w-full"></div>
            </div>

            <p className="text-cyan-200 text-center text-sm flex items-center justify-center gap-2">
              <GiMagicSwirl className="animate-spin" style={{ animationDuration: '2s' }} size={16} />
              จ่อกล้องไปที่ QR Code บนสลิปการโอน
            </p>
          </div>
        </div>
      )}

      {/* QR Payment Modal */}
      {showQrPayment && qrPaymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative bg-gradient-to-br from-emerald-900/95 to-green-900/95 border-2 border-emerald-400/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(16,185,129,0.5)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400"></div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-green-200 flex items-center gap-2">
                <GiCrystalBall className="text-emerald-400 animate-pulse" size={32} />
                สแกน QR เพื่อชำระเงิน
              </h3>
              <button
                onClick={() => {
                  setShowQrPayment(false)
                  navigate('/member/deposit/history')
                }}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                <FiX className="text-white" size={24} />
              </button>
            </div>

            {/* Amount Display */}
            <div className="mb-6 p-6 bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border-2 border-yellow-400/40 rounded-2xl text-center">
              <p className="text-yellow-200 text-sm mb-2">ยอดที่ต้องชำระ</p>
              <p className="text-white text-5xl font-black flex items-center justify-center gap-3">
                <GiTwoCoins className="text-yellow-400 animate-pulse" size={42} />
                ฿{Number(qrPaymentData.amount).toLocaleString()}
              </p>
            </div>

            {/* QR Code Display */}
            <div className="mb-6 p-6 bg-white rounded-2xl border-4 border-emerald-400/50 shadow-lg">
              <img
                src={qrPaymentData.qrCode}
                alt="QR Code Payment"
                className="w-full h-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Order Info */}
            <div className="space-y-3 mb-6">
              <div className="p-4 bg-emerald-900/30 border border-emerald-400/30 rounded-xl">
                <p className="text-emerald-300 text-xs mb-1">เลขที่คำสั่งซื้อ</p>
                <p className="text-white font-mono text-sm">{qrPaymentData.orderId}</p>
              </div>
              <div className="p-4 bg-emerald-900/30 border border-emerald-400/30 rounded-xl">
                <p className="text-emerald-300 text-xs mb-1">รหัสฝากเงิน</p>
                <p className="text-white font-mono text-sm">{qrPaymentData.depositId}</p>
              </div>
              <div className="p-4 bg-amber-900/30 border border-amber-400/30 rounded-xl">
                <p className="text-amber-300 text-xs mb-1">สถานะ</p>
                <p className="text-yellow-200 font-bold">{qrPaymentData.status === 'PENDING' ? 'รอการชำระเงิน' : qrPaymentData.status}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-cyan-900/20 border-2 border-cyan-400/30 rounded-xl mb-6">
              <p className="text-cyan-200 text-sm font-medium flex items-center gap-2 mb-2">
                <GiSparkles className="text-cyan-400" size={18} />
                วิธีการชำระเงิน
              </p>
              <ol className="text-cyan-100 text-xs space-y-1 pl-6 list-decimal">
                <li>เปิดแอพธนาคารของคุณ</li>
                <li>เลือกสแกน QR Code</li>
                <li>สแกน QR Code ด้านบน</li>
                <li>ยืนยันการโอนเงิน</li>
                <li>รอระบบอนุมัติอัตโนมัติ (ประมาณ 1-2 นาที)</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open(qrPaymentData.paymentUrl, '_blank')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <GiCrystalBall size={20} />
                เปิดลิงก์ชำระเงิน
              </button>
              <button
                onClick={() => {
                  setShowQrPayment(false)
                  navigate('/member/deposit/history')
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <FiCheck size={20} />
                ดูประวัติการฝาก
              </button>
            </div>

            <p className="text-center text-emerald-200/60 text-xs mt-4 flex items-center justify-center gap-1">
              <GiMagicSwirl className="animate-spin" style={{ animationDuration: '3s' }} size={14} />
              QR Code นี้จะหมดอายุใน 15 นาที
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Deposit
