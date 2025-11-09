import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import StudentSidebar from '../components/student/StudentSidebar'
import StudentHeader from '../components/student/StudentHeader'
import AiAssistantWidget from '../components/ai/AiAssistantWidget'
import ChatPanel from '../components/ai/ChatPanel'
import { useAi } from '../contexts/AiContext'

interface StudentLayoutProps {
  children: ReactNode
}

function StudentLayout({ children }: StudentLayoutProps) {
  const location = useLocation()
  const { setContext } = useAi()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const path = location.pathname
    if (path.includes('/dashboard')) {
      setContext('Student Dashboard')
    } else if (path.includes('/search')) {
      setContext('Search Admissions')
    } else if (path.includes('/compare')) {
      setContext('Compare Programs')
    } else if (path.includes('/deadlines')) {
      setContext('Deadlines')
    } else if (path.includes('/watchlist')) {
      setContext('Watchlist')
    } else if (path.includes('/notifications')) {
      setContext('Notifications')
    } else {
      setContext('Student Portal')
    }
  }, [location.pathname, setContext])

  if (isHomePage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="flex h-screen overflow-hidden">
        <StudentSidebar />
        <div className="flex-1 flex flex-col overflow-hidden ml-20">
          <StudentHeader />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <AiAssistantWidget />
      <ChatPanel />
    </div>
  )
}

export default StudentLayout

