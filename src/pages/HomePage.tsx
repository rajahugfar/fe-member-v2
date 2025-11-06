import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaGamepad, FaDice, FaGift, FaStar } from 'react-icons/fa'
import { siteContentAPI } from '@api/siteContentAPI'
import type { GameProvider as SiteGameProvider, PromotionBanner, SiteSettingsMap } from '../types/siteContent'

const HomePage = () => {
  const [providers, setProviders] = useState<SiteGameProvider[]>([])
  const [promotions, setPromotions] = useState<PromotionBanner[]>([])
  const [settings, setSettings] = useState<SiteSettingsMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const [providersRes, promotionsRes, settingsRes] = await Promise.all([
        siteContentAPI.getGameProviders(true), // Featured only
        siteContentAPI.getPromotions('home'),
        siteContentAPI.getSiteSettings(),
      ])

      setProviders(providersRes.data.data)
      setPromotions(promotionsRes.data.data)
      setSettings(settingsRes.data.data)
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
          {settings.site_name || 'ยินดีต้อนรับสู่ Permchok'}
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          {settings.site_description || 'เว็บแทงหวยและเกมออนไลน์ จ่ายจริง จ่ายเร็ว ฝาก-ถอนออโต้ 24 ชั่วโมง'}
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="btn btn-primary text-lg">
            สมัครสมาชิก
          </Link>
          <Link to="/games" className="btn btn-outline text-lg">
            เล่นเกมส์
          </Link>
        </div>
      </motion.section>

      {/* Promotions Carousel */}
      {promotions.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6">โปรโมชั่นพิเศษ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={promo.link_url || '#'}
                  className="card overflow-hidden card-hover block"
                >
                  {promo.image && (
                    <div className="relative aspect-square bg-gray-800">
                      <img
                        src={promo.image.file_url}
                        alt={promo.image.alt_text || promo.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">{promo.title}</h3>
                    {promo.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {promo.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card card-hover text-center"
          >
            <div className="text-5xl mb-4 text-primary-500">
              <FaDice className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">แทงหวย</h3>
            <p className="text-gray-400">
              หวยไทย หวยลาว หวยฮานอย จ่ายสูงสุด บาทละ 900
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card card-hover text-center"
          >
            <div className="text-5xl mb-4 text-primary-500">
              <FaGamepad className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">เกมส์สล็อต</h3>
            <p className="text-gray-400">
              เกมส์สล็อตจากค่ายดัง แตกง่าย โบนัสเยอะ
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card card-hover text-center"
          >
            <div className="text-5xl mb-4 text-primary-500">
              <FaGift className="mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">โปรโมชั่น</h3>
            <p className="text-gray-400">
              โบนัสต้อนรับ คืนยอดเสีย โปรโมชั่นมากมาย
            </p>
          </motion.div>
        </div>
      </section>

      {/* Game Providers */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">ค่ายเกมส์ยอดนิยม</h2>
          <Link
            to="/games"
            className="text-primary-500 hover:text-primary-400 transition-colors"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {providers.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/games?provider=${provider.code}`}
                  className="card card-hover flex flex-col items-center justify-center p-8 relative overflow-hidden group"
                >
                  <div className="relative z-10">
                    {provider.logo_image ? (
                      <img
                        src={provider.logo_image.file_url}
                        alt={provider.logo_image.alt_text || provider.name}
                        className="w-full h-24 object-contain mb-4"
                        loading="lazy"
                      />
                    ) : (
                      <FaGamepad className="text-6xl text-gray-600 mb-4 mx-auto" />
                    )}
                    <h3 className="text-center font-semibold">{provider.name}</h3>
                    {provider.category && (
                      <p className="text-center text-sm text-gray-400 mt-1">
                        {provider.category.name}
                      </p>
                    )}
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card text-center py-12 bg-gradient-to-r from-primary-500/10 to-primary-600/10 border-primary-500/30"
      >
        <FaStar className="text-5xl text-primary-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          สมัครสมาชิกวันนี้ รับโบนัสต้อนรับสูงสุด 100% ฝาก-ถอนไม่มีขั้นต่ำ
        </p>
        <Link to="/register" className="btn btn-primary text-lg">
          สมัครเลย
        </Link>
      </motion.section>
    </div>
  )
}

export default HomePage
