import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UniversityLayout from '../../layouts/UniversityLayout'
import { useAuth } from '../../contexts/AuthContext'
import { usersService } from '../../services/usersService'
import { showError, showSuccess } from '../../utils/swal'

function EditProfile() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
  })
  
  const [universityData, setUniversityData] = useState({
    name: '',
    city: '',
    country: '',
    website: '',
    logoUrl: '',
    description: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  })
  
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user) {
          setProfileData({
            displayName: user.display_name || '',
            email: user.email || '',
          })
        }

        const profileResponse = await usersService.getUniversityProfile()
        const profile = profileResponse.data

        setUniversityData({
          name: profile.name || '',
          city: profile.city || '',
          country: profile.country || '',
          website: profile.website || '',
          logoUrl: profile.logo_url || '',
          description: profile.description || '',
          address: profile.address || '',
          contactName: profile.contact_name || '',
          contactEmail: profile.contact_email || '',
          contactPhone: profile.contact_phone || '',
        })
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    loadProfile()
  }, [user])

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleUniversityChange = (field: string, value: string) => {
    setUniversityData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (file?: File) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setUniversityData(prev => ({ ...prev, logoUrl: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Update user profile
      await usersService.updateCurrentUser({
        display_name: profileData.displayName,
      })

      // Update university profile
      await usersService.updateUniversityProfile({
        name: universityData.name,
        city: universityData.city || null,
        country: universityData.country || null,
        website: universityData.website || null,
        logo_url: universityData.logoUrl || null,
        description: universityData.description || null,
        address: universityData.address || null,
        contact_name: universityData.contactName || null,
        contact_email: universityData.contactEmail || null,
        contact_phone: universityData.contactPhone || null,
      })

      await refreshUser()
      await showSuccess('Profile updated successfully!')
      navigate('/university/settings')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('User context:', user)
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update profile'
      await showError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/university/settings')
  }

  return (
    <UniversityLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-gray-600">Update your university profile information</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Account Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed here. Contact support if needed.</p>
                </div>
              </div>
            </div>

            {/* University Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">University Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={universityData.name}
                    onChange={(e) => handleUniversityChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter university name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={universityData.city}
                      onChange={(e) => handleUniversityChange('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={universityData.country}
                      onChange={(e) => handleUniversityChange('country', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={universityData.website}
                    onChange={(e) => handleUniversityChange('website', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                      {universityData.logoUrl ? (
                        <img
                          src={universityData.logoUrl}
                          alt="University logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-gray-400">
                          {universityData.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoChange(e.target.files?.[0])}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="mt-1 text-xs text-gray-500">Upload a square image (PNG, JPG) for best results.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={universityData.description}
                    onChange={(e) => handleUniversityChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description about your university..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={universityData.address}
                    onChange={(e) => handleUniversityChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full address..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={universityData.contactName}
                    onChange={(e) => handleUniversityChange('contactName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact person name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={universityData.contactEmail}
                      onChange={(e) => handleUniversityChange('contactEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={universityData.contactPhone}
                      onChange={(e) => handleUniversityChange('contactPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pb-6">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !universityData.name || !profileData.displayName}
                className="px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#2563EB' }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </UniversityLayout>
  )
}

export default EditProfile
