import { useState } from "react"
import UniversityAIChatButton from "./UniversityAIChatButton"
import UniversityAIChatWindow from "./UniversityAIChatWindow"

interface UniversityAIAssistantProps {
	universityName?: string
}

function UniversityAIAssistant({ universityName }: UniversityAIAssistantProps) {
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
			<UniversityAIChatWindow isOpen={isOpen} onClose={closeChat} universityName={universityName} />
		</>
	)
}

export default UniversityAIAssistant


