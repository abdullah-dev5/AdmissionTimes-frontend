import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function StudentSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isExpanded = isHovered || !isCollapsed

  const navItems = [
    { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', link: '/student/dashboard' },
    { name: 'Search Admissions', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', link: '/student/search' },
    { name: 'Compare Programs', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', link: '/student/compare' },
    { name: 'Saved Admissions', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', link: '/student/watchlist' },
    { name: 'Deadlines', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', link: '/student/deadlines' },
    { name: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', link: '/student/notifications' },
  ]

  const isActive = (link: string) => {
    return location.pathname === link
  }

  return (
    <aside 
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-500 ease-in-out fixed left-0 top-0 h-full z-40 ${isExpanded ? 'w-64 shadow-lg' : 'w-20'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        {isExpanded ? (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer transition-colors hover:opacity-80"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="font-semibold text-lg" style={{ color: '#111827' }}>AdmissionTimes</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded flex items-center justify-center mx-auto cursor-pointer transition-colors hover:opacity-80"
            style={{ backgroundColor: '#2563EB' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </button>
        )}
        {isExpanded && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1 mb-6">
          {navItems.map((item) => {
            const active = isActive(item.link)
            return (
              <li key={item.name}>
                <Link
                  to={item.link}
                  className={`w-full text-left rounded-lg flex items-center gap-3 cursor-pointer transition-colors relative ${
                    active
                      ? 'text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  } ${isExpanded ? 'px-4 py-3' : 'justify-center px-3 py-3'}`}
                  style={active ? { backgroundColor: '#2563EB' } : {}}
                  title={isExpanded ? '' : item.name}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {isExpanded && <span>{item.name}</span>}
                  {isExpanded && item.badge && item.badge > 0 && (
                    <span className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: active ? 'rgba(255,255,255,0.3)' : '#2563EB' }}>
                      {item.badge}
                    </span>
                  )}
                  {!isExpanded && item.badge && item.badge > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
       {/*  {isExpanded && (
          <>
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3 px-4">QUICK FILTERS</p>
              <div className="space-y-2 px-4">
                <button className="w-full px-4 py-2 text-sm font-medium text-white rounded-full cursor-pointer transition-colors" style={{ backgroundColor: '#2563EB' }}>
                  Medical (12)
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-white rounded-full cursor-pointer transition-colors" style={{ backgroundColor: '#6366F1' }}>
                  Business (18)
                </button>
              </div>
            </div>
            <div className="px-4">
              <button className="w-full px-4 py-3 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors flex items-center gap-3" style={{ backgroundColor: '#374151' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Assistant</span>
              </button>
            </div>
          </>
        )} */}
      </nav>
    </aside>
  )
}

export default StudentSidebar

