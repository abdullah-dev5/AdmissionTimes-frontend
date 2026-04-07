import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

const getFriendlyAuthError = (raw?: string) => {
  const message = (raw || '').toLowerCase()
  if (!message) return 'Unable to create your account right now. Please try again.'
  if (message.includes('already exists') || message.includes('duplicate') || message.includes('already registered')) {
    return 'An account with this email already exists. Please sign in instead.'
  }
  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.'
  }
  if (message.includes('weak password') || message.includes('password')) {
    return 'Please use a stronger password and try again.'
  }
  if (message.includes('timeout') || message.includes('network') || message.includes('fetch')) {
    return 'Connection issue detected. Please check your internet and try again.'
  }
  return 'Unable to create your account right now. Please try again.'
}

function SignUp() {
  const navigate = useNavigate()
  const { signUp, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    display_name: '',
  })
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    display_name?: string
  }>({})
  const [apiError, setApiError] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    const emailValue = formData.email.trim()

    if (!emailValue) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!validate()) {
      return
    }

    try {
      console.log('[SignUp] Starting signup with:', { 
        email: formData.email.trim(),
        user_type: 'student',
      })
      
      await signUp({
        email: formData.email.trim(),
        password: formData.password,
        user_type: 'student',
        display_name: formData.display_name || undefined,
      })
      
      console.log('[SignUp] Signup successful!')
    } catch (error: any) {
      console.error('[SignUp] Error occurred:', error)
      
      // Extract error message
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Failed to create account. Please try again.'
      
      console.error('[SignUp] Error message:', errorMessage)
      setApiError(getFriendlyAuthError(errorMessage))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#2563EB' }}>
              AdmissionTimes
            </h1>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#111827' }}>
              Create Account
            </h2>
            <p className="text-sm text-gray-600">Sign up to get started with AdmissionTimes.</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Error Display */}
            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium text-sm">{apiError}</p>
              </div>
            )}

            <div>
              <label htmlFor="display_name" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name (optional)"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="At least 6 characters"
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating account...</span>
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium" style={{ color: '#2563EB' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
