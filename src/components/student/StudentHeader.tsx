import { useState, useRef, useEffect } from 'react'
import { useStudentData } from '../../contexts/StudentDataContext'

function StudentHeader() {
  const { notifications } = useStudentData()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const unreadNotifications = notifications.filter(notification => !notification.read).length

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  const handleLogout = () => {
    console.log('Logout clicked')
    setIsProfileOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end">
      <div className="flex items-center gap-4">
        <button className="relative cursor-pointer transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full flex items-center justify-center px-1 text-xs text-white font-medium" style={{ backgroundColor: '#EF4444' }}>
              {unreadNotifications}
            </span>
          )}
        </button>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 cursor-pointer transition-colors hover:opacity-80"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EC4899' }}>
              <span className="text-white font-medium">AI</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#111827' }}>Aryan Izhar</p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default StudentHeader

