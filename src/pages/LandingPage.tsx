import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUser,
  FaUserPlus,
  FaLine,
  FaChevronDown,
  FaGamepad,
  FaDice,
  FaCoins,
  FaTimes
} from 'react-icons/fa'
import { siteContentAPI } from '@api/siteContentAPI'
import { gameProviderAPI, type GameProvider } from '@api/gameProviderAPI'
import type { PromotionBanner, SiteSettingsMap } from '../types/siteContent'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const LandingPage = () => {
  const navigate = useNavigate()
  const [, setProviders] = useState<GameProvider[]>([])
  const [promotions, setPromotions] = useState<PromotionBanner[]>([])
  const [settings, setSettings] = useState<SiteSettingsMap>({})
  const [, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [pendingLink, setPendingLink] = useState('')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const [providersRes, promotionsRes, settingsRes] = await Promise.all([
        gameProviderAPI.getProviders(false), // Get all providers (not just featured)
        siteContentAPI.getPromotions('home'),
        siteContentAPI.getSiteSettings(),
      ])

      setProviders(providersRes.data)
      setPromotions(promotionsRes.data.data)
      setSettings(settingsRes.data.data)
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem('token')
  }

  // Handle click on game category or provider
  const handleGameClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault()
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

  const gameCategories = [
    { name: 'แทงมวย', image: '/images/btn-cat-mun.webp', link: '/games?category=boxing' },
    { name: 'แทงบอล', image: '/images/btn-cat-sport.webp', link: '/games?category=football' },
    { name: 'บาคาร่า', image: '/images/btn-cat-card.webp', link: '/games?category=baccarat' },
    { name: 'เกมยิงปลา', image: '/images/btn-cat-fishhunter.webp', link: '/games?category=fishing' },
    { name: 'ไบคเคอรี่', image: '/images/btn-cat-poker.webp', link: '/games?category=other' },
    { name: 'สล็อตออนไลน์', image: '/images/btn-cat-slot.webp', link: '/games?category=slots' },
    { name: 'ไก่ชน', image: '/images/btn-cat-chicken-fighter.webp', link: '/games?category=cockfight' },
    { name: 'หวยออนไลน์', image: '/images/btn-cat-lotto.webp', link: '/lottery' },
  ]

  // รูปโปรโมชั่นตัวอย่าง (ถ้าไม่มีจาก API)
  const defaultPromotions = [
    { id: '1', image: '/images/tab-1.webp', title: 'โปรโมชั่น 1' },
    { id: '2', image: '/images/tab-2.webp', title: 'โปรโมชั่น 2' },
    { id: '3', image: '/images/pro-005.webp', title: 'โปรโมชั่น 3' },
  ]

  // ผู้ให้บริการเกมจากรูปที่มีอยู่
  const staticProviders = [
    { id: '1', name: 'Funky Games', image: '/images/prod-1.webp', link: '/games?provider=FUNKY_GAMES' },
    { id: '2', name: 'PG Soft', image: '/images/prod-2.webp', link: '/games?provider=PGSOFT' },
    { id: '3', name: 'Live22', image: '/images/prod-3.webp', link: '/games?provider=LIVE22' },
    { id: '4', name: 'Slot X Casino', image: '/images/prod-4.webp', link: '/games?provider=SLOTXO' },
    { id: '5', name: 'Dream Gaming', image: '/images/prod-6.webp', link: '/games?provider=DREAMGAMING' },
    { id: '6', name: 'Habanero', image: '/images/prod-11.webp', link: '/games?provider=HABANERO' },
  ]

  const faqs = [
    {
      question: `${settings.site_name || 'PERMCHOK'} เป็นเว็บคาสิโนออนไลน์ที่ไหนเชื่อถือหรือไม่?`,
      answer: 'เว็บคาสิโนออนไลน์ของเรามีมาตรฐานสากล ได้รับใบอนุญาตถูกต้องตามกฎหมาย มีระบบรักษาความปลอดภัยสูง'
    },
    {
      question: `${settings.site_name || 'PERMCHOK'} มีเกมอะไรให้เล่นบ้าง?`,
      answer: 'มีเกมให้เลือกเล่นมากมาย ทั้งสล็อต บาคาร่า รูเล็ต ไฮโล เสือมังกร ยิงปลา และอื่นๆอีกมากมาย'
    },
    {
      question: `ระบบฝาก-ถอนของ ${settings.site_name || 'PERMCHOK'} ใช้เวลานานแค่ไหน?`,
      answer: 'ระบบอัตโนมัติ รวดเร็วภายใน 30 วินาที ไม่มีขั้นต่ำ'
    },
    {
      question: `${settings.site_name || 'PERMCHOK'} มีโปรโมชั่นอะไรบ้าง?`,
      answer: 'มีโปรโมชั่นมากมาย โบนัสต้อนรับ คืนยอดเสีย ฝากครั้งแรก และโปรพิเศษอื่นๆอีกมากมาย'
    },
    {
      question: `สามารถติดต่อทีมงาน ${settings.site_name || 'PERMCHOK'} ได้ช่องทางไหน?`,
      answer: 'สามารถติดต่อได้ตลอด 24 ชั่วโมง ผ่าน Line, Telegram, Facebook หรือแชทสด'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1810] via-[#0d1f14] to-[#0a1810] relative overflow-hidden">
      {/* Background with forest image */}
      <div className="fixed inset-0 bg-[url('/images/forest-bg.jpg')] bg-cover bg-center opacity-20 blur-sm" />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1810]/90 via-[#0a1810]/70 to-[#0a1810]/95" />

      {/* Animated gradient overlay */}
      <div className="fixed inset-0 bg-gradient-radial from-green-900/10 via-transparent to-transparent animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Animated coins decoration */}
      <div className="fixed top-20 left-10 animate-bounce opacity-10 hover:opacity-30 transition-opacity">
        <FaCoins className="text-yellow-500 text-6xl drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
      </div>
      <div className="fixed top-40 right-20 animate-bounce opacity-10 hover:opacity-30 transition-opacity" style={{ animationDelay: '1s' }}>
        <FaDice className="text-yellow-500 text-5xl drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
      </div>
      <div className="fixed bottom-40 left-20 animate-bounce opacity-10 hover:opacity-30 transition-opacity" style={{ animationDelay: '2s' }}>
        <FaGamepad className="text-yellow-500 text-5xl drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header with curved design */}
        <header className="relative">
          {/* Top decoration bar */}
          <div className="h-3 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 border-t-2 border-yellow-400" />

          {/* Main header */}
          <div className="bg-gradient-to-b from-yellow-700 to-yellow-800 shadow-2xl relative">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {/* Logo with glow effect */}
                <Link to="/" className="flex items-center gap-4 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
                      <img
                        src="/images/logo.webp"
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-white drop-shadow-2xl tracking-wide"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(234,179,8,0.5)' }}>
                      {settings.site_name || 'PERMCHOK'}
                    </h1>
                    <p className="text-yellow-200 text-sm font-semibold drop-shadow-lg">
                      คาสิโนออนไลน์ อันดับ 1
                    </p>
                  </div>
                </Link>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link
                    to="/member/login"
                    className="relative px-6 py-3 bg-gradient-to-br from-green-600 to-green-800 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform border-2 border-yellow-400 flex items-center gap-2"
                  >
                    <FaUser /> เข้าสู่ระบบ
                  </Link>
                  <Link
                    to="/member/register"
                    className="relative px-6 py-3 bg-gradient-to-br from-yellow-500 to-yellow-600 text-green-900 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform border-2 border-yellow-300 flex items-center gap-2 animate-pulse"
                  >
                    <FaUserPlus /> สมัครสมาชิก
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom curved decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-yellow-800 to-transparent" />
          </div>

          {/* Menu Buttons Row */}
          <div className="container mx-auto px-4 -mt-6 relative z-20">
            <div className="grid grid-cols-4 gap-4">
              <Link
                to="/member/profile"
                className="relative hover:scale-105 transition-transform"
              >
                <img src="/images/btn-play-profile.webp" alt="บัญชี" className="w-full h-auto" />
              </Link>

              <Link
                to="/member/deposit"
                className="relative hover:scale-105 transition-transform"
              >
                <img src="/images/btn-play-topup.webp" alt="ฝากถอน" className="w-full h-auto" />
              </Link>

              <Link
                to="/member/register"
                className="relative hover:scale-105 transition-transform"
              >
                <img src="/images/btn-play-register.webp" alt="สมัคร" className="w-full h-auto" />
              </Link>

              <a
                href={settings.contact_line || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="relative hover:scale-105 transition-transform"
              >
                <img src="/images/btn-play-contact.webp" alt="ติดต่อ" className="w-full h-auto" />
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section - 2 Column Layout */}
        <section className="container mx-auto px-4 py-10">
          <div className="bg-gradient-to-br from-green-900/50 to-green-950/50 backdrop-blur-md rounded-3xl border-4 border-yellow-600/80 shadow-[0_0_50px_rgba(202,138,4,0.3)] overflow-hidden hover:border-yellow-500 transition-all duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left - Promotion Carousel */}
              <div className="relative">
                <Swiper
                  modules={[Autoplay, Pagination, EffectFade]}
                  effect="fade"
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  pagination={{
                    clickable: true,
                    bulletActiveClass: '!bg-yellow-500',
                  }}
                  loop
                  className="rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-700"
                >
                  {(promotions.length > 0 ? promotions : defaultPromotions).map((promo: any) => (
                    <SwiperSlide key={promo.id}>
                      <img
                        src={promo.image?.file_url || promo.image}
                        alt={promo.title}
                        className="w-full aspect-square object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Right - Quick Links */}
              <div className="flex flex-col gap-4 justify-center">
                <Link
                  to="/member/promotions"
                  className="relative hover:scale-105 transition-transform"
                >
                  <img src="/images/btn-promotion.webp" alt="โปรโมชั่น" className="w-full h-auto" />
                </Link>

                <a
                  href={settings.social_line || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative hover:scale-105 transition-transform"
                >
                  <img src="/images/btn-news.webp" alt="บทความ" className="w-full h-auto" />
                </a>

                <a
                  href={settings.social_telegram || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative hover:scale-105 transition-transform"
                >
                  <img src="/images/btn-subcontact.webp" alt="ข่าวสาร" className="w-full h-auto" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Game Categories Menu with enhanced styling */}
        <section className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gameCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <a
                  href={category.link}
                  onClick={(e) => handleGameClick(e, category.link)}
                  className="relative rounded-2xl shadow-[0_0_30px_rgba(202,138,4,0.2)] hover:shadow-[0_0_50px_rgba(202,138,4,0.5)] hover:scale-105 transition-all duration-300 group overflow-hidden block border-2 border-transparent hover:border-yellow-500/50 cursor-pointer"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-auto object-contain group-hover:brightness-110 transition-all duration-300"
                  />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Game Providers Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <img src="/images/title-section-games.webp" alt="รายการเกม" className="mx-auto h-16 drop-shadow-[0_0_20px_rgba(202,138,4,0.6)]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {staticProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <a
                  href={provider.link}
                  onClick={(e) => handleGameClick(e, provider.link)}
                  className="block relative group cursor-pointer hover:scale-105 transition-all duration-300"
                >
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-auto rounded-2xl shadow-[0_0_30px_rgba(202,138,4,0.3)] group-hover:shadow-[0_0_50px_rgba(202,138,4,0.6)] transition-all duration-300"
                  />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Promotions Grid Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
              กิจกรรม
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(promotions.length > 0 ? promotions : defaultPromotions).map((promo: any, index) => (
              <motion.div
                key={promo.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={promo.link_url || '/member/promotions'}
                  className="block relative bg-gradient-to-br from-green-900/80 to-green-950/80 backdrop-blur-sm rounded-2xl border-4 border-yellow-700 shadow-2xl overflow-hidden hover:scale-105 transition-all duration-300 group"
                >
                  <img
                    src={promo.image?.file_url || promo.image}
                    alt={promo.title}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SEO Content & FAQ Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-green-900/40 to-green-950/40 backdrop-blur-sm rounded-3xl border-4 border-yellow-700 p-8">
            {/* SEO Text */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-green-400 mb-4">
                {settings.site_name || 'PERMCHOK'} คาสิโนออนไลน์ เล่นง่าย จ่ายจริง การันตีความมั่นคง
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                {settings.site_description || 'เว็บคาสิโนออนไลน์อันดับหนึ่งของประเทศไทย มาตรฐานสากล ระบบปลอดภัย ฝาก-ถอนรวดเร็ว พร้อมให้บริการตลอด 24 ชั่วโมง'}
              </p>
              <p className="text-gray-300 leading-relaxed">
                มีเกมให้เลือกเล่นหลากหลาย ทั้ง <span className="text-green-400 font-bold">บาคาร่า สล็อต รูเล็ต ไฮโล</span> และเกมคาสิโนสดอื่นๆอีกมากมาย จากค่ายชั้นนำระดับโลก พร้อมโปรโมชั่นมากมาย โบนัสต้อนรับ คืนยอดเสีย ระบบอัตโนมัติรวดเร็วทันใจ
              </p>
            </div>

            {/* FAQ Section */}
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-6">
                FAQ คำถามที่พบบ่อยเกี่ยวกับ {settings.site_name || 'PERMCHOK'}
              </h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-green-900/30 backdrop-blur-sm rounded-xl border-2 border-green-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-green-800/30 transition-colors"
                    >
                      <span className="text-green-300 font-semibold pr-4">{faq.question}</span>
                      <FaChevronDown
                        className={`text-green-400 transition-transform ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Provider Logos Footer */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-sm rounded-2xl border-2 border-gray-700 p-6">
            <div className="grid grid-cols-6 md:grid-cols-12 gap-4 items-center justify-items-center opacity-60">
              {staticProviders.map((provider: any) => (
                <div key={provider.id} className="w-16 h-16">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-950/80 backdrop-blur-sm border-t-4 border-yellow-700 py-8 mt-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Certifications */}
              <div>
                <h3 className="text-green-400 font-bold text-lg mb-4">Certifications</h3>
                <div className="flex gap-3 flex-wrap">
                  <img src="/images/certificates/4.webp" alt="Cert 1" className="w-12 h-12 object-contain" />
                  <img src="/images/certificates/5.webp" alt="Cert 2" className="w-12 h-12 object-contain" />
                  <img src="/images/certificates/6.webp" alt="Cert 3" className="w-12 h-12 object-contain" />
                  <img src="/images/certificates/7.webp" alt="Cert 4" className="w-12 h-12 object-contain" />
                  <img src="/images/certificates/8.webp" alt="Cert 5" className="w-12 h-12 object-contain" />
                </div>
              </div>

              {/* Responsible Gaming */}
              <div>
                <h3 className="text-green-400 font-bold text-lg mb-4">Responsible Gaming</h3>
                <div className="flex gap-3 flex-wrap">
                  <img src="/images/certificates/9.webp" alt="Gaming 1" className="w-12 h-12 object-contain" />
                  <img src="/images/certificates/10.webp" alt="Gaming 2" className="w-12 h-12 object-contain" />
                  <img src="/images/certificates/11.webp" alt="Gaming 3" className="w-12 h-12 object-contain" />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-green-400 font-bold text-lg mb-4">Payment methods</h3>
                <div className="grid grid-cols-6 gap-2">
                  <img src="/images/certificates/12.webp" alt="Pay 1" className="w-8 h-8 object-contain" />
                  <img src="/images/certificates/13.webp" alt="Pay 2" className="w-8 h-8 object-contain" />
                  <img src="/images/certificates/14.webp" alt="Pay 3" className="w-8 h-8 object-contain" />
                  <img src="/images/certificates/15.webp" alt="Pay 4" className="w-8 h-8 object-contain" />
                  <img src="/images/certificates/16.webp" alt="Pay 5" className="w-8 h-8 object-contain" />
                  <img src="/images/certificates/17.webp" alt="Pay 6" className="w-8 h-8 object-contain" />
                  <img src="/images/certificates/18.webp" alt="Pay 7" className="w-8 h-8 object-contain" />
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800">
              © {new Date().getFullYear()} {settings.site_name || 'PERMCHOK'}. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Contact Button */}
      <a
        href={settings.contact_line || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce"
      >
        <FaLine className="text-3xl text-white" />
      </a>
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

export default LandingPage
