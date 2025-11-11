interface MessageBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
}

function MessageBubble({ message, isUser, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'rounded-tr-sm'
              : 'rounded-tl-sm'
          } ${isUser ? 'text-white' : 'text-gray-800'}`}
          style={isUser ? { backgroundColor: '#2563EB' } : { backgroundColor: '#F3F4F6' }}
        >
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}

export default MessageBubble

