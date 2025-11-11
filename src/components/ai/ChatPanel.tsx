import { useState, useEffect, useRef } from 'react'
import { useAi } from '../../contexts/AiContext'
import MessageBubble from './MessageBubble'
import LoadingDots from './LoadingDots'
import ContextBadge from './ContextBadge'
import QuickActionChips from './QuickActionChips'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

function ChatPanel() {
  const { isOpen, closeChat, context } = useAi()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you with admissions today?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      resetInactivityTimer()
    } else {
      clearInactivityTimer()
    }
    return () => clearInactivityTimer()
  }, [isOpen])

  const resetInactivityTimer = () => {
    clearInactivityTimer()
    inactivityTimerRef.current = setTimeout(() => {
      closeChat()
    }, 10 * 60 * 1000)
  }

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
  }

  const handleQuickAction = (query: string) => {
    setInputValue(query)
    handleSend(query)
  }

  const handleSend = async (query?: string) => {
    const messageText = query || inputValue.trim()
    if (!messageText) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    resetInactivityTimer()

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: messageText,
          context: context
        })
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || getMockResponse(messageText),
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getMockResponse(messageText),
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('deadline') || lowerQuery.includes('upcoming')) {
      return 'You have 3 upcoming deadlines in the next 7 days. The closest is FAST University\'s BS Computer Science program, due in 3 days. Would you like me to set an alert for this?'
    } else if (lowerQuery.includes('compare') || lowerQuery.includes('comparison')) {
      return 'To compare programs, select at least 2 programs from your watchlist or search results, then click "Compare Selected". I can help you identify key differences like fees, deadlines, and program features.'
    } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      return 'Based on your saved programs and interests, I recommend checking out NUST\'s MS Data Science program and LUMS\'s MBA program. Both match your profile with 85%+ compatibility scores.'
    } else if (lowerQuery.includes('alert') || lowerQuery.includes('reminder')) {
      return 'I can help you set alerts for important deadlines. Alerts are sent 7 days, 3 days, and 1 day before each deadline. Would you like me to enable alerts for all your saved programs?'
    } else if (lowerQuery.includes('cheap') || lowerQuery.includes('lowest') || lowerQuery.includes('fee')) {
      return 'Among your saved programs, FAST University has the lowest fee at PKR 75,000. COMSATS follows at PKR 85,000, and LUMS at PKR 98,000.'
    } else if (lowerQuery.includes('status') || lowerQuery.includes('application')) {
      return 'You currently have 8 active applications. 3 are under review, 2 are pending document submission, and 3 have been accepted. Check your dashboard for detailed status updates.'
    } else {
      return 'I understand you\'re asking about: ' + query + '. Let me help you with that. You can search for specific programs, compare options, or set up deadline alerts. How would you like to proceed?'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col z-[9999] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>AI Assistant</h3>
            <ContextBadge context={context} />
          </div>
        </div>
        <button
          onClick={closeChat}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: '#F9FAFB' }}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="px-4 py-2 rounded-2xl rounded-tl-sm" style={{ backgroundColor: '#F3F4F6' }}>
              <LoadingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200">
        <QuickActionChips onSelect={handleQuickAction} context={context} />
        <div className="p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                resetInactivityTimer()
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: '#2563EB' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel

