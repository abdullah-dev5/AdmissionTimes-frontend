interface UniversityPromptChipProps {
	prompt: string
	onClick: () => void
}

function UniversityPromptChip({ prompt, onClick }: UniversityPromptChipProps) {
	return (
		<button
			onClick={onClick}
			className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
		>
			{prompt}
		</button>
	)
}

export default UniversityPromptChip


