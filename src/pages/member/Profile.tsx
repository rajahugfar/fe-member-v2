import React, { useState, useEffect } from 'react'
import { FiUser, FiPhone, FiMessageCircle, FiCreditCard, FiLock, FiShield, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { useMemberStore } from '../../store/memberStore'
import { profileAPI } from '../../api/memberAPI'
import { toast } from 'react-hot-toast'
import BankIcon from '../../components/BankIcon'

const THAI_BANKS = [
  { value: 'KBANK', label: 'กสิกรไทย' },
  { value: 'SCB', label: 'ไทยพาณิชย์' },
  { value: 'BBL', label: 'กรุงเทพ' },
  { value: 'KTB', label: 'กรุงไทย' },
  { value: 'TMB', label: 'ทหารไทยธนชาต' },
  { value: 'BAY', label: 'กรุงศรีอยุธยา' },
  { value: 'GSB', label: 'ออมสิน' },
  { value: 'BAAC', label: 'ธ.ก.ส.' },
  { value: 'TRUEWALLET', label: 'TrueMoney Wallet' },
]

type Tab = 'personal' | 'bank' | 'password' | 'security'

const Profile: React.FC = () => {
  const { member, loadProfile: refreshProfile, updateProfile: updateMemberProfile } = useMemberStore()
  const [activeTab, setActiveTab] = useState<Tab>('personal')
  const [bankAccounts, setBankAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Personal Info Edit State
  const [editMode, setEditMode] = useState(false)
  const [personalForm, setPersonalForm] = useState({
    fullName: '',
    lineId: '',
    email: ''
  })

  // Bank Account Modal State
  const [showBankModal, setShowBankModal] = useState(false)
  const [bankForm, setBankForm] = useState({
    id: null as number | null,
    bankName: '',
    accountNumber: '',
    accountName: '',
  })

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (member) {
      // Set form data from store
      setPersonalForm({
        fullName: member.fullname || '',
        lineId: member.line || '',
        email: ''
      })

      // Set bank account from member data
      if (member.bankCode && member.bankNumber) {
        setBankAccounts([{
          id: 1,
          bankName: member.bankCode,
          accountNumber: member.bankNumber,
          accountName: member.fullname || '',
          isPrimary: true
        }])
      } else {
        setBankAccounts([])
      }
    }
  }, [member])

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      await updateMemberProfile({
        fullname: personalForm.fullName,
        line: personalForm.lineId
      })
      setEditMode(false)
    } catch (error: any) {
      console.error('Update profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBankAccounts = async () => {
    try {
      const response = await profileAPI.getBankAccounts()
      setBankAccounts(response.data.data || [])
    } catch (error) {
      console.error('Load bank accounts error:', error)
    }
  }

  const handleSaveBankAccount = async () => {
    try {
      if (bankForm.id) {
        await profileAPI.updateBankAccount(bankForm.id, bankForm)
        toast.success('แก้ไขบัญชีธนาคารสำเร็จ')
      } else {
        await profileAPI.addBankAccount(bankForm)
        toast.success('เพิ่มบัญชีธนาคารสำเร็จ')
      }
      setShowBankModal(false)
      loadBankAccounts()
    } catch (error: any) {
      console.error('Save bank account error:', error)
      toast.error(error.response?.data?.message || 'บันทึกบัญชีธนาคารไม่สำเร็จ')
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('รหัสผ่านใหม่ไม่ตรงกัน')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    try {
      await profileAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      })
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Change password error:', error)
      toast.error(error.response?.data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white">โปรไฟล์สมาชิก</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'personal', icon: FiUser, label: 'ข้อมูลส่วนตัว' },
            { id: 'bank', icon: FiCreditCard, label: 'บัญชีธนาคาร' },
            { id: 'password', icon: FiLock, label: 'เปลี่ยนรหัสผ่าน' },
            { id: 'security', icon: FiShield, label: 'ความปลอดภัย' },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">ข้อมูลส่วนตัว</h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FiEdit2 size={16} />
                  <span>แก้ไข</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiCheck size={16} />
                    <span>บันทึก</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false)
                      refreshProfile()
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FiX size={16} />
                    <span>ยกเลิก</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">เบอร์โทรศัพท์</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <FiPhone className="text-white/60" />
                  <span className="text-white">{member?.phone}</span>
                  <span className="ml-auto text-xs text-white/60">(ไม่สามารถแก้ไขได้)</span>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">ชื่อ-นามสกุล</label>
                {editMode ? (
                  <input
                    type="text"
                    value={personalForm.fullName}
                    onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <FiUser className="text-white/60" />
                    <span className="text-white">{member?.fullname}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Line ID</label>
                {editMode ? (
                  <input
                    type="text"
                    value={personalForm.lineId}
                    onChange={(e) => setPersonalForm({ ...personalForm, lineId: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="@yourlineid"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <FiMessageCircle className="text-white/60" />
                    <span className="text-white">{member?.line || '-'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">สมาชิกตั้งแต่</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-white">{formatDate(member?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Accounts Tab */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">บัญชีธนาคาร</h2>
              <p className="text-white/60 text-sm">บัญชีสำหรับถอนเงิน</p>
            </div>

            <div className="space-y-3">
              {bankAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60 mb-2">ยังไม่มีบัญชีธนาคาร</p>
                  <p className="text-white/40 text-sm">กรุณาติดต่อแอดมินเพื่อเพิ่มบัญชีธนาคาร</p>
                </div>
              ) : (
                bankAccounts.map(bank => (
                  <div
                    key={bank.id}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <BankIcon bankCode={bank.bankName} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">
                          {THAI_BANKS.find(b => b.value === bank.bankName)?.label || bank.bankName}
                        </p>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                          บัญชีหลัก
                        </span>
                      </div>
                      <p className="text-white/60 text-sm">{bank.accountNumber}</p>
                      <p className="text-white/60 text-sm">{bank.accountName}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm flex items-center gap-2">
                <FiShield size={16} />
                <span>ต้องการเปลี่ยนบัญชีธนาคาร? กรุณาติดต่อแอดมินผ่านไลน์</span>
              </p>
            </div>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">เปลี่ยนรหัสผ่าน</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">รหัสผ่านปัจจุบัน</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">ความปลอดภัย</h2>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/80 text-sm mb-1">เข้าสู่ระบบล่าสุด</p>
                <p className="text-white font-medium">{formatDate(member?.createdAt)}</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/80 text-sm mb-1">IP Address ล่าสุด</p>
                <p className="text-white font-medium">-</p>
              </div>

              <div className="p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  💡 เพื่อความปลอดภัยของบัญชี กรุณาเปลี่ยนรหัสผ่านเป็นประจำ และอย่าแชร์ข้อมูลบัญชีกับผู้อื่น
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              {bankForm.id ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">ธนาคาร</label>
                <select
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" className="bg-gray-800">เลือกธนาคาร</option>
                  {THAI_BANKS.map(bank => (
                    <option key={bank.value} value={bank.value} className="bg-gray-800">
                      {bank.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">เลขที่บัญชี</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">ชื่อบัญชี</label>
                <input
                  type="text"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="นายสมชาย ใจดี"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveBankAccount}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
