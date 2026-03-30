import { useState, useEffect, useRef } from 'react'
import type { AxiosError } from 'axios'
import { useAi } from '../../contexts/AiContext'
import MessageBubble from './MessageBubble'
import LoadingDots from './LoadingDots'
import ContextBadge from './ContextBadge'
import QuickActionChips from './QuickActionChips'
import aiService, { type ChatHistoryEntry } from '../../services/aiService'
import { formatDisplayTime } from '../../utils/dateUtils'

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
      timestamp: formatDisplayTime(new Date().toISOString())
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      timestamp: formatDisplayTime(new Date().toISOString())
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    resetInactivityTimer()

    // Build last 4 turns as history so AI never loses context of recent exchanges
    const historySnapshot: ChatHistoryEntry[] = messages
      .filter(m => m.id !== '1') // skip welcome message
      .slice(-4)
      .map(m => ({ role: m.isUser ? 'user' : 'ai', text: m.text }))

    try {
      const response = await aiService.chat(messageText, context, historySnapshot)
      const data = response.data
      const answer = data.answer?.trim()
      const finalAnswer = resolveAssistantReply(messageText, answer, context)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: finalAnswer,
        isUser: false,
        timestamp: formatDisplayTime(new Date().toISOString())
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: resolveRequestFailureReply(messageText, context, error),
        isUser: false,
        timestamp: formatDisplayTime(new Date().toISOString())
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const isRefusalReply = (text: string): boolean => {
    const lower = text.toLowerCase()
    return (
      lower.includes('i can only help with') ||
      lower.includes('i cannot assist') ||
      lower.includes('i cannot access or explain') ||
      lower.includes('cannot manage')
    )
  }

  const getGuidanceResponse = (query: string, activeContext: string): string => {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('compare')) {
      return [
        'You can compare programs using this flow:',
        '- Open Compare and select at least two saved programs.',
        '- Review fee, deadline, location, and eligibility side by side.',
        '- Save the better option to your watchlist for reminders.',
      ].join('\n')
    }

    if (lowerQuery.includes('alert') || lowerQuery.includes('reminder') || lowerQuery.includes('watchlist')) {
      return [
        'Here is how to manage alerts and watchlist:',
        '- Open Watchlist and enable alerts for selected programs.',
        '- Check Deadlines for urgent items this week.',
        '- Remove expired programs to keep your list clean.',
      ].join('\n')
    }

    if (lowerQuery.includes('status') || lowerQuery.includes('application')) {
      return [
        'Application status guide:',
        '- Pending: update is still being processed.',
        '- Verified: listing is approved by admins.',
        '- Rejected: check remarks in notifications or dashboard.',
      ].join('\n')
    }

    return [
      `I can help with ${activeContext} tasks in a practical way:`,
      '- Find programs by field, city, degree, and deadline.',
      '- Compare saved programs by fee, deadline, and eligibility.',
      '- Explain statuses and suggest next actions.',
    ].join('\n')
  }

  const resolveAssistantReply = (query: string, answer: string | undefined, activeContext: string): string => {
    if (!answer) return getFallbackResponse(query, activeContext)
    if (isRefusalReply(answer)) return getGuidanceResponse(query, activeContext)
    return answer
  }

  const resolveRequestFailureReply = (query: string, activeContext: string, error: unknown): string => {
    const axiosError = error as AxiosError<{ message?: string }>
    const status = axiosError.response?.status
    const apiMessage = axiosError.response?.data?.message?.toLowerCase() || ''

    if (status === 401) {
      return 'Your session has expired. Please sign in again, then retry your request.'
    }

    if (status === 503 || apiMessage.includes('gemini') || apiMessage.includes('not configured')) {
      return [
        'AI service is temporarily unavailable right now.',
        getGuidanceResponse(query, activeContext),
      ].join('\n')
    }

    return getGuidanceResponse(query, activeContext)
  }

  const getFallbackResponse = (query: string, activeContext: string): string => {
    const lowerQuery = query.toLowerCase()
    const suggestions: string[] = []

    if (lowerQuery.includes('deadline') || lowerQuery.includes('alert') || lowerQuery.includes('reminder')) {
      suggestions.push('Open Deadlines to see upcoming dates and urgent items.')
      suggestions.push('Use Watchlist alerts so you receive reminders before due dates.')
    }

    if (lowerQuery.includes('compare') || lowerQuery.includes('fee') || lowerQuery.includes('cheap')) {
      suggestions.push('Open Compare and pick at least two programs from your saved list.')
      suggestions.push('Use Search filters for location, degree level, and fee range first.')
    }

    if (lowerQuery.includes('status') || lowerQuery.includes('application')) {
      suggestions.push('Check Dashboard stats for active applications and urgent tasks.')
      suggestions.push('Open Notifications for recent status updates from universities.')
    }

    if (suggestions.length === 0) {
      suggestions.push(`Try asking a shorter query in ${activeContext}.`)
      suggestions.push('You can ask for deadlines, comparison, eligibility, or fee insights.')
    }

    return [
      'AI response is temporarily unavailable. You can still continue with these steps:',
      ...suggestions.map((s) => `- ${s}`),
    ].join('\n')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col z-[9999] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>AI Assistant</h3>
            <div className="flex items-center gap-2">
              <ContextBadge context={context} />
              <span className="text-[11px] text-emerald-600">Online</span>
            </div>
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
              placeholder="Ask about deadlines, compare, fees..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-sm"
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

