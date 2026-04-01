import PublicHeader from '../components/common/PublicHeader'
import PublicFooter from '../components/common/PublicFooter'

function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <PublicHeader activePage="about" />

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

      <PublicFooter />
    </div>
  )
}

export default About
