import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UniversityLayout from '../../layouts/UniversityLayout'
import { useAuth } from '../../contexts/AuthContext'
import { usersService } from '../../services/usersService'
import { showError, showSuccess, showWarning } from '../../utils/swal'

function Settings() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile')
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
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
      } catch (error: any) {
        console.error('Failed to load profile:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        console.error('User context:', user)
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

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)

    try {
      await usersService.updateCurrentUser({
        display_name: profileData.displayName,
      })
      await refreshUser()
      await showSuccess('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      await showError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveUniversity = async () => {
    setIsSaving(true)

    try {
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
      await showSuccess('University profile updated successfully!')
    } catch (error) {
      console.error('Failed to update university profile:', error)
      await showError('Failed to update university profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      await showWarning('New passwords do not match!')
      return
    }
    if (passwordData.newPassword.length < 8) {
      await showWarning('Password must be at least 8 characters long!')
      return
    }
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    await showSuccess('Password changed successfully!')
  }

  return (
    <UniversityLayout>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and university profile settings.</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Profile Information
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'account'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Account Security
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* University Profile Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header with Edit Button */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">University Profile</h2>
                      <button
                        onClick={() => navigate('/university/settings/edit-profile')}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Edit Profile
                      </button>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                      {/* Logo and Basic Info */}
                      <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
                        <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {universityData.logoUrl ? (
                            <img
                              src={universityData.logoUrl}
                              alt={universityData.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-3xl font-bold text-gray-400">
                              {universityData.name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {universityData.name || 'University Name Not Set'}
                          </h3>
                          <p className="text-gray-600 mb-1">
                            {universityData.city && universityData.country
                              ? `${universityData.city}, ${universityData.country}`
                              : universityData.city || universityData.country || 'Location not set'}
                          </p>
                          {universityData.website && (
                            <a
                              href={universityData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              {universityData.website}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Account Information */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Account Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Display Name</label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.displayName || 'Not set'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                            <p className="mt-1 text-sm text-gray-900">{profileData.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* University Details */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">University Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {universityData.description && (
                            <div className="md:col-span-2">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                              <p className="mt-1 text-sm text-gray-700">{universityData.description}</p>
                            </div>
                          )}
                          {universityData.address && (
                            <div className="md:col-span-2">
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                              <p className="mt-1 text-sm text-gray-700">{universityData.address}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {universityData.contactName && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Name</label>
                              <p className="mt-1 text-sm text-gray-900">{universityData.contactName}</p>
                            </div>
                          )}
                          {universityData.contactEmail && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Email</label>
                              <p className="mt-1 text-sm text-gray-900">{universityData.contactEmail}</p>
                            </div>
                          )}
                          {universityData.contactPhone && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Phone</label>
                              <p className="mt-1 text-sm text-gray-900">{universityData.contactPhone}</p>
                            </div>
                          )}
                        </div>
                        {!universityData.contactName && !universityData.contactEmail && !universityData.contactPhone && (
                          <p className="text-sm text-gray-500 italic">No contact information set</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900">Account Security</h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Coming Soon:</span> Password change functionality will be available in a future update.
                    </p>
                  </div>
                  <div className="space-y-6 opacity-50 pointer-events-none">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleChangePassword}
                        disabled={true}
                        className="px-6 py-2 text-sm font-medium text-white rounded-lg cursor-not-allowed opacity-50"
                        style={{ backgroundColor: '#2563EB' }}
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </UniversityLayout>
  )
}

export default Settings

