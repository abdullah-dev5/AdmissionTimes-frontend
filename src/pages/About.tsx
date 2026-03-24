import { useNavigate } from 'react-router-dom'

function About() {
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
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#111827' }}>About AdmissionTimes</h1>
        <p className="text-sm text-gray-500 mb-8">Built for students, universities, and administrators</p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>Our Mission</h2>
            <p className="text-gray-700 leading-7">
              AdmissionTimes helps students discover programs faster and helps universities publish verified admission updates with confidence.
              Our goal is to reduce confusion, improve transparency, and make admission decisions easier.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>What the Platform Includes</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 leading-7">
              <li>Student dashboard, search, watchlist, comparison, and deadline tracking.</li>
              <li>University admissions management and verification workflow tools.</li>
              <li>Admin analytics, moderation, notifications, and audit logs.</li>
              <li>AI assistant support for admission-related guidance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>Reliability and Quality</h2>
            <p className="text-gray-700 leading-7">
              AdmissionTimes is designed with role-based access, verified workflows, and clear notification channels to keep information timely
              and trustworthy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>Get in Touch</h2>
            <p className="text-gray-700 leading-7">
              Questions, feedback, or support requests: support@admissiontimes.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default About
