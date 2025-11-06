import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiPhone, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi'
import { useMemberStore } from '../../store/memberStore'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useMemberStore()
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const validatePhone = (phone: string) => {
    const phoneRegex = /^0[0-9]{9}$/
    return phoneRegex.test(phone)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: any = {}

    if (!formData.phone) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (0812345678)'
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน'
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await login({
        phone: formData.phone,
        password: formData.password,
      })

      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('savedPhone', formData.phone)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('savedPhone')
      }

      // Wait for Zustand persist to save, then navigate
      setTimeout(() => {
        navigate('/member')
      }, 100)
    } catch (error: any) {
      console.error('Login error:', error)
      // Error is already handled in store
    }
  }

  React.useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('memberToken')
    if (token) {
      navigate('/member')
    }

    // Load saved phone if remember me was checked
    const rememberMe = localStorage.getItem('rememberMe')
    const savedPhone = localStorage.getItem('savedPhone')
    if (rememberMe === 'true' && savedPhone) {
      setFormData(prev => ({ ...prev, phone: savedPhone, rememberMe: true }))
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-white">P</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">เพิ่มโชค</h1>
              <p className="text-white/70 text-sm">ระบบสมาชิก</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                เบอร์โทรศัพท์
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiPhone className="text-white/50" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0812345678"
                  className={`w-full pl-11 pr-4 py-3 bg-white/10 border ${
                    errors.phone ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-red-400 text-xs">{errors.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-white/50" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 bg-white/10 border ${
                    errors.password ? 'border-red-500' : 'border-white/20'
                  } rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-400 text-xs">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-2 text-white/80 text-sm">จดจำฉันไว้</span>
              </label>
              <Link
                to="/member/forgot-password"
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <FiLogIn />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              ยังไม่มีบัญชี?{' '}
              <Link
                to="/member/register"
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-white/50 hover:text-white/80 text-xs transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/50 text-xs">
          <p>&copy; 2024 เพิ่มโชค. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
