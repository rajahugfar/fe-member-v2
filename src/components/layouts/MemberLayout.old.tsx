import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  FiHome,
  FiDollarSign,
  FiTrendingUp,
  FiGrid,
  FiGift,
  FiClock,
  FiUser,
  FiBell,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
  FiRefreshCw,
} from 'react-icons/fi'
import { profileAPI, notificationAPI } from '../../api/memberAPI'
import { useMemberStore } from '../../store/memberStore'
import { toast } from 'react-hot-toast'

interface MenuItem {
  path: string
  icon: React.ElementType
  label: string
  badge?: number
}

const MemberLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { member, isAuthenticated: storeAuth, logout } = useMemberStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [balance, setBalance] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const menuItems: MenuItem[] = [
    { path: '/member/dashboard', icon: FiHome, label: 'หน้าหลัก' },
    { path: '/member/deposit', icon: FiDollarSign, label: 'ฝากเงิน' },
    { path: '/member/withdrawal', icon: FiTrendingUp, label: 'ถอนเงิน' },
    { path: '/member/games', icon: FiGrid, label: 'เกมส์' },
    { path: '/member/lottery', icon: FiGrid, label: 'หวย' },
    { path: '/member/promotions', icon: FiGift, label: 'โปรโมชั่น' },
    { path: '/member/transactions', icon: FiClock, label: 'ประวัติ' },
    { path: '/member/profile', icon: FiUser, label: 'โปรไฟล์' },
  ]

  useEffect(() => {
    console.log('[MemberLayout] useEffect triggered')
    console.log('[MemberLayout] storeAuth:', storeAuth)
    console.log('[MemberLayout] member:', member)
    console.log('[MemberLayout] isReady:', isReady)

    // Don't check auth on initial mount, let Zustand hydrate first
    if (!storeAuth || !member) {
      console.log('[MemberLayout] NO AUTH - storeAuth:', storeAuth, 'member:', member)
      // Commented out redirect to see what's happening
      // navigate('/member/login', { replace: true })
      return
    }

    console.log('[MemberLayout] HAS AUTH - Loading profile and unread count')
    setIsReady(true)
    loadProfile()
    loadUnreadCount()
  }, [storeAuth, member])

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile()
      setProfile(response.data)
      setBalance(response.data.balance || 0)
      localStorage.setItem('memberProfile', JSON.stringify(response.data))
    } catch (error) {
      console.error('Load profile error:', error)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      setUnreadCount(response.data.count || 0)
    } catch (error) {
      console.error('Load unread count error:', error)
    }
  }

  const handleRefreshBalance = async () => {
    setLoadingBalance(true)
    try {
      const response = await profileAPI.getProfile()
      setBalance(response.data.balance || 0)
      toast.success('อัพเดทยอดเงินสำเร็จ')
    } catch (error) {
      toast.error('อัพเดทยอดเงินไม่สำเร็จ')
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('ออกจากระบบสำเร็จ')
    navigate('/member/login')
  }

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Show loading while checking authentication
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white text-lg">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:text-purple-400 transition-colors"
              >
                {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>

              <Link to="/member/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">P</span>
                </div>
                <span className="hidden sm:block text-xl font-bold text-white">เพิ่มโชค</span>
              </Link>
            </div>

            {/* Center: Balance Display */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
              <div className="text-right">
                <p className="text-xs text-white/60">ยอดเงินคงเหลือ</p>
                <p className="text-lg font-bold text-white">
                  ฿{formatBalance(balance)}
                </p>
              </div>
              <button
                onClick={handleRefreshBalance}
                disabled={loadingBalance}
                className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={loadingBalance ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative text-white/60 hover:text-white transition-colors">
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <FiUser size={16} />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {profile?.fullName || 'สมาชิก'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-white/10 overflow-hidden z-20">
                      <Link
                        to="/member/profile"
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <FiUser size={16} />
                        <span>โปรไฟล์</span>
                      </Link>
                      <Link
                        to="/member/profile"
                        className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <FiSettings size={16} />
                        <span>ตั้งค่า</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <FiLogOut size={16} />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-gray-900/50 backdrop-blur-lg border-r border-white/10 overflow-y-auto">
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = isActivePath(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="lg:hidden fixed left-0 top-16 bottom-16 w-64 bg-gray-900 z-50 overflow-y-auto border-r border-white/10">
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 pb-20 lg:pb-4 min-h-screen">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 z-40">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {[
            { path: '/member/dashboard', icon: FiHome, label: 'หน้าหลัก' },
            { path: '/member/deposit', icon: FiDollarSign, label: 'ฝาก' },
            { path: '/member/games', icon: FiGrid, label: 'เกมส์' },
            { path: '/member/lottery', icon: FiGrid, label: 'หวย' },
            { path: '/member/profile', icon: FiUser, label: 'ฉัน' },
          ].map((item) => {
            const Icon = item.icon
            const isActive = isActivePath(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-purple-400'
                    : 'text-white/60'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer - Desktop */}
      <footer className="hidden lg:block lg:ml-64 bg-gray-900/30 border-t border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between text-sm text-white/60">
            <p>&copy; 2024 เพิ่มโชค. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">ติดต่อเรา</a>
              <a href="#" className="hover:text-white transition-colors">Line: @permchok</a>
              <a href="#" className="hover:text-white transition-colors">เงื่อนไข</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MemberLayout
