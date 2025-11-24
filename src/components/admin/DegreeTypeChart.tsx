interface DegreeTypeDistribution {
	degreeType: string
	count: number
}

interface DegreeTypeChartProps {
	data: DegreeTypeDistribution[]
}

/**
 * Pie chart visualization for degree type distribution
 */
export default function DegreeTypeChart({ data }: DegreeTypeChartProps) {
	const total = data.reduce((sum, item) => sum + item.count, 0)
	const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#9333EA"]

	// Calculate angles for pie chart
	let currentAngle = 0
	const segments = data.map((item, index) => {
		const percentage = (item.count / total) * 100
		const angle = (item.count / total) * 360
		const startAngle = currentAngle
		currentAngle += angle

		return {
			...item,
			percentage,
			angle,
			startAngle,
			color: colors[index % colors.length],
		}
	})

	return (
		<div className="flex items-center gap-8">
			{/* Pie Chart SVG */}
			<div className="flex-shrink-0">
				<svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
					{segments.map((segment, index) => {
						const largeArcFlag = segment.angle > 180 ? 1 : 0
						const x1 = 80 + 80 * Math.cos((segment.startAngle * Math.PI) / 180)
						const y1 = 80 + 80 * Math.sin((segment.startAngle * Math.PI) / 180)
						const x2 = 80 + 80 * Math.cos(((segment.startAngle + segment.angle) * Math.PI) / 180)
						const y2 = 80 + 80 * Math.sin(((segment.startAngle + segment.angle) * Math.PI) / 180)

						return (
							<g key={index} className="hover:opacity-100 transition-opacity cursor-pointer">
								<title>{`${segment.degreeType}: ${segment.count} (${segment.percentage.toFixed(1)}%)`}</title>
								<path
									d={`M 80 80 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
									fill={segment.color}
									opacity={0.8}
								/>
							</g>
						)
					})}
				</svg>
			</div>

			{/* Legend */}
			<div className="flex-1 space-y-2">
				{segments.map((segment, index) => (
					<div key={index} className="flex items-center gap-3">
						<div className="w-4 h-4 rounded" style={{ backgroundColor: segment.color }}></div>
						<div className="flex-1 flex items-center justify-between">
							<span className="text-sm font-medium text-gray-700">{segment.degreeType}</span>
							<span className="text-sm text-gray-600">
								{segment.count} ({segment.percentage.toFixed(1)}%)
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

