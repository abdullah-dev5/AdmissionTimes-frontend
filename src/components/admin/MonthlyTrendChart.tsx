interface MonthlyTrend {
	month: string
	count: number
}

interface MonthlyTrendChartProps {
	data: MonthlyTrend[]
}

/**
 * Line/Bar chart for monthly admission trends
 */
export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
	if (data.length === 0) {
		return <p className="text-sm text-gray-500">No monthly trend data available.</p>
	}

	const maxCount = Math.max(...data.map((d) => d.count), 0)
	const chartHeight = 200

	return (
		<div className="relative" style={{ height: `${chartHeight}px` }}>
			{/* Y-axis labels */}
			<div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
				<span>{maxCount}</span>
				<span>{Math.floor(maxCount / 2)}</span>
				<span>0</span>
			</div>

			{/* Chart area */}
			<div className="ml-8 h-full flex items-end gap-2">
				{data.map((item, index) => {
					const barHeight = maxCount > 0 ? (item.count / maxCount) * (chartHeight - 40) : 0
					const isLatest = index === data.length - 1

					return (
						<div key={item.month} className="flex-1 flex flex-col items-center gap-2">
							<div className="relative w-full" style={{ height: `${chartHeight - 40}px` }}>
								<div
									className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
									style={{
										backgroundColor: isLatest ? "#2563EB" : "#DBEAFE",
										height: `${barHeight}px`,
										minHeight: "4px",
									}}
									title={`${item.month}: ${item.count} admissions`}
								>
									<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
										{item.count}
									</div>
								</div>
							</div>
							<div className="text-xs text-gray-600 text-center transform -rotate-45 origin-top-left whitespace-nowrap" style={{ width: "60px", marginLeft: "-20px" }}>
								{item.month}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

