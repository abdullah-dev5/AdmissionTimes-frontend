import { useState } from 'react'
import { Link } from 'react-router-dom'
import StudentLayout from '../../layouts/StudentLayout'

interface Admission {
  id: string
  university: string
  program: string
  degree: string
  fee: string
  deadline: string
  location: string
  status: 'Verified' | 'Pending' | 'Updated'
  aiSummary: string
  officialUrl: string
}

const CompareHeader = ({ count }: { count: number }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <span className="text-gray-600">
        <span className="font-semibold" style={{ color: '#111827' }}>{count}</span> Admissions Selected
      </span>
    </div>
  )
}

const CompareCard = ({ admission }: { admission: Admission }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return { bg: '#D1FAE5', text: '#10B981' }
      case 'Pending': return { bg: '#FEF3C7', text: '#F59E0B' }
      case 'Updated': return { bg: '#DBEAFE', text: '#3B82F6' }
      default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
  }

  const statusColors = getStatusColor(admission.status)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-[360px] flex-shrink-0 flex flex-col" style={{ height: '100%' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 truncate" style={{ color: '#111827' }}>{admission.university}</h3>
          <p className="text-sm text-gray-600 truncate">{admission.program}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
          {admission.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          <span className="text-gray-700 truncate">{admission.degree}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700">{admission.fee}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-700">{admission.deadline}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-700 truncate">{admission.location}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 mb-4 flex-1 flex flex-col min-h-0">
        <p className="text-xs text-gray-500 mb-2">AI Summary</p>
        <p className="text-sm text-gray-700 leading-relaxed overflow-hidden">{admission.aiSummary}</p>
      </div>

      <Link
        to={admission.officialUrl}
        className="text-sm font-medium cursor-pointer transition-colors hover:opacity-80 mt-auto flex-shrink-0"
        style={{ color: '#2563EB' }}
      >
        View Original Admission →
      </Link>
    </div>
  )
}

const CompareGrid = ({ admissions }: { admissions: Admission[] }) => {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 px-6" style={{ alignItems: 'stretch', minHeight: '600px' }}>
        {admissions.map((admission) => (
          <CompareCard key={admission.id} admission={admission} />
        ))}
      </div>
    </div>
  )
}

const CompareHighlights = ({ admissions: _admissions }: { admissions: Admission[] }) => {
  const highlights = [
    'FAST University offers the lowest fee at PKR 75,000, making it the most cost-effective option.',
    'NUST has the earliest deadline (July 30, 2025), requiring immediate application submission.',
    'LUMS provides the most comprehensive program with additional research opportunities.',
    'All three universities are located in major cities with excellent infrastructure and facilities.',
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mx-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>AI-Generated Key Differences</h2>
      </div>
      <ul className="space-y-3">
        {highlights.map((highlight, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-700">{highlight}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CompareActions = ({ onSave, onShare, onExport }: { onSave: () => void; onShare: () => void; onExport: () => void }) => {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Save Comparison
        </button>
        <button
          onClick={onShare}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: '#2563EB' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>
  )
}

function ComparePage() {
  const [selectedAdmissions] = useState<Admission[]>([
    {
      id: '1',
      university: 'FAST University',
      program: 'BS Computer Science',
      degree: 'Bachelor of Science',
      fee: 'PKR 75,000',
      deadline: 'July 30, 2025',
      location: 'Islamabad, Pakistan',
      status: 'Verified',
      aiSummary: 'This program offers a comprehensive curriculum in computer science fundamentals with strong industry connections. The university has excellent placement records and modern lab facilities.',
      officialUrl: '/program/1',
    },
    {
      id: '2',
      university: 'NUST',
      program: 'MS Data Science',
      degree: 'Master of Science',
      fee: 'PKR 120,000',
      deadline: 'August 15, 2025',
      location: 'Islamabad, Pakistan',
      status: 'Pending',
      aiSummary: 'A rigorous graduate program focusing on advanced data analytics, machine learning, and statistical methods. Ideal for students seeking research opportunities and industry collaboration.',
      officialUrl: '/program/2',
    },
    {
      id: '3',
      university: 'LUMS',
      program: 'PhD in Management',
      degree: 'Doctor of Philosophy',
      fee: 'PKR 98,000',
      deadline: 'June 20, 2025',
      location: 'Lahore, Pakistan',
      status: 'Updated',
      aiSummary: 'An elite doctoral program designed for aspiring researchers and academics. Features world-class faculty, extensive research resources, and opportunities for international collaboration.',
      officialUrl: '/program/3',
    },
  ])

  const handleSave = () => {
    console.log('Save comparison')
  }

  const handleShare = () => {
    console.log('Share comparison')
  }

  const handleExport = () => {
    console.log('Export PDF')
  }

  const count = selectedAdmissions.length

  if (count < 2) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-full p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Not Enough Admissions Selected</h2>
            <p className="text-gray-600 mb-6">Please select at least 2 admissions to compare.</p>
            <Link
              to="/student/dashboard"
              className="inline-block px-6 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
              style={{ backgroundColor: '#2563EB' }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </StudentLayout>
    )
  }

  if (count > 4) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-full p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Too Many Admissions Selected</h2>
            <p className="text-gray-600 mb-6">Please select a maximum of 4 admissions to compare.</p>
            <Link
              to="/student/dashboard"
              className="inline-block px-6 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-colors hover:opacity-90"
              style={{ backgroundColor: '#2563EB' }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="flex flex-col h-full">
        <CompareHeader count={count} />
        
        <div className="flex-1 overflow-y-auto py-6">
          <CompareGrid admissions={selectedAdmissions} />
          <CompareHighlights admissions={selectedAdmissions} />
        </div>

        <CompareActions onSave={handleSave} onShare={handleShare} onExport={handleExport} />
      </div>
    </StudentLayout>
  )
}

export default ComparePage

