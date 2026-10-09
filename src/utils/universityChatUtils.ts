import { formatDisplayDate } from './dateUtils'

export type UniversityChatResult = {
  id: string
  title: string
  degree_level: string | null
  location: string | null
  deadline: string | null
  verification_status: string
}

const formatStatusLabel = (status: string): string =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'

export const buildUniversityResultsSummary = (results: UniversityChatResult[]): string => {
  if (!results.length) return ''

  const lines = results.slice(0, 8).map((item, index) => {
    const deadlineText = item.deadline
      ? formatDisplayDate(item.deadline, item.deadline)
      : 'No deadline'
    const degreeText = item.degree_level || 'Degree not specified'
    const locationText = item.location || 'Location not specified'
    const statusText = formatStatusLabel(item.verification_status)

    return [
      `${index + 1}. ${item.title}`,
      `- Status: ${statusText}`,
      `- Degree: ${degreeText}`,
      `- Location: ${locationText}`,
      `- Deadline: ${deadlineText}`,
    ].join('\n')
  })

  return ['Your admissions:', ...lines].join('\n\n')
}

const answerAlreadyListsResults = (answer: string): boolean =>
  /(?:^|\n)\s*\d+[).]|here are \d+ of your admission|your admissions:/i.test(answer)

export const mergeUniversityChatReply = (
  answer: string,
  results: UniversityChatResult[] | undefined,
  query: string
): string => {
  const trimmed = answer.trim()
  const list = results || []

  if (!list.length) {
    return trimmed
  }

  if (answerAlreadyListsResults(trimmed)) {
    return trimmed
  }

  const keywords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !['show', 'list', 'my', 'the', 'all'].includes(token))

  const filtered =
    keywords.length > 0
      ? list.filter((item) => {
          const haystack = [item.title, item.degree_level || '', item.location || '', item.verification_status]
            .join(' ')
            .toLowerCase()
          return keywords.some((keyword) => haystack.includes(keyword))
        })
      : list

  const effective = filtered.length > 0 ? filtered : list
  return [trimmed, buildUniversityResultsSummary(effective)].filter(Boolean).join('\n\n')
}
