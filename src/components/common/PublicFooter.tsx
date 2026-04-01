import { useNavigate } from 'react-router-dom'

export default function PublicFooter() {
  const navigate = useNavigate()

  return (
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
              onClick={() => navigate('/privacy')}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate('/terms')}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/about')}
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
            © {new Date().getFullYear()} AdmissionTimes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
