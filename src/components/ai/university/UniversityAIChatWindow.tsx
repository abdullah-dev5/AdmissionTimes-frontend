import { useState, useEffect, useRef } from "react"
import UniversityMessageBubble from "./UniversityMessageBubble"
import UniversityPromptChip from "./UniversityPromptChip"
import LoadingDots from "../LoadingDots"

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
}

// Mock responses for university-specific queries
const mockResponses: Record<string, string> = {
	"upload admission guide": "To upload an admission, go to 'Manage Admissions' > Click 'New Admission' > Fill out all required details (title, deadline, fees, requirements) > Upload supporting documents if needed > Click 'Publish'. You can also upload a PDF for auto-fill of admission details.",
	"explain status pending audit": "Pending Audit means your admission submission is awaiting admin verification before being visible to students. The admin reviews your data for accuracy and compliance. You'll receive a notification once the review is complete.",
	"show verified admissions": "You can view all verified admissions under the 'Verification Center' page, filtered by 'Verified' status. Verified admissions are live and visible to students.",
	"system verification policy": "The verification process ensures data accuracy and compliance. After submission, admins review your admission within 2-3 business days. You'll be notified of the result (Verified, Rejected, or Disputed). If rejected, you can review feedback and resubmit.",
	"explain status disputed": "Disputed status means there's a disagreement about your admission data. You can view admin remarks in the Verification Center and submit corrections or clarifications.",
	"how to edit admission": "Go to 'Manage Admissions' > Find your admission > Click 'Edit' > Make changes > Save. Note: Edited admissions may require re-verification.",
	"what is rejected status": "Rejected status means your admission submission didn't meet verification requirements. Check the admin remarks in Verification Center for specific issues. You can fix the problems and resubmit.",
}

const initialPrompts = [
	"Upload admission guide",
	"Explain status: Pending Audit",
	"Show verified admissions",
	"System verification policy",
]

function UniversityAIChatWindow({ isOpen, onClose, universityName = "University" }: UniversityAIChatWindowProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			text: `Hi ${universityName}! I'm your AI Assistant 🤖. How can I help you today?`,
			isUser: false,
			timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		},
	])
	const [inputValue, setInputValue] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const getMockResponse = (query: string): string => {
		const lowerQuery = query.toLowerCase()
		for (const [key, value] of Object.entries(mockResponses)) {
			if (lowerQuery.includes(key.toLowerCase())) {
				return value
			}
		}
		return `I understand you're asking about: "${query}". For university-specific help, you can ask about uploading admissions, verification statuses, managing your submissions, or system policies. How can I assist you further?`
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

		// Simulate API call delay
		setTimeout(() => {
			try {
				// In future: POST /api/ai/query?role=university
				// const response = await fetch('/api/ai/query?role=university', {
				//   method: 'POST',
				//   headers: { 'Content-Type': 'application/json' },
				//   body: JSON.stringify({ query: messageText, role: 'university' })
				// })
				// const data = await response.json()

				const aiMessage: Message = {
					id: (Date.now() + 1).toString(),
					text: getMockResponse(messageText),
					isUser: false,
					timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				}

				setMessages((prev) => [...prev, aiMessage])
			} catch (error) {
				const errorMessage: Message = {
					id: (Date.now() + 1).toString(),
					text: "Sorry, I encountered an error. Please try again.",
					isUser: false,
					timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				}
				setMessages((prev) => [...prev, errorMessage])
			} finally {
				setIsLoading(false)
			}
		}, 800)
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
		<div className="fixed bottom-20 right-6 w-full sm:w-96 max-w-sm bg-white shadow-xl rounded-2xl p-4 flex flex-col max-h-[60vh] z-[9999] overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
				<h3 className="text-sm font-semibold text-blue-600">AI Assistant 🤖</h3>
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
				{messages.length === 1 && (
					<div className="flex flex-wrap gap-2 mb-4">
						{initialPrompts.map((prompt, index) => (
							<UniversityPromptChip key={index} prompt={prompt} onClick={() => handleQuickAction(prompt)} />
						))}
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Bar */}
			<div className="flex items-center gap-2 border-t border-gray-200 pt-2">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Type your message..."
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


