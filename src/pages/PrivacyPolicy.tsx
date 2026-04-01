import PublicHeader from '../components/common/PublicHeader'
import PublicFooter from '../components/common/PublicFooter'

function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <PublicHeader activePage="privacy" />

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#111827' }}>Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 16, 2026</p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>1. Information We Collect</h2>
            <p className="text-gray-700 leading-7">
              We collect account and usage information needed to provide admission discovery and tracking features. This may include your
              name, email address, account role, watchlist preferences, search activity, and notification settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>2. How We Use Your Data</h2>
            <p className="text-gray-700 leading-7">
              Your data is used to authenticate your account, personalize dashboards, manage saved admissions, send reminders, and improve
              application performance. We do not sell personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>3. AI Assistant Data Usage</h2>
            <p className="text-gray-700 leading-7">
              Messages sent to the AI assistant are processed to generate admission-related guidance. Chat context is session-based in the
              frontend and is used only to improve response quality for your current interaction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>4. Security and Access Control</h2>
            <p className="text-gray-700 leading-7">
              We use role-based access control, authenticated API requests, and database-level protections to safeguard data. Access to
              sensitive operations is restricted by account role.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3" style={{ color: '#111827' }}>5. Contact</h2>
            <p className="text-gray-700 leading-7">
              For privacy-related requests, contact support@admissiontimes.com.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

export default PrivacyPolicy
