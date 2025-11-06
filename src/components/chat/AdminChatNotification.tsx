import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { adminChatAPI, type ChatRoomWithDetails } from '@/api/chatAPI'
import { FaComments, FaTimes } from 'react-icons/fa'

export default function AdminChatNotification() {
  const [rooms, setRooms] = useState<ChatRoomWithDetails[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [latestMessage, setLatestMessage] = useState<string>('')
  const originalTitle = useRef(document.title)
  const titleIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationSound = useRef<HTMLAudioElement | null>(null)
  const lastUnreadCount = useRef<number>(0)

  // Initialize notification sound - using simple beep
  useEffect(() => {
    // Create AudioContext for beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    const playBeep = async () => {
      try {
        // Resume AudioContext if suspended (required by browser)
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800 // 800 Hz beep
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)

        console.log('✅ Beep sound played successfully!')
      } catch (error) {
        console.error('❌ Failed to play beep:', error)
      }
    }

    // Store beep function in ref
    notificationSound.current = { play: () => playBeep() } as any
  }, [])

  useEffect(() => {
    console.log('✅ AdminChatNotification mounted!')
    loadRooms()
    const interval = setInterval(loadRooms, 5000) // Refresh every 5 seconds
    return () => {
      console.log('❌ AdminChatNotification unmounted')
      clearInterval(interval)
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current)
      }
      // Restore original title on unmount
      document.title = originalTitle.current
    }
  }, [])

  // Update browser title with blinking effect when new messages arrive
  useEffect(() => {
    console.log('Title effect - unread:', totalUnread, 'latestMessage:', latestMessage)

    // Clear previous interval
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current)
      titleIntervalRef.current = null
    }

    if (totalUnread > 0 && latestMessage) {
      console.log('🔄 Starting title blink animation')
      let showMessage = true
      // Blink between message and count
      titleIntervalRef.current = setInterval(() => {
        if (showMessage) {
          document.title = `💬 ${latestMessage}`
          console.log('Title:', `💬 ${latestMessage}`)
        } else {
          document.title = `(${totalUnread}) ข้อความใหม่`
          console.log('Title:', `(${totalUnread}) ข้อความใหม่`)
        }
        showMessage = !showMessage
      }, 1500) // Toggle every 1.5 seconds
    } else if (totalUnread > 0) {
      console.log('Setting title to:', `(${totalUnread}) ข้อความใหม่ - Permchok Admin`)
      document.title = `(${totalUnread}) ข้อความใหม่ - Permchok Admin`
    } else {
      console.log('Restoring original title:', originalTitle.current)
      document.title = originalTitle.current
    }

    return () => {
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current)
      }
    }
  }, [totalUnread, latestMessage])

  const loadRooms = async () => {
    try {
      const response = await adminChatAPI.getRooms()
      if (response.data.success) {
        const roomsData = response.data.data
        setRooms(roomsData)
        const total = roomsData.reduce((sum, room) => sum + room.unreadCount, 0)

        console.log('Admin Chat - Total unread:', total, 'Last unread:', lastUnreadCount.current)

        // Play sound if unread count increased (skip first load)
        if (total > lastUnreadCount.current && lastUnreadCount.current >= 0) {
          console.log('🔔 Playing notification sound!')
          if (notificationSound.current) {
            notificationSound.current.play().catch(e => console.log('Sound play failed:', e))
          }
        }
        lastUnreadCount.current = total
        setTotalUnread(total)

        // Get latest message from room with most recent activity
        if (roomsData.length > 0 && total > 0) {
          const latestRoom = roomsData[0] // Rooms are sorted by lastMessageAt DESC
          const memberName = latestRoom.memberFullname || latestRoom.memberPhone
          const msg = `${memberName} ส่งข้อความ`
          console.log('📬 Latest message:', msg)
          setLatestMessage(msg)
        } else if (total === 0) {
          setLatestMessage('')
        }
      }
    } catch (error) {
      console.error('Load rooms error:', error)
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'เมื่อสักครู่'
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
    if (days < 7) return `${days} วันที่แล้ว`
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="relative">
      {/* Chat Icon Button */}
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="relative p-2 text-brown-300 hover:text-gold-500 transition-colors"
      >
        <FaComments size={24} />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {/* Popup Notification Panel */}
      {showPopup && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPopup(false)}
          />

          {/* Popup */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">แชท</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            {/* Rooms List */}
            <div className="overflow-y-auto flex-1">
              {rooms.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <FaComments className="mx-auto text-4xl mb-2 opacity-50" />
                  <p>ยังไม่มีการสนทนา</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/admin/chat?room=${room.id}`}
                    onClick={() => setShowPopup(false)}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      room.unreadCount > 0 ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                        {(room.memberFullname || room.memberPhone).charAt(0).toUpperCase()}
                      </div>
                      {room.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-gray-800 truncate ${room.unreadCount > 0 ? 'font-bold' : ''}`}>
                          {room.memberFullname || room.memberPhone}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(room.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 truncate">
                          {room.memberPhone}
                        </span>
                        {room.unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200">
              <Link
                to="/admin/chat"
                onClick={() => setShowPopup(false)}
                className="block text-center text-orange-500 hover:text-orange-600 font-semibold text-sm"
              >
                ดูทั้งหมด
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
