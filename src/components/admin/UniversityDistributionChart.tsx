interface UniversityDistribution {
	university: string
	count: number
}

interface UniversityDistributionChartProps {
	data: UniversityDistribution[]
}

/**
 * Horizontal bar chart for university distribution
 */
export default function UniversityDistributionChart({ data }: UniversityDistributionChartProps) {
	const maxCount = Math.max(...data.map((d) => d.count))
	const colors = [
		"#2563EB",
		"#10B981",
		"#F59E0B",
		"#EF4444",
		"#9333EA",
		"#EC4899",
		"#06B6D4",
		"#84CC16",
	]

	return (
		<div className="space-y-3">
			{data.map((item, index) => {
				const barWidth = (item.count / maxCount) * 100
				const color = colors[index % colors.length]

				return (
					<div key={item.university} className="flex items-center gap-4">
						<div className="w-32 text-sm font-medium text-gray-700 truncate">{item.university}</div>
						<div className="flex-1">
							<div className="flex items-center justify-between mb-1">
								<div
									className="h-6 rounded flex items-center px-3 transition-all duration-500"
									style={{
										backgroundColor: color,
										opacity: 0.8,
										width: `${barWidth}%`,
										minWidth: "30px",
									}}
								>
									<span className="text-xs font-semibold text-white">{item.count}</span>
								</div>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}

