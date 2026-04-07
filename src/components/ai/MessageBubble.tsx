interface MessageBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
}

const renderAssistantMessage = (message: string) => {
  const lines = message.split('\n')
  const numberedEntryRegex = /^\s*\d+[\).]\s+/
  const bulletRegex = /^\s*[-•]\s+/

  const cards: Array<{ title: string; details: string[] }> = []
  const paragraphs: string[] = []
  let currentCard: { title: string; details: string[] } | null = null
  let paragraphBuffer: string[] = []

  const flushParagraphBuffer = () => {
    const paragraph = paragraphBuffer.join('\n').trim()
    if (paragraph) paragraphs.push(paragraph)
    paragraphBuffer = []
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trim()

    if (!line) {
      if (!currentCard) flushParagraphBuffer()
      return
    }

    if (numberedEntryRegex.test(line)) {
      flushParagraphBuffer()
      if (currentCard) cards.push(currentCard)
      currentCard = {
        title: line.replace(numberedEntryRegex, ''),
        details: [],
      }
      return
    }

    if (currentCard) {
      if (bulletRegex.test(line)) {
        currentCard.details.push(line.replace(bulletRegex, ''))
      } else {
        currentCard.details.push(line)
      }
      return
    }

    paragraphBuffer.push(line)
  })

  flushParagraphBuffer()
  if (currentCard) cards.push(currentCard)

  const renderedParagraphs = paragraphs.map((paragraph, index) => {
    const paragraphLines = paragraph.split('\n').map((line) => line.trim()).filter(Boolean)
    const isBulletBlock = paragraphLines.length > 0 && paragraphLines.every((line) => bulletRegex.test(line))

    if (isBulletBlock) {
      return (
        <ul key={`para-${index}`} className="list-disc pl-5 space-y-1.5">
          {paragraphLines.map((line, lineIndex) => (
            <li key={`line-${lineIndex}`} className="text-sm leading-relaxed">
              {line.replace(bulletRegex, '')}
            </li>
          ))}
        </ul>
      )
    }

    return (
      <p key={`para-${index}`} className="text-sm leading-relaxed whitespace-pre-wrap">
        {paragraph}
      </p>
    )
  })

  const renderedCards = cards.map((card, index) => (
    <div key={`card-${index}`} className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5">
      <p className="text-sm font-semibold text-gray-900">{card.title}</p>
      {card.details.length > 0 && (
        <ul className="mt-2 list-disc pl-5 space-y-1.5">
          {card.details.map((line, lineIndex) => (
            <li key={`detail-${lineIndex}`} className="text-sm leading-relaxed text-gray-700">
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  ))

  return [...renderedParagraphs, ...renderedCards]
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
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          ) : (
            <div className="space-y-2">{renderAssistantMessage(message)}</div>
          )}
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

