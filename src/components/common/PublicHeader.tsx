import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type PublicHeaderPage = 'home' | 'features' | 'contact' | 'about' | 'privacy' | 'terms'

interface PublicHeaderProps {
  activePage: PublicHeaderPage
}

export default function PublicHeader({ activePage }: PublicHeaderProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const isLoggedIn = isAuthenticated || Boolean(user)
  const displayName = user?.display_name?.trim() || 'User'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

  const handleDashboardNav = () => {
    const userType = user?.role || user?.user_type
    if (userType === 'student') {
      navigate('/student/dashboard')
    } else if (userType === 'university') {
      navigate('/university/dashboard')
    } else if (userType === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/signin')
    }
  }

  const handleUniversitiesNav = () => {
    const userType = user?.role || user?.user_type
    if (userType === 'student') {
      navigate('/student/search')
    } else if (userType === 'university') {
      navigate('/university/dashboard')
    } else if (userType === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/signin')
    }
  }

  const handleHomeClick = () => {
    if (activePage === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate('/')
  }

  const handleBrandClick = () => {
    if (isLoggedIn) {
      handleDashboardNav()
      return
    }
    navigate('/')
  }

  const handleLogout = async () => {
    setIsProfileOpen(false)
    await signOut()
  }

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

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:opacity-80 group"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: '#2563EB' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="font-semibold text-xl transition-all duration-300" style={{ color: '#111827' }}>AdmissionTimes</span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={handleHomeClick}
              className="text-sm font-medium cursor-pointer transition-colors"
              style={{ color: activePage === 'home' ? '#111827' : '#4B5563' }}
            >
              Home
            </button>
            <button
              onClick={handleUniversitiesNav}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
            >
              Universities
            </button>
            <button
              onClick={() => navigate('/features')}
              className="text-sm font-medium cursor-pointer transition-colors"
              style={{ color: activePage === 'features' ? '#111827' : '#4B5563' }}
            >
              Features
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="text-sm font-medium cursor-pointer transition-colors"
              style={{ color: activePage === 'contact' ? '#111827' : '#4B5563' }}
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {isLoading ? null : isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 cursor-pointer transition-colors hover:opacity-80"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EC4899' }}>
                    <span className="text-white text-sm font-medium">{initials}</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || user?.user_type || 'User'}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={handleDashboardNav}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#2563EB' }}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
