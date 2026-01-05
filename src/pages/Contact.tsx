import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Contact() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the form data to a backend
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:opacity-80 group"
            >
              <div className="w-8 h-8 rounded flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: '#2563EB' }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="font-semibold text-xl transition-all duration-300" style={{ color: '#111827' }}>AdmissionTimes</span>
            </button>
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => navigate('/')}
                className="text-sm font-medium cursor-pointer transition-colors" 
                style={{ color: '#111827' }}
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/student/search')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Universities
              </button>
              <button 
                onClick={() => navigate('/features')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="text-sm font-medium cursor-pointer transition-colors" 
                style={{ color: '#111827' }}
              >
                Contact
              </button>
            </nav>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90" 
                style={{ backgroundColor: '#2563EB' }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#111827' }}>
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions or need help? We're here to assist you. Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Info Cards */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E0E7FF' }}>
                <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Email</h3>
              <p className="text-gray-600 text-sm">support@admissiontimes.com</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#D1FAE5' }}>
                <svg className="w-6 h-6" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Phone</h3>
              <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FEF3C7' }}>
                <svg className="w-6 h-6" style={{ color: '#FACC15' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>Location</h3>
              <p className="text-gray-600 text-sm">123 Education St, City, State 12345</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What is this regarding?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#111827' }}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 text-lg font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
              </div>
              <span className="font-semibold" style={{ color: '#111827' }}>AdmissionTimes</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 mb-4 md:mb-0">
              <button 
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              >
                Contact
              </button>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 AdmissionTimes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Contact

