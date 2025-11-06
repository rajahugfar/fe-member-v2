import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiGift, FiPercent, FiDollarSign, FiTrendingUp, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Promotion {
  id: string
  code: string
  name: string
  description: string
  type: string
  bonus_type: string
  bonus_value: number
  max_bonus: number
  min_deposit: number
  turnover_requirement: number
  max_withdraw: number
  image_url: string
  status: string
  is_active: boolean
  terms_and_conditions: string
}

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const response = await fetch(`${API_URL}/api/v1/promotions`)
      const data = await response.json()

      if (data.success) {
        setPromotions(data.data || [])
      } else {
        toast.error('ไม่สามารถโหลดโปรโมชั่นได้')
      }
    } catch (error) {
      console.error('Failed to load promotions:', error)
      toast.error('เกิดข้อผิดพลาดในการโหลดโปรโมชั่น')
    } finally {
      setLoading(false)
    }
  }

  const getPromotionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'new_member': 'สมาชิกใหม่',
      'daily_first': 'ครั้งแรกของวัน',
      'normal': 'รับได้ตลอด',
      'cashback': 'คืนยอดเสีย',
      'deposit': 'โบนัสฝาก',
      'freespin': 'ฟรีสปิน'
    }
    return types[type] || type
  }

  const getPromotionTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      'new_member': 'bg-gradient-to-r from-yellow-500 to-orange-500',
      'daily_first': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'normal': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'cashback': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'deposit': 'bg-gradient-to-r from-red-500 to-rose-500',
      'freespin': 'bg-gradient-to-r from-indigo-500 to-violet-500'
    }
    return badges[type] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 mb-2 flex items-center gap-3">
            <FiGift className="text-yellow-400" />
            โปรโมชั่น
          </h1>
          <p className="text-gray-400">รับโบนัสและข้อเสนอพิเศษมากมาย</p>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20">
            <FiGift className="mx-auto text-6xl text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">ไม่มีโปรโมชั่นในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>

                <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-400/20 shadow-xl">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={promo.image_url || '/images/promo-1.webp'}
                      alt={promo.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/logo.webp'
                      }}
                    />
                    {/* Badge */}
                    <div className={`absolute top-3 right-3 ${getPromotionTypeBadge(promo.type)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                      {getPromotionTypeLabel(promo.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {promo.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {promo.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <FiPercent className="text-yellow-500" />
                          โบนัส:
                        </span>
                        <span className="font-bold text-yellow-500">
                          {promo.bonus_type === 'percentage'
                            ? `${promo.bonus_value}%`
                            : `${promo.bonus_value} บาท`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <FiDollarSign className="text-green-500" />
                          รับสูงสุด:
                        </span>
                        <span className="font-semibold text-white">
                          {promo.max_bonus.toLocaleString()} บาท
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">ฝากขั้นต่ำ:</span>
                        <span className="text-white">
                          {promo.min_deposit.toLocaleString()} บาท
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <FiTrendingUp className="text-blue-500" />
                          เทิร์นโอเวอร์:
                        </span>
                        <span className="text-white">
                          {promo.turnover_requirement}x
                        </span>
                      </div>

                      {promo.max_withdraw > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">ถอนสูงสุด:</span>
                          <span className="text-white">
                            {promo.max_withdraw.toLocaleString()} บาท
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPromo(promo)}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <FiGift />
                      รับโปรโมชั่น
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal - Promotion Details */}
        {selectedPromo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPromo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-400/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-purple-900 border-b border-purple-400/20 p-6 flex justify-between items-start z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedPromo.name}
                  </h2>
                  <span className={`${getPromotionTypeBadge(selectedPromo.type)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                    {getPromotionTypeLabel(selectedPromo.type)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPromo(null)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              {/* Image */}
              <div className="p-6">
                <img
                  src={selectedPromo.image_url || '/images/promo-1.webp'}
                  alt={selectedPromo.name}
                  className="w-full rounded-lg mb-6 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/logo.webp'
                  }}
                />

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">รายละเอียด</h3>
                  <p className="text-gray-300">{selectedPromo.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/20">
                    <p className="text-gray-400 text-sm mb-1">โบนัส</p>
                    <p className="text-yellow-500 font-bold text-xl">
                      {selectedPromo.bonus_type === 'percentage'
                        ? `${selectedPromo.bonus_value}%`
                        : `${selectedPromo.bonus_value} บาท`}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/20">
                    <p className="text-gray-400 text-sm mb-1">รับสูงสุด</p>
                    <p className="text-white font-bold text-xl">
                      {selectedPromo.max_bonus.toLocaleString()} บาท
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="text-gray-400 text-sm mb-1">ฝากขั้นต่ำ</p>
                    <p className="text-white font-bold text-xl">
                      {selectedPromo.min_deposit.toLocaleString()} บาท
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                    <p className="text-gray-400 text-sm mb-1">เทิร์นโอเวอร์</p>
                    <p className="text-blue-400 font-bold text-xl">
                      {selectedPromo.turnover_requirement}x
                    </p>
                  </div>
                </div>

                {/* Terms */}
                {selectedPromo.terms_and_conditions && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-2">เงื่อนไข</h3>
                    <div className="bg-slate-800/50 p-4 rounded-xl text-gray-300 text-sm border border-slate-700">
                      {selectedPromo.terms_and_conditions}
                    </div>
                  </div>
                )}

                {/* How to Claim */}
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <FiGift className="text-blue-400" />
                    วิธีรับโปรโมชั่น
                  </h4>
                  <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                    <li>ฝากเงินตามยอดขั้นต่ำ ({selectedPromo.min_deposit.toLocaleString()} บาท)</li>
                    <li>ติดต่อแอดมินผ่าน LINE หรือ แชท</li>
                    <li>แจ้งรหัสโปรโมชั่น: <span className="font-bold text-yellow-400">{selectedPromo.code}</span></li>
                    <li>รอแอดมินอนุมัติและเพิ่มโบนัสให้</li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <a
                    href="https://line.me/ti/p/@permchok"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    ติดต่อผ่าน LINE
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPromo.code)
                      toast.success('คัดลอกรหัสโปรโมชั่นแล้ว!')
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    คัดลอกรหัส
                  </button>
                  <button
                    onClick={() => setSelectedPromo(null)}
                    className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all duration-300"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PromotionsPage
