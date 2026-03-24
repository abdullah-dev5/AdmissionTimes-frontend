import { useState, useEffect, useRef } from "react"
import type { AxiosError } from "axios"
import UniversityMessageBubble from "./UniversityMessageBubble"
import UniversityPromptChip from "./UniversityPromptChip"
import LoadingDots from "../LoadingDots"
import aiService, { type ChatHistoryEntry } from "../../../services/aiService"

interface Message {
	id: string
	text: string
	isUser: boolean
	timestamp: string
}

interface UniversityAIChatWindowProps {
	isOpen: boolean
	onClose: () => void
	universityName?: string
	aiContext?: string
}

const initialPrompts = [
	"How do I publish a new admission?",
	"Explain Pending Audit status",
	"Show my verified admissions",
	"What triggers re-verification?",
]

function UniversityAIChatWindow({
	isOpen,
	onClose,
	universityName = "University",
	aiContext = "University Portal",
}: UniversityAIChatWindowProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			text: `Hi ${universityName}! I'm your AI Assistant. I can help with admission publishing, verification workflow, and dashboard actions.`,
			isUser: false,
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		},
	])
	const [inputValue, setInputValue] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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
			onClose()
		}, 10 * 60 * 1000)
	}

	const clearInactivityTimer = () => {
		if (inactivityTimerRef.current) {
			clearTimeout(inactivityTimerRef.current)
			inactivityTimerRef.current = null
		}
	}

	const buildFallback = (query: string): string => {
		const lower = query.toLowerCase()
		const suggestions: string[] = []

		if (lower.includes("pending") || lower.includes("audit") || lower.includes("verify") || lower.includes("status")) {
			suggestions.push("Open Verification Center and filter by Pending Audit to review current queue.")
			suggestions.push("Check admin remarks on rejected rows before resubmitting.")
		}

		if (lower.includes("upload") || lower.includes("pdf") || lower.includes("admission") || lower.includes("publish")) {
			suggestions.push("Use Manage Admissions > New Admission, then upload your PDF for auto-extraction.")
			suggestions.push("Verify deadline, eligibility, and location fields before publishing.")
		}

		if (suggestions.length === 0) {
			suggestions.push("Ask me: 'How do I publish a new admission?' or 'Explain Pending Audit status'.")
			suggestions.push("You can also ask for checklist-style steps for any university workflow.")
		}

		return [
			"AI is temporarily unavailable, but here are useful next steps:",
			...suggestions.map((s) => `- ${s}`),
		].join("\n")
	}

	const isRefusalReply = (text: string): boolean => {
		const lower = text.toLowerCase()
		return (
			lower.includes("i can only help with") ||
			lower.includes("i cannot assist") ||
			lower.includes("i cannot access")
		)
	}

	const buildGuidanceFallback = (query: string): string => {
		const lower = query.toLowerCase()

		if (lower.includes("pending") || lower.includes("audit") || lower.includes("status") || lower.includes("verify")) {
			return [
				"Pending Audit means your admission is queued for admin verification.",
				"- Open Verification Center and review remarks for the specific row.",
				"- Fix missing fields (deadline, eligibility, location, title).",
				"- Resubmit and track until status changes to Verified.",
			].join("\n")
		}

		if (lower.includes("upload") || lower.includes("publish") || lower.includes("admission")) {
			return [
				"Publishing flow for a new admission:",
				"- Go to Manage Admissions and create a new admission.",
				"- Upload PDF or fill fields manually, then verify extracted values.",
				"- Submit for verification and monitor in Verification Center.",
			].join("\n")
		}

		if (lower.includes("re-verification") || lower.includes("resubmit") || lower.includes("edit")) {
			return [
				"Re-verification is triggered when key admission fields are edited.",
				"- Update details carefully and keep title, deadline, and eligibility consistent.",
				"- Resubmit and check remarks for any rejection reasons.",
			].join("\n")
		}

		if (lower.includes("verified") || lower.includes("my admissions") || lower.includes("all my")) {
			return [
				"To view your verified admissions quickly:",
				"- Open Manage Admissions and apply Verification Status = Verified.",
				"- Sort by latest deadline or update date.",
				"- Open each record to review currently published details.",
			].join("\n")
		}

		return [
			"I can help with university workflow questions:",
			"- Publishing new admissions",
			"- Verification statuses and corrective actions",
			"- Editing and resubmission checklists",
		].join("\n")
	}

	const resolveAssistantReply = (query: string, answer: string | undefined): string => {
		if (!answer) return buildFallback(query)
		if (isRefusalReply(answer)) return buildGuidanceFallback(query)
		return answer
	}

	const resolveRequestFailureReply = (query: string, error: unknown): string => {
		const axiosError = error as AxiosError<{ message?: string }>
		const status = axiosError.response?.status
		const apiMessage = axiosError.response?.data?.message?.toLowerCase() || ""

		if (status === 401) {
			return "Your session has expired. Please sign in again, then retry your question."
		}

		if (status === 503 || apiMessage.includes("gemini") || apiMessage.includes("not configured")) {
			return [
				"AI service is temporarily unavailable right now.",
				buildGuidanceFallback(query),
			].join("\n")
		}

		return buildGuidanceFallback(query)
	}

	const handleSend = async (query?: string) => {
		const messageText = query || inputValue.trim()
		if (!messageText) return

		const userMessage: Message = {
			id: Date.now().toString(),
			text: messageText,
			isUser: true,
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		}

		setMessages((prev) => [...prev, userMessage])
		setInputValue("")
		setIsLoading(true)
		resetInactivityTimer()

		// Pass last 4 turns so AI retains context across follow-up questions
		const historySnapshot: ChatHistoryEntry[] = messages
			.filter((m) => m.id !== "1")
			.slice(-4)
			.map((m) => ({ role: m.isUser ? "user" : "ai", text: m.text }))

		try {
			const response = await aiService.chat(messageText, aiContext, historySnapshot)
			const answer = response.data?.answer?.trim()
			const finalAnswer = resolveAssistantReply(messageText, answer)

			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: finalAnswer,
				isUser: false,
				timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			}

			setMessages((prev) => [...prev, aiMessage])
		} catch (error) {
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: resolveRequestFailureReply(messageText, error),
				isUser: false,
				timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			}
			setMessages((prev) => [...prev, errorMessage])
		} finally {
			setIsLoading(false)
		}
	}

	const handleQuickAction = (prompt: string) => {
		handleSend(prompt)
	}

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	if (!isOpen) return null

	return (
		<div className="fixed bottom-20 right-6 w-full sm:w-96 max-w-sm bg-white shadow-xl rounded-2xl p-4 flex flex-col max-h-[60vh] z-[9999] overflow-hidden border border-blue-100">
			{/* Header */}
			<div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
				<div>
					<h3 className="text-sm font-semibold text-blue-700">University AI Assistant</h3>
					<div className="flex items-center gap-2">
						<p className="text-[11px] text-gray-500">{aiContext}</p>
						<span className="text-[11px] text-emerald-600">Online</span>
					</div>
				</div>
				<button
					onClick={onClose}
					className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto px-2 py-2 mb-2" style={{ backgroundColor: "#F9FAFB" }}>
				{messages.map((message) => (
					<UniversityMessageBubble
						key={message.id}
						message={message.text}
						isUser={message.isUser}
						timestamp={message.timestamp}
					/>
				))}
				{isLoading && (
					<div className="flex justify-start mb-4">
						<div className="px-4 py-2 rounded-2xl rounded-tl-sm" style={{ backgroundColor: "#F3F4F6" }}>
							<LoadingDots />
						</div>
					</div>
				)}
				<div className="flex flex-wrap gap-2 mb-4">
					{initialPrompts.map((prompt, index) => (
						<UniversityPromptChip key={index} prompt={prompt} onClick={() => handleQuickAction(prompt)} />
					))}
				</div>
				<div ref={messagesEndRef} />
			</div>

			{/* Input Bar */}
			<div className="flex items-center gap-2 border-t border-gray-200 pt-2">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => {
						setInputValue(e.target.value)
						resetInactivityTimer()
					}}
					onKeyPress={handleKeyPress}
					placeholder="Ask about verification, publishing, or status..."
					className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					onClick={() => handleSend()}
					disabled={!inputValue.trim() || isLoading}
					className="px-3 py-2 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 bg-blue-600"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
						/>
					</svg>
				</button>
			</div>
		</div>
	)
}

export default UniversityAIChatWindow


