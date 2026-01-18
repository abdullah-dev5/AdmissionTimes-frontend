import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

function SignUp() {
  const navigate = useNavigate()
  const { signUp, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'student' as 'student' | 'university' | 'admin',
    display_name: '',
    university_id: '',
  })
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    user_type?: string
    display_name?: string
    university_id?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.user_type) {
      newErrors.user_type = 'Please select an account type'
    }

    if (formData.user_type === 'university' && !formData.university_id) {
      newErrors.university_id = 'University ID is required for university accounts'
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
      await signUp({
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type,
        display_name: formData.display_name || undefined,
        university_id: formData.university_id || undefined,
      })
    } catch (error) {
      // Error is handled by auth context
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
            <div>
              <label htmlFor="user_type" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                Account Type *
              </label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.user_type
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                disabled={isLoading}
              >
                <option value="student">Student</option>
                <option value="university">University Representative</option>
                <option value="admin">Admin</option>
              </select>
              {errors.user_type && <p className="mt-1 text-sm text-red-600">{errors.user_type}</p>}
            </div>

            {formData.user_type === 'university' && (
              <div>
                <label htmlFor="university_id" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  University ID *
                </label>
                <input
                  type="text"
                  id="university_id"
                  name="university_id"
                  value={formData.university_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.university_id
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your university ID"
                  disabled={isLoading}
                />
                {errors.university_id && <p className="mt-1 text-sm text-red-600">{errors.university_id}</p>}
                <p className="mt-1 text-xs text-gray-500">Contact admin to get your university ID</p>
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
