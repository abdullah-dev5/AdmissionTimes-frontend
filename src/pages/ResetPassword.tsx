import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

const MIN_PASSWORD_LENGTH = 8

/**
 * Landing page for the Supabase password-recovery link. Supabase establishes
 * a short-lived recovery session from the URL; the user then sets a new
 * password and signs in again.
 */
function ResetPassword() {
  const navigate = useNavigate()
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setHasRecoverySession(Boolean(data.session))
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setHasRecoverySession(true)
    })
    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message || 'Could not update your password. Request a new link and try again.')
        return
      }
      // Force a clean sign-in with the new password.
      await supabase.auth.signOut()
      useAuthStore.getState().clearSession()
      navigate('/signin', { replace: true, state: { passwordReset: true } })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#2563EB' }}>
              AdmissionTimes
            </h1>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#111827' }}>
              Choose a new password
            </h2>
          </div>

          {hasRecoverySession === null && <LoadingSpinner size="md" message="Checking your reset link..." />}

          {hasRecoverySession === false && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This reset link is invalid or has expired.{' '}
                <Link to="/forgot-password" className="font-medium underline">
                  Request a new link
                </Link>
                .
              </p>
            </div>
          )}

          {hasRecoverySession && (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  New password *
                </label>
                <input
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  Confirm new password *
                </label>
                <input
                  type="password"
                  id="confirm"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  'Update password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
