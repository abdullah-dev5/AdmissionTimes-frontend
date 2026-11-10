import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ProgramStatus, StudentAdmission } from '../../data/studentData'
import { SOURCE_LABEL, cityOf, daysLeftLabel, deadlineTone, sourceOf, type DataSource } from '../../utils/studentPortal'

const STATUS_STYLE: Record<ProgramStatus, string> = {
  Open: 'bg-emerald-50 text-emerald-700',
  'Closing Soon': 'bg-amber-50 text-amber-700',
  Closed: 'bg-red-50 text-red-700',
}

export function ProgramStatusBadge({ status }: { status: ProgramStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[status]}`}>
      {status === 'Closing Soon' ? 'Closing soon' : status}
    </span>
  )
}

export function SourceBadge({ source }: { source: DataSource }) {
  const style = source === 'university' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      <span aria-hidden="true">{source === 'university' ? '✓' : '⌁'}</span>
      {SOURCE_LABEL[source]}
    </span>
  )
}

const initials = (name: string) => {
  const words = name.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean)
  const meaningful = words.filter((w) => !['of', 'the', 'and', 'university', 'institute'].includes(w.toLowerCase()))
  const source = meaningful.length ? meaningful : words
  return (source.length >= 2 ? source[0][0] + source[1][0] : (source[0] || '?').slice(0, 2)).toUpperCase()
}

interface AdmissionCardProps {
  admission: StudentAdmission
  onToggleSave?: () => void
  onToggleCompare?: () => void
  comparing?: boolean
  /** Extra controls under the card (e.g. reminder toggle on Saved/Deadlines). */
  footer?: ReactNode
}

/** The admission card used on every student list page (same layout as the mobile app). */
export default function AdmissionCard({ admission, onToggleSave, onToggleCompare, comparing, footer }: AdmissionCardProps) {
  const closed = admission.programStatus === 'Closed'
  const programsCount = admission.programsOffered?.length ?? 0
  const meta = [admission.degree && admission.degree !== 'Not specified' ? admission.degree : null, programsCount > 0 ? `${programsCount} programs` : null]
    .filter(Boolean)
    .join(' · ')
  const city = cityOf(admission)

  return (
    <article className={`flex flex-col bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow ${closed ? 'opacity-75' : ''}`}>
      <Link to={`/program/${admission.id}`} state={{ selectedAdmission: admission }} className="flex gap-3 p-5 pb-3 flex-1">
        <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden" aria-hidden="true">
          {admission.universityLogo ? <img src={admission.universityLogo} alt="" className="w-full h-full object-cover" /> : initials(admission.university)}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-gray-500 truncate" title={admission.university}>
              {admission.university}
              {city ? ` · ${city}` : ''}
            </p>
            <ProgramStatusBadge status={admission.programStatus} />
          </div>
          <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2" title={admission.program}>
            {admission.program}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <SourceBadge source={sourceOf(admission)} />
            {meta ? <span className="text-xs text-gray-500">{meta}</span> : null}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-5 py-2.5 border-t border-gray-100">
        <p className={`text-xs font-medium ${deadlineTone(admission)}`}>
          {admission.hasDeadline !== false && admission.deadline ? `${admission.deadlineDisplay} · ` : ''}
          {daysLeftLabel(admission)}
        </p>
        <div className="flex items-center gap-1">
          {onToggleCompare ? (
            <button
              type="button"
              onClick={onToggleCompare}
              aria-pressed={comparing}
              aria-label={comparing ? 'Remove from comparison' : 'Add to comparison'}
              title={comparing ? 'Remove from comparison' : 'Add to comparison'}
              className={`p-2 rounded-lg transition-colors ${comparing ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          ) : null}
          {onToggleSave ? (
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={admission.saved}
              aria-label={admission.saved ? 'Remove from saved' : 'Save program'}
              title={admission.saved ? 'Remove from saved' : 'Save program'}
              className={`p-2 rounded-lg transition-colors ${admission.saved ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <svg className="w-4 h-4" fill={admission.saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {footer ? <div className="px-5 py-2.5 border-t border-gray-100">{footer}</div> : null}
    </article>
  )
}
