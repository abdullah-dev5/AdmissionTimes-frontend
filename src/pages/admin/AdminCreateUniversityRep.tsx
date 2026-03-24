import { useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { adminService, type CreateUniversityRepResult } from '../../services/adminService'

type FormState = {
  email: string
  display_name: string
  university_name: string
  city: string
  country: string
  website: string
}

const initialForm: FormState = {
  email: '',
  display_name: '',
  university_name: '',
  city: '',
  country: '',
  website: '',
}

function AdminCreateUniversityRep() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [result, setResult] = useState<CreateUniversityRepResult | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!form.email.trim()) return 'Email is required.'
    if (!form.display_name.trim()) return 'Display name is required.'
    if (!form.university_name.trim()) return 'University name is required.'
    return ''
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsSubmitting(true)
      setResult(null)

      const response = await adminService.createUniversityRep({
        email: form.email.trim(),
        display_name: form.display_name.trim(),
        university_name: form.university_name.trim(),
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        website: form.website.trim() || undefined,
      })

      setResult(response.data)
      setForm(initialForm)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create university representative.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyCredentials = async () => {
    if (!result) return

    const text = [
      `Email: ${result.user.email}`,
      `Temporary Password: ${result.credentials.temporary_password}`,
      `University ID: ${result.user.university_id}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      alert('Credentials copied to clipboard.')
    } catch {
      alert('Unable to copy credentials automatically. Please copy manually.')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create University Representative</h1>
          <p className="text-sm text-gray-600 mt-1">
            Flow C: Admin creates university + representative account and gets one-time credentials for handover.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="rep@university.edu"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
              <input
                name="display_name"
                value={form.display_name}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="University Representative"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University Name *</label>
              <input
                name="university_name"
                value={form.university_name}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Example University"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Karachi"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  name="country"
                  value={form.country}
                  onChange={onChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pakistan"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                name="website"
                value={form.website}
                onChange={onChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.example.edu"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create University Rep'}
            </button>
          </form>
        </div>

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-900 mb-3">Account Created</h2>
            <div className="space-y-1 text-sm text-green-900">
              <p><strong>User Email:</strong> {result.user.email}</p>
              <p><strong>University ID:</strong> {result.user.university_id}</p>
              <p><strong>Temporary Password:</strong> {result.credentials.temporary_password}</p>
            </div>
            <p className="text-xs text-green-800 mt-3">Credentials are shown once. Share securely with the representative.</p>
            <button
              type="button"
              onClick={copyCredentials}
              className="mt-3 inline-flex items-center rounded-md bg-green-700 px-3 py-2 text-white text-sm font-medium hover:bg-green-800"
            >
              Copy Credentials
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCreateUniversityRep
