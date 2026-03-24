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
        'Any new verified programs?',
        'Explain application statuses'
      ]
    } else if (context.includes('Search')) {
      return [
        'Show programs closing this month',
        'Show verified programs only',
        'How do I compare programs?',
        'How do I save a program?'
      ]
    } else if (context.includes('Compare')) {
      return [
        'Which program has a lower fee?',
        'Compare deadlines',
        'Explain the differences',
        'How do I add more programs?'
      ]
    } else if (context.includes('Deadline')) {
      return [
        'Show urgent deadlines',
        'How do alerts work?',
        'What deadlines expire this week?',
        'How do I set a reminder?'
      ]
    } else if (context.includes('Watchlist')) {
      return [
        'How do I enable all alerts?',
        'How do I compare saved programs?',
        'Which programs have passed deadline?',
        'How do I manage my watchlist?'
      ]
    } else if (context.includes('Notification')) {
      return [
        'What do notifications mean?',
        'How do I manage alert settings?',
        'Why am I not getting alerts?',
        'Explain status change notifications'
      ]
    }
    return [
      'Help me find programs',
      'Show upcoming deadlines',
      'How do I compare programs?',
      'Explain admission statuses'
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

