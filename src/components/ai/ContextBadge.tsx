interface ContextBadgeProps {
  context: string
}

function ContextBadge({ context }: ContextBadgeProps) {
  return (
    <div className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#E0E7FF', color: '#2563EB' }}>
      {context}
    </div>
  )
}

export default ContextBadge

