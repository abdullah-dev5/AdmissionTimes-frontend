import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

function SignIn() {
  const navigate = useNavigate()
  const { signIn, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

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
    const newErrors: { email?: string; password?: string } = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
      })
    } catch (error) {
      // Error is handled by auth context
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#2563EB' }}>
              AdmissionTimes
            </h1>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#111827' }}>
              Sign In
            </h2>
            <p className="text-sm text-gray-600">Welcome back! Please sign in to your account.</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium" style={{ color: '#2563EB' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium" style={{ color: '#2563EB' }}>
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Accounts (Development Only) */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 text-center">Development Demo Accounts:</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      email: 'student@test.com',
                      password: 'password123',
                    })
                  }}
                  className="w-full text-xs py-2 px-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Use Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      email: 'university@test.com',
                      password: 'password123',
                    })
                  }}
                  className="w-full text-xs py-2 px-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Use University Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      email: 'admin@test.com',
                      password: 'password123',
                    })
                  }}
                  className="w-full text-xs py-2 px-3 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Use Admin Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignIn
