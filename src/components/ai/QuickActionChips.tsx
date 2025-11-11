interface QuickActionChipsProps {
  onSelect: (query: string) => void
  context: string
}

function QuickActionChips({ onSelect, context }: QuickActionChipsProps) {
  const getQuickActions = () => {
    if (context.includes('Dashboard')) {
      return [
        'Show upcoming deadlines',
        'Compare saved programs',
        'Recommendations',
        'Application status'
      ]
    } else if (context.includes('Search')) {
      return [
        'Filter by deadline',
        'Show verified only',
        'Compare results',
        'Save to watchlist'
      ]
    } else if (context.includes('Compare')) {
      return [
        'Which is cheapest?',
        'Compare deadlines',
        'Show differences',
        'Save comparison'
      ]
    } else if (context.includes('Deadline')) {
      return [
        'Show urgent only',
        'Set all alerts',
        'Export calendar',
        'Upcoming this week'
      ]
    } else if (context.includes('Watchlist')) {
      return [
        'Enable all alerts',
        'Compare selected',
        'Remove expired',
        'Export list'
      ]
    } else if (context.includes('Notification')) {
      return [
        'Mark all as read',
        'Filter alerts',
        'Settings',
        'Clear all'
      ]
    }
    return [
      'Help me search',
      'Show deadlines',
      'Compare programs',
      'Get recommendations'
    ]
  }

  const actions = getQuickActions()

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onSelect(action)}
          className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          {action}
        </button>
      ))}
    </div>
  )
}

export default QuickActionChips

