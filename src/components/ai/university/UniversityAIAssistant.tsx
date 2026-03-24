import { useState } from "react"
import UniversityAIChatButton from "./UniversityAIChatButton"
import UniversityAIChatWindow from "./UniversityAIChatWindow"

interface UniversityAIAssistantProps {
	universityName?: string
	aiContext?: string
}

function UniversityAIAssistant({ universityName, aiContext }: UniversityAIAssistantProps) {
	const [isOpen, setIsOpen] = useState(false)

	const toggleChat = () => {
		setIsOpen((prev) => !prev)
	}

	const closeChat = () => {
		setIsOpen(false)
	}

	return (
		<>
			<UniversityAIChatButton isOpen={isOpen} onToggle={toggleChat} />
			<UniversityAIChatWindow
				isOpen={isOpen}
				onClose={closeChat}
				universityName={universityName}
				aiContext={aiContext}
			/>
		</>
	)
}

export default UniversityAIAssistant


