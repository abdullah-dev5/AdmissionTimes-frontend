import { useState } from 'react'
import StudentLayout from '../../layouts/StudentLayout'

interface Notification {
  id: string
  type: 'alert' | 'system' | 'admission'
  title: string
  description: string
  time: string
  read: boolean
  icon: string
  iconColor: string
}

function Notifications() {
  const [activeTab, setActiveTab] = useState('All')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [inAppAlerts, setInAppAlerts] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Application Deadline Approaching: MS in Data Science',
      description: 'Your application for the University of Tech is due in 3 days. Don\'t forget to submit your final documents.',
      time: '2 hours ago',
      read: false,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: '#FACC15'
    },
    {
      id: '2',
      type: 'admission',
      title: 'Admission Updated: BS Computer Science 2025',
      description: 'State University has updated your admission status. Click to view details.',
      time: '1 day ago',
      read: false,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      iconColor: '#2563EB'
    },
    {
      id: '3',
      type: 'admission',
      title: 'Documents Verified Successfully',
      description: 'Your academic transcripts for the Ivy League application have been verified.',
      time: '3 days ago',
      read: false,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: '#10B981'
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update: New Features Available',
      description: 'We\'ve updated our platform with new tools to help you track your applications more efficiently.',
      time: '5 days ago',
      read: false,
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      iconColor: '#6366F1'
    },
    {
      id: '5',
      type: 'admission',
      title: 'Application Viewed: Oceanview College',
      description: 'Your application for the Marine Biology program was viewed by the admissions committee.',
      time: '1 week ago',
      read: true,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      iconColor: '#2563EB'
    },
  ]

  const filteredNotifications = activeTab === 'All' 
    ? notifications 
    : activeTab === 'Alerts' 
    ? notifications.filter(n => n.type === 'alert')
    : notifications.filter(n => n.type === 'system')

  return (
    <StudentLayout>
      <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>Notifications</h1>
                  <p className="text-gray-600 mb-4">Stay updated with admission changes, deadlines, and system alerts.</p>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Mark All as Read
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8 -mb-px">
                      {['All', 'Alerts', 'System'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm cursor-pointer transition-colors ${
                            activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${notification.iconColor}20` }}>
                            <svg className="w-5 h-5" style={{ color: notification.iconColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={notification.icon} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-base" style={{ color: '#111827' }}>{notification.title}</h3>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#2563EB' }}></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                  <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Notification Preferences</h2>
                  <p className="text-sm text-gray-600 mb-6">Manage how you receive alerts.</p>

                  <div className="space-y-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1" style={{ color: '#111827' }}>Email Alerts</p>
                        <p className="text-xs text-gray-500">Get important updates in your inbox.</p>
                      </div>
                      <button
                        onClick={() => setEmailAlerts(!emailAlerts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                          emailAlerts ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1" style={{ color: '#111827' }}>In-App Alerts</p>
                        <p className="text-xs text-gray-500">Push notifications on this device.</p>
                      </div>
                      <button
                        onClick={() => setInAppAlerts(!inAppAlerts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                          inAppAlerts ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            inAppAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1" style={{ color: '#111827' }}>Weekly Digest</p>
                        <p className="text-xs text-gray-500">A summary of your week's activity.</p>
                      </div>
                      <button
                        onClick={() => setWeeklyDigest(!weeklyDigest)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                          weeklyDigest ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-48 rounded-lg overflow-hidden" style={{ backgroundColor: '#1E3A8A' }}>
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <svg key={i} className="w-8 h-8 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ))}
                        {[...Array(2)].map((_, i) => (
                          <svg key={i + 6} className="w-8 h-8 text-white opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      </div>
    </StudentLayout>
  )
}

export default Notifications

