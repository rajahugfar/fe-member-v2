import axios from 'axios'
import { adminAPIClient } from './adminAPI'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Member Chat API
const memberChatAPI = axios.create({
  baseURL: `${API_URL}/api/v1/member/chat`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

memberChatAPI.interceptors.request.use(config => {
  const token = localStorage.getItem('memberToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface ChatRoom {
  id: string
  memberId: string
  adminId?: string
  status: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  roomId: string
  sender_type?: 'MEMBER' | 'ADMIN'
  senderType?: 'MEMBER' | 'ADMIN'
  senderId: string
  message: string
  imageUrl?: string
  image_url?: string
  isRead: boolean
  created_at?: string
  createdAt?: string
  updatedAt: string
}

export interface ChatRoomWithDetails extends ChatRoom {
  memberPhone: string
  memberFullname?: string
  adminUsername?: string
  unreadCount: number
}

// Member Chat APIs
export const chatAPI = {
  getChat: () => memberChatAPI.get<{ success: boolean; data: { room: ChatRoom; messages: ChatMessage[] } }>('/'),

  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return memberChatAPI.post<{ success: boolean; data: { imageUrl: string } }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  sendMessage: (message: string, imageUrl?: string) =>
    memberChatAPI.post<{ success: boolean; data: ChatMessage }>('/send', { message, imageUrl }),
}

// Admin Chat APIs - ใช้ adminAPIClient ที่มี interceptor จัดการ token และ error แล้ว
export const adminChatAPI = {
  getRooms: () =>
    adminAPIClient.get<{ success: boolean; data: ChatRoomWithDetails[] }>('/chat/rooms'),

  getRoomMessages: (roomId: string) =>
    adminAPIClient.get<{ success: boolean; data: ChatMessage[] }>(`/chat/rooms/${roomId}`),

  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return adminAPIClient.post<{ success: boolean; data: { imageUrl: string } }>('/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  sendMessage: (roomId: string, message: string, imageUrl?: string) =>
    adminAPIClient.post<{ success: boolean; data: ChatMessage }>(`/chat/rooms/${roomId}/send`, { message, imageUrl }),

  markAsRead: (roomId: string) =>
    adminAPIClient.post<{ success: boolean; message: string }>(`/chat/rooms/${roomId}/mark-read`),

  deleteRoom: (roomId: string) =>
    adminAPIClient.delete<{ success: boolean; message: string }>(`/chat/rooms/${roomId}`),
}
