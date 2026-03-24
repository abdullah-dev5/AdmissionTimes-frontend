import { useNavigate } from 'react-router-dom'

function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:opacity-80"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <span className="font-semibold text-xl" style={{ color: '#111827' }}>AdmissionTimes</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
          >
            Back to Home
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#111827' }}>Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 16, 2026</p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-7">
              By using AdmissionTimes, you agree to these terms. If you do not agree, please stop using the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>2. Platform Purpose</h2>
            <p className="text-gray-700 leading-7">
              AdmissionTimes provides admission discovery, tracking, and workflow support for students, universities, and administrators.
              Information is provided as guidance and should be verified with official university sources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>3. Account Responsibilities</h2>
            <p className="text-gray-700 leading-7">
              You are responsible for maintaining account security, accurate profile information, and lawful use of the platform. Unauthorized
              access, impersonation, or abuse may result in suspension.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>4. Service Availability</h2>
            <p className="text-gray-700 leading-7">
              We strive for high availability but cannot guarantee uninterrupted service. Features such as notifications or AI assistance may
              occasionally operate in degraded mode due to third-party provider limits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>5. Contact and Support</h2>
            <p className="text-gray-700 leading-7">
              For questions regarding these terms, contact support@admissiontimes.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default TermsOfService
