import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'

interface AiContextType {
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  context: string
  setContext: (context: string) => void
}

const AiContext = createContext<AiContextType | undefined>(undefined)

export function AiProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState('Student Dashboard')

  // Memoize callbacks to prevent recreation on every render
  const openChat = useCallback(() => setIsOpen(true), [])
  const closeChat = useCallback(() => setIsOpen(false), [])
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), [])

  // Memoize context value to prevent all consumers from re-rendering
  const value = useMemo(
    () => ({ isOpen, openChat, closeChat, toggleChat, context, setContext }),
    [isOpen, openChat, closeChat, toggleChat, context, setContext]
  )

  return (
    <AiContext.Provider value={value}>
      {children}
    </AiContext.Provider>
  )
}

export function useAi() {
  const context = useContext(AiContext)
  if (context === undefined) {
    throw new Error('useAi must be used within an AiProvider')
  }
  return context
}

