import { Link, useNavigate } from 'react-router-dom'
import { FaHome, FaGamepad, FaDice, FaGift, FaUser, FaWallet, FaSignOutAlt } from 'react-icons/fa'
import { useAuthStore } from '@store/authStore'
import { formatCurrency } from '@utils/format'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-dark-800/95 backdrop-blur-md border-b border-dark-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold gradient-text">Permchok</div>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-300 hover:text-primary-500 transition-colors"
            >
              <FaHome />
              <span>หน้าแรก</span>
            </Link>
            <Link
              to="/lottery"
              className="flex items-center space-x-2 text-gray-300 hover:text-primary-500 transition-colors"
            >
              <FaDice />
              <span>หวย</span>
            </Link>
            <Link
              to="/games"
              className="flex items-center space-x-2 text-gray-300 hover:text-primary-500 transition-colors"
            >
              <FaGamepad />
              <span>เกมส์</span>
            </Link>
            <Link
              to="/promotions"
              className="flex items-center space-x-2 text-gray-300 hover:text-primary-500 transition-colors"
            >
              <FaGift />
              <span>โปรโมชั่น</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Balance Display */}
                <div className="glass px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FaWallet className="text-primary-500" />
                    <span className="font-semibold text-primary-500">
                      {formatCurrency(user.credit)}
                    </span>
                  </div>
                </div>

                {/* Deposit Button */}
                <Link
                  to="/deposit"
                  className="btn btn-primary text-sm"
                >
                  ฝากเงิน
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 glass px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                    <FaUser />
                    <span>{user.fullname || user.phone}</span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 glass rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <FaUser className="inline mr-2" />
                      โปรไฟล์
                    </Link>
                    <Link
                      to="/transactions"
                      className="block px-4 py-3 hover:bg-white/10 transition-colors"
                    >
                      <FaWallet className="inline mr-2" />
                      ประวัติการเงิน
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-red-400"
                    >
                      <FaSignOutAlt className="inline mr-2" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary text-sm">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
