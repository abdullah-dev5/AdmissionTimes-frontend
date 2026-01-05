import { useNavigate } from 'react-router-dom'
import './App.css'

function App() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/student/dashboard')}
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
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm font-medium cursor-pointer transition-colors" 
                style={{ color: '#111827' }}
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/student/search')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Universities
              </button>
              <button 
                onClick={() => navigate('/features')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Contact
              </button>
            </nav>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">Sign In</button>
              <button className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90" style={{ backgroundColor: '#2563EB' }}>Register</button>
            </div>
          </div>
        </div>
      </header>

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
              onClick={() => navigate('/student/search')}
              className="px-8 py-4 text-lg font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90" 
              style={{ backgroundColor: '#2563EB' }}
            >
              Search Admissions
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

      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <span className="font-semibold" style={{ color: '#111827' }}>AdmissionTimes</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 mb-4 md:mb-0">
              <button 
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Contact
              </button>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 AdmissionTimes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
