import { useNavigate } from 'react-router-dom'
import PublicHeader from './components/common/PublicHeader'
import PublicFooter from './components/common/PublicFooter'
import { useAuth } from './contexts/AuthContext'
import './App.css'

function App() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const userType = user?.role || user?.user_type
  const isLoggedIn = isAuthenticated || Boolean(user)

  const primaryCtaLabel =
    userType === 'student'
      ? 'Search Admissions'
      : userType === 'university' || userType === 'admin'
        ? 'Go to Dashboard'
        : 'Get Started'

  const handleSearchCta = () => {
    if (!isLoggedIn) {
      navigate('/signin')
      return
    }

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <PublicHeader activePage="home" />

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#111827' }}>
              Find Your Perfect Admission
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Search and compare admission information from top universities. Get verified data, deadline reminders, and AI-powered recommendations.
            </p>
            <button 
              onClick={handleSearchCta}
              className="px-8 py-4 text-lg font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90" 
              style={{ backgroundColor: '#2563EB' }}
            >
              {isLoggedIn ? primaryCtaLabel : 'Get Started'}
            </button>
          </div>
        </section>

        <section id="features-section" className="py-16 px-4" style={{ backgroundColor: '#F9FAFB' }}>
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#111827' }}>Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E0E7FF' }}>
                  <svg className="w-8 h-8" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>AI Search</h3>
                <p className="text-gray-600 text-sm">
                  Intelligent search powered by AI to find the best admission matches for you.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FEF3C7' }}>
                  <svg className="w-8 h-8" style={{ color: '#FACC15' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Deadline Reminders</h3>
                <p className="text-gray-600 text-sm">
                  Never miss an important deadline with automated reminders and notifications.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#D1FAE5' }}>
                  <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Compare Admissions</h3>
                <p className="text-gray-600 text-sm">
                  Side-by-side comparison of admission requirements, deadlines, and criteria.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#D1FAE5' }}>
                  <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Verified Data</h3>
                <p className="text-gray-600 text-sm">
                  All admission information is verified and updated regularly for accuracy.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

export default App
