import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaFilter, FaTimes, FaUser, FaUserPlus, FaGamepad } from 'react-icons/fa'
import { gameProviderAPI, type GameProvider } from '@api/gameProviderAPI'

const GamesPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [providers, setProviders] = useState<GameProvider[]>([])
  const [filteredProviders, setFilteredProviders] = useState<GameProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [pendingLink, setPendingLink] = useState('')

  const categories = [
    { id: 'all', name: 'ทั้งหมด', value: '' },
    { id: 'slot', name: 'สล็อต', value: 'slot' },
    { id: 'live', name: 'คาสิโนสด', value: 'live' },
    { id: 'sport', name: 'กีฬา', value: 'sport' },
    { id: 'card', name: 'ไพ่', value: 'card' },
    { id: 'lottery', name: 'หวย', value: 'lottery' },
  ]

  useEffect(() => {
    loadProviders()
  }, [])

  useEffect(() => {
    filterProviders()
  }, [providers, selectedCategory, searchQuery])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const response = await gameProviderAPI.getProviders(false)
      setProviders(response.data)
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProviders = () => {
    let filtered = [...providers]

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProviders(filtered)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (category === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', category)
    }
    setSearchParams(searchParams)
  }

  const clearFilters = () => {
    setSelectedCategory('all')
    setSearchQuery('')
    setSearchParams({})
  }

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem('token')
  }

  // Handle click on provider card
  const handleProviderClick = (e: React.MouseEvent, provider: GameProvider) => {
    e.preventDefault()
    const link = `/games?provider=${provider.product_name}`

    if (isLoggedIn()) {
      navigate(link)
    } else {
      setPendingLink(link)
      setShowLoginPopup(true)
    }
  }

  // Handle login redirect
  const handleLoginRedirect = () => {
    setShowLoginPopup(false)
    navigate('/login', { state: { from: pendingLink } })
  }

  // Handle register redirect
  const handleRegisterRedirect = () => {
    setShowLoginPopup(false)
    navigate('/register', { state: { from: pendingLink } })
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(180deg, #0a1520 0%, #1a2332 50%, #0a1520 100%)',
      position: 'relative',
    }}>
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4"
          >
            รายการเกมส์ทั้งหมด
          </motion.h1>
          <p className="text-gray-400 text-lg">เลือกค่ายเกมส์ที่คุณชื่นชอบ</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาค่ายเกมส์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-yellow-700/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all"
              />
            </div>
            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-600/30 transition-all flex items-center gap-2"
              >
                <FaTimes /> ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.value)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-[0_0_20px_rgba(202,138,4,0.4)]'
                    : 'bg-gray-800/50 border border-yellow-700/30 text-gray-300 hover:border-yellow-500/50 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-gray-400 text-sm">
            {loading ? 'กำลังโหลด...' : `แสดง ${filteredProviders.length} จาก ${providers.length} ค่ายเกมส์`}
          </div>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-20">
            <FaFilter className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">ไม่พบค่ายเกมส์</h3>
            <p className="text-gray-500">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่อีกครั้ง</p>
            <button
              onClick={clearFilters}
              className="mt-6 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-black font-medium transition-all"
            >
              ล้างตัวกรอง
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                <a
                  href={`/games?provider=${provider.product_name}`}
                  onClick={(e) => handleProviderClick(e, provider)}
                  className="block relative rounded-xl shadow-[0_0_20px_rgba(202,138,4,0.15)] hover:shadow-[0_0_30px_rgba(202,138,4,0.3)] overflow-hidden hover:scale-105 transition-all duration-300 group border border-yellow-700/20 hover:border-yellow-500/50 cursor-pointer"
                >
                  {/* Category Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-1 text-xs font-bold bg-black/60 backdrop-blur-sm rounded text-yellow-400 border border-yellow-500/30">
                      {provider.category}
                    </span>
                  </div>

                  {/* Provider Image */}
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900">
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${provider.image_path}`}
                      alt={provider.description}
                      className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/placeholder-game.webp'
                      }}
                    />
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                    <span className="text-white font-bold text-sm">เล่นเลย</span>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Login Required Popup */}
      <AnimatePresence>
        {showLoginPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setShowLoginPopup(false)}
            />

            {/* Popup Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-2 border-yellow-500/30 shadow-[0_0_50px_rgba(202,138,4,0.3)] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 relative">
                  <button
                    onClick={() => setShowLoginPopup(false)}
                    className="absolute top-4 right-4 text-black hover:text-gray-800 transition-colors"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                  <FaGamepad className="text-5xl text-black mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-black text-center">
                    เข้าสู่ระบบเพื่อเล่นเกม
                  </h2>
                </div>

                {/* Body */}
                <div className="p-8 text-center">
                  <p className="text-gray-300 text-lg mb-8">
                    กรุณาเข้าสู่ระบบหรือสมัครสมาชิก<br />เพื่อเข้าเล่นเกมส์
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <button
                      onClick={handleLoginRedirect}
                      className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(202,138,4,0.4)] hover:shadow-[0_0_30px_rgba(202,138,4,0.6)] transform hover:scale-105"
                    >
                      <FaUser className="inline-block mr-2" />
                      เข้าสู่ระบบ
                    </button>

                    <button
                      onClick={handleRegisterRedirect}
                      className="w-full py-4 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300 border-2 border-gray-600 hover:border-gray-500 transform hover:scale-105"
                    >
                      <FaUserPlus className="inline-block mr-2" />
                      สมัครสมาชิก
                    </button>

                    <button
                      onClick={() => setShowLoginPopup(false)}
                      className="w-full py-3 px-6 text-gray-400 hover:text-white transition-colors"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GamesPage
