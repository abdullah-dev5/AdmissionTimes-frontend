import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/common/PublicHeader'
import PublicFooter from '../components/common/PublicFooter'
import { useAuth } from '../contexts/AuthContext'

function Features() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const isLoggedIn = isAuthenticated || Boolean(user)
  const userType = user?.role || user?.user_type

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

  const handleSecondaryCta = () => {
    if (!isLoggedIn) {
      navigate('/signup')
      return
    }

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

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered Search',
      description: 'Intelligent search powered by advanced AI algorithms to find the best admission matches based on your profile, interests, and academic background.',
      bgColor: '#E0E7FF',
      color: '#2563EB'
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#FACC15' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Deadline Reminders',
      description: 'Never miss an important deadline with automated reminders and notifications. Set alerts for your favorite programs and get notified before deadlines approach.',
      bgColor: '#FEF3C7',
      color: '#FACC15'
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Compare Admissions',
      description: 'Side-by-side comparison of admission requirements, deadlines, fees, and criteria. Make informed decisions by comparing multiple programs at once.',
      bgColor: '#D1FAE5',
      color: '#10B981'
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Verified Data',
      description: 'All admission information is verified and updated regularly for accuracy. Trust reliable data from official university sources and verified administrators.',
      bgColor: '#D1FAE5',
      color: '#10B981'
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#8B5CF6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      title: 'Watchlist & Bookmarks',
      description: 'Save your favorite programs to a personalized watchlist. Track multiple admissions, manage your applications, and organize your research efficiently.',
      bgColor: '#EDE9FE',
      color: '#8B5CF6'
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#EC4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Real-time Notifications',
      description: 'Stay updated with real-time notifications about deadline changes, new programs, status updates, and important announcements from universities.',
      bgColor: '#FCE7F3',
      color: '#EC4899'
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Detailed Program Information',
      description: 'Access comprehensive program details including admission requirements, eligibility criteria, application process, fees, scholarships, and more.',
      bgColor: '#FEF3C7',
      color: '#F59E0B'
    },
    {
      icon: (
        <svg className="w-8 h-8" style={{ color: '#06B6D4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Smart Recommendations',
      description: 'Get personalized program recommendations based on your academic profile, interests, and preferences. Discover programs you might not have considered.',
      bgColor: '#CFFAFE',
      color: '#06B6D4'
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <PublicHeader activePage="features" />

      {/* Main Content */}
      <main className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#111827' }}>
              Powerful Features for Your Admission Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to find, compare, and apply to the perfect program. Our comprehensive platform makes the admission process simple and stress-free.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-lg p-12 border border-gray-200 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#111827' }}>
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {isLoggedIn
                ? 'Continue with your personalized workspace and keep your admission workflow moving.'
                : 'Join thousands of students who are already using AdmissionTimes to find their perfect program.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSearchCta}
                className="px-8 py-4 text-lg font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                {isLoggedIn ? primaryCtaLabel : 'Get Started'}
              </button>
              <button
                onClick={handleSecondaryCta}
                className="px-8 py-4 text-lg font-medium rounded-lg cursor-pointer transition-colors border-2"
                style={{ borderColor: '#2563EB', color: '#2563EB' }}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

export default Features

