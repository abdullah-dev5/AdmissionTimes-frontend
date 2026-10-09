import { useState } from 'react'
import { supabase } from '../../services/supabase'
import { LoadingSpinner } from './LoadingSpinner'

const MIN_PASSWORD_LENGTH = 8

interface ChangePasswordFormProps {
  email: string
  onChanged?: () => void
}

/**
 * Change the signed-in user's password. The current password is re-verified
 * first so an unattended session cannot be used to take over the account.
 */
export function ChangePasswordForm({ email, onChanged }: ChangePasswordFormProps) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!current) return setError('Enter your current password')
    if (next.length < MIN_PASSWORD_LENGTH) return setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    if (next !== confirm) return setError('New passwords do not match')
    if (next === current) return setError('New password must be different from the current one')

    setSaving(true)
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: current })
      if (verifyError) {
        setError('Current password is incorrect')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: next })
      if (updateError) {
        setError(updateError.message || 'Could not update the password. Please try again.')
        return
      }

      setCurrent('')
      setNext('')
      setConfirm('')
      setSuccess('Password updated.')
      onChanged?.()
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div>
        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
          Current Password
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={inputClass}
          disabled={saving}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className={inputClass}
          disabled={saving}
        />
        <p className="mt-1 text-xs text-gray-500">At least {MIN_PASSWORD_LENGTH} characters.</p>
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          disabled={saving}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Updating...</span>
            </>
          ) : (
            'Change Password'
          )}
        </button>
      </div>
    </form>
  )
}
