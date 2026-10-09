import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UniversityLayout from '../../layouts/UniversityLayout'
import { useAuth } from '../../contexts/AuthContext'
import { usersService } from '../../services/usersService'
import { ChangePasswordForm } from '../../components/common/ChangePasswordForm'

function Settings() {
  const { user } = useAuth()
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
        console.error('Failed to load university profile:', error)
      }
    }

    loadProfile()
  }, [user])

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
                  {user?.email ? (
                    <ChangePasswordForm email={user.email} />
                  ) : (
                    <p className="text-sm text-gray-600">Sign in again to change your password.</p>
                  )}
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

