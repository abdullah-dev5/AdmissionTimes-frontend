import { useState, useEffect, useRef } from 'react'
import type { AxiosError } from 'axios'
import { useAi } from '../../contexts/AiContext'
import MessageBubble from './MessageBubble'
import LoadingDots from './LoadingDots'
import ContextBadge from './ContextBadge'
import QuickActionChips from './QuickActionChips'
import aiService, { type ChatHistoryEntry } from '../../services/aiService'
import { formatDisplayDate, formatDisplayDateTime, formatDisplayTime } from '../../utils/dateUtils'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

interface AiReplyPayload {
  result_count?: number
  results?: Array<{
    id: string
    title: string
    degree_level: string | null
    location: string | null
    deadline: string | null
    verification_status: string
    university_id: string | null
  }>
  clarification_needed?: boolean
  clarification_question?: string
}

const redactSensitiveData = (text: string): string => {
  if (!text) return text

  let safe = text

  // Emails
  safe = safe.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')

  // Common API key formats and bearer tokens
  safe = safe.replace(/\b(sk-[A-Za-z0-9]{20,})\b/g, '[redacted-key]')
  safe = safe.replace(/\b(AIza[0-9A-Za-z\-_]{20,})\b/g, '[redacted-key]')
  safe = safe.replace(/\b(BEARER\s+[A-Za-z0-9\-._~+/]+=*)\b/gi, 'Bearer [redacted-token]')

  // JWT-like tokens
  safe = safe.replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[redacted-jwt]')

  // password/secret assignments in plain text
  safe = safe.replace(/\b(password|passwd|secret|api[_-]?key|token)\s*[:=]\s*[^\s,;]+/gi, '$1: [redacted]')

  return safe
}

const formatIsoDateTimeInText = (text: string): string => {
  return text.replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:?\d{2})?\b/g, (match) => {
    return formatDisplayDateTime(match, match)
  })
}

const formatIsoDateOnlyInText = (text: string): string => {
  return text.replace(/\b\d{4}-\d{2}-\d{2}\b/g, (match) => {
    return formatDisplayDate(match, match)
  })
}

const formatVerboseJsDateInText = (text: string): string => {
  return text.replace(
    /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+[A-Z][a-z]{2}\s+\d{1,2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+GMT[+-]\d{4}\s+\([^)]*\)\b/g,
    (match) => {
      return formatDisplayDateTime(match, match)
    }
  )
}

const toConversationalText = (text: string): string => {
  const withDateTime = formatIsoDateTimeInText(text)
  const withDateOnly = formatIsoDateOnlyInText(withDateTime)
  return formatVerboseJsDateInText(withDateOnly)
}

const buildAdmissionResultsSummary = (results: Array<{
  id: string
  title: string
  degree_level: string | null
  location: string | null
  deadline: string | null
  verification_status: string
}>): string => {
  if (!results.length) return ''

  const top = results.slice(0, 5)
  const lines = top.map((item, index) => {
    const deadlineText = item.deadline ? formatDisplayDate(item.deadline, item.deadline) : 'Not specified'
    const degreeText = item.degree_level || 'Degree not specified'
    const locationText = item.location || 'Location not specified'
    const statusText = item.verification_status
      ? item.verification_status.charAt(0).toUpperCase() + item.verification_status.slice(1)
      : 'Unknown'

    return [
      `${index + 1}. ${redactSensitiveData(item.title)}`,
      `- Degree: ${redactSensitiveData(degreeText)}`,
      `- Location: ${redactSensitiveData(locationText)}`,
      `- Deadline: ${deadlineText}`,
      `- Status: ${redactSensitiveData(statusText)}`,
    ].join('\n')
  })

  return ['Here are the most relevant admissions:', ...lines].join('\n\n')
}

const STOP_WORDS = new Set([
  'any', 'new', 'latest', 'show', 'find', 'give', 'me', 'please', 'program', 'programs',
  'admission', 'admissions', 'in', 'of', 'the', 'a', 'an', 'for', 'with', 'to', 'from', 'on', 'at',
])

const extractQueryKeywords = (query?: string): string[] => {
  if (!query) return []
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

const filterResultsByQuery = (
  results: Array<{
    id: string
    title: string
    degree_level: string | null
    location: string | null
    deadline: string | null
    verification_status: string
    university_id: string | null
  }>,
  query?: string
) => {
  const keywords = extractQueryKeywords(query)
  if (!keywords.length) return results

  const requiredMatches = keywords.length >= 2 ? 2 : 1

  return results.filter((item) => {
    const haystack = [
      item.title,
      item.degree_level || '',
      item.location || '',
      item.verification_status || '',
    ]
      .join(' ')
      .toLowerCase()

    const matches = keywords.filter((keyword) => haystack.includes(keyword)).length
    return matches >= requiredMatches
  })
}

const buildConversationalReply = (
  answer: string,
  payload?: AiReplyPayload,
  query?: string
): string => {
  const cleanAnswer = redactSensitiveData(toConversationalText(answer))
  const originalResults = payload?.results || []
  const results = filterResultsByQuery(originalResults, query)
  const hasResultListInAnswer = /(?:^|\n)\s*\d+[\).]|here are the most relevant admissions|i found \d+ match/i.test(cleanAnswer)

  if (!results.length) {
    if (payload?.clarification_needed && payload.clarification_question) {
      return [cleanAnswer, redactSensitiveData(payload.clarification_question)].join('\n\n')
    }
    return cleanAnswer
  }

  if (hasResultListInAnswer) {
    return cleanAnswer
  }

  const resultsSummary = buildAdmissionResultsSummary(results)
  return [cleanAnswer, resultsSummary].filter(Boolean).join('\n\n')
}

const buildDynamicFallbackFromPayload = (query: string, payload?: AiReplyPayload): string => {
  const results = filterResultsByQuery(payload?.results || [], query)
  if (results.length > 0) {
    return [
      'I could not generate a full explanation, but I found these relevant programs:',
      buildAdmissionResultsSummary(results),
    ].join('\n\n')
  }

  if (payload?.clarification_needed && payload.clarification_question) {
    return payload.clarification_question
  }

  const keywords = extractQueryKeywords(query)
  if (keywords.length > 0) {
    return `I could not find a reliable answer for "${query}" right now. Try narrowing it with ${keywords.slice(0, 2).join(' + ')} and a city or degree level.`
  }

  return 'I could not generate a response right now. Please try again with a slightly more specific query.'
}

const isTransientStatus = (status?: number): boolean => {
  return status === 429 || status === 502 || status === 503 || status === 504
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
        .map(m => ({ role: m.isUser ? 'user' : 'ai', text: redactSensitiveData(m.text) }))

    try {
      const requestWithRetry = async () => {
        try {
          return await aiService.chat(messageText, context, historySnapshot)
        } catch (firstError) {
          const axiosError = firstError as AxiosError<{ message?: string }>
          const status = axiosError.response?.status
          if (!isTransientStatus(status)) {
            throw firstError
          }

          await new Promise((resolve) => setTimeout(resolve, 500))
          return await aiService.chat(messageText, context, historySnapshot)
        }
      }

      const response = await requestWithRetry()

      const data = response.data
      const answer = data.answer?.trim()
      const payload: AiReplyPayload = {
        result_count: data.result_count,
        results: data.results,
        clarification_needed: data.clarification_needed,
        clarification_question: data.clarification_question,
      }
      const finalAnswer = resolveAssistantReply(messageText, answer, payload)
      const conversationalAnswer = buildConversationalReply(finalAnswer, {
        result_count: data.result_count,
        results: data.results,
        clarification_needed: data.clarification_needed,
        clarification_question: data.clarification_question,
      }, messageText)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: redactSensitiveData(conversationalAnswer),
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

  const resolveAssistantReply = (query: string, answer: string | undefined, payload?: AiReplyPayload): string => {
    if (!answer) return buildDynamicFallbackFromPayload(query, payload)
    return answer
  }

  const resolveRequestFailureReply = (_query: string, _activeContext: string, error: unknown): string => {
    const axiosError = error as AxiosError<{ message?: string }>
    const status = axiosError.response?.status
    const apiMessage = axiosError.response?.data?.message?.toLowerCase() || ''

    if (status === 401) {
      return 'Your session has expired. Please sign in again, then retry your request.'
    }

    if (status === 503 || apiMessage.includes('gemini') || apiMessage.includes('not configured')) {
      return 'AI service is temporarily unavailable right now. Please try again in a moment.'
    }

    if (isTransientStatus(status)) {
      return 'The assistant is temporarily busy. Please retry your question in a few seconds.'
    }

    return 'I could not process that request right now. Please try again.'
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

