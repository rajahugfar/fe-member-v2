import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, profileAPI } from '../api/memberAPI'
import { toast } from 'react-hot-toast'

export interface Member {
  id: string
  phone: string
  fullname?: string
  line?: string
  bankCode?: string
  bankNumber?: string
  credit: number
  creditGame: number
  ambUsername?: string
  status: string
  createdAt: string
  updatedAt?: string
}

export interface MemberLoginRequest {
  phone: string
  password: string
}

interface MemberState {
  member: Member | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (credentials: MemberLoginRequest) => Promise<void>
  logout: () => void
  setMember: (member: Member) => void
  setToken: (token: string) => void
  checkAuth: () => boolean
  loadProfile: () => Promise<void>
  updateProfile: (data: Partial<Member>) => Promise<void>
}

export const useMemberStore = create<MemberState>()(
  persist(
    (set, get) => ({
      member: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: MemberLoginRequest) => {
        try {
          set({ isLoading: true })
          const response = await authAPI.login(credentials.phone, credentials.password)

          const { accessToken, refreshToken, member } = response.data.data

          // Save token to localStorage (for backward compatibility)
          localStorage.setItem('memberToken', accessToken)
          localStorage.setItem('memberId', member.id)
          localStorage.setItem('memberProfile', JSON.stringify(member))

          set({
            member: member as Member,
            token: accessToken,
            refreshToken: refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success(`ยินดีต้อนรับ ${member.fullname || member.phone}`)
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'เข้าสู่ระบบล้มเหลว'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('memberToken')
        localStorage.removeItem('memberId')
        localStorage.removeItem('memberProfile')

        set({
          member: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      setMember: (member: Member) => set({ member }),

      setToken: (token: string) => set({ token }),

      checkAuth: () => {
        const { token } = get()
        return !!token
      },

      loadProfile: async () => {
        try {
          const response = await profileAPI.getProfile()
          const profileData = response.data?.data || response.data

          set({ member: profileData as Member })

          // Update localStorage for backward compatibility
          localStorage.setItem('memberProfile', JSON.stringify(profileData))
        } catch (error: any) {
          console.error('Failed to load profile:', error)
          throw error
        }
      },

      updateProfile: async (data: Partial<Member>) => {
        try {
          // Cast to any to bypass strict type checking for API call
          await profileAPI.updateProfile(data as any)

          // Reload profile after update
          const response = await profileAPI.getProfile()
          const profileData = response.data?.data || response.data

          set({ member: profileData as Member })
          localStorage.setItem('memberProfile', JSON.stringify(profileData))

          toast.success('อัพเดทข้อมูลสำเร็จ')
        } catch (error: any) {
          const message = error.response?.data?.message || 'อัพเดทข้อมูลไม่สำเร็จ'
          toast.error(message)
          throw error
        }
      },
    }),
    {
      name: 'member-storage',
      partialize: (state) => ({
        member: state.member,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
