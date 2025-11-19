interface UniversityAIChatButtonProps {
	isOpen: boolean
	onToggle: () => void
}

function UniversityAIChatButton({ isOpen, onToggle }: UniversityAIChatButtonProps) {
	return (
		<button
			onClick={onToggle}
			className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all z-[10000] ${
				isOpen ? "scale-90 bg-blue-700" : "scale-100 bg-blue-600 hover:bg-blue-700"
			}`}
			title="Ask AI Assistant"
		>
			{isOpen ? (
				<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			) : (
				<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
					/>
				</svg>
			)}
		</button>
	)
}

export default UniversityAIChatButton


