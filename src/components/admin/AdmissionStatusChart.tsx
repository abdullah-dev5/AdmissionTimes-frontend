import { getVerificationStatusColor } from "../../data/adminData"
import type { VerificationStatus } from "../../data/adminData"

interface StatusBreakdown {
	status: VerificationStatus
	count: number
	percentage: number
}

interface AdmissionStatusChartProps {
	data: StatusBreakdown[]
}

/**
 * Bar chart component for admission status breakdown
 */
export default function AdmissionStatusChart({ data }: AdmissionStatusChartProps) {
	const maxCount = Math.max(...data.map((d) => d.count))

	return (
		<div className="space-y-3">
			{data.map((item) => {
				const colors = getVerificationStatusColor(item.status)
				const barWidth = (item.count / maxCount) * 100

				return (
					<div key={item.status} className="flex items-center gap-4">
						<div className="w-24 text-sm font-medium" style={{ color: "#111827" }}>
							{item.status}
						</div>
						<div className="flex-1">
							<div className="flex items-center justify-between mb-1">
								<div
									className="h-8 rounded-lg flex items-center px-3 transition-all duration-500"
									style={{
										backgroundColor: colors.bg,
										width: `${barWidth}%`,
										minWidth: "40px",
									}}
								>
									<span className="text-sm font-semibold" style={{ color: colors.text }}>
										{item.count}
									</span>
								</div>
								<span className="text-sm text-gray-600 ml-2">{item.percentage.toFixed(1)}%</span>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}

