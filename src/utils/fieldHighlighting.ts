/**
 * Utilities for highlighting changed fields in admission detail view
 */

import React from "react"

/**
 * Check if a field was recently changed
 */
export const isFieldHighlighted = (fieldName: string, changedFields: Set<string>): boolean => {
	return changedFields.has(fieldName)
}

/**
 * Get highlight style for changed field
 */
export const getFieldHighlightStyle = (isHighlighted: boolean) => {
	if (!isHighlighted) return {}

	return {
		backgroundColor: "#FFFBEB", // Light amber
		borderLeft: "3px solid #F59E0B", // Amber border
		paddingLeft: "12px",
		transition: "all 0.3s ease",
	}
}

/**
 * Component wrapper for field highlighting
 */
export const HighlightedField: React.FC<{
	label: string
	value: string | React.ReactNode
	isChanged: boolean
	oldValue?: string
	children?: React.ReactNode
}> = ({ label, value, isChanged, oldValue, children }) => {
	const style = getFieldHighlightStyle(isChanged)

	return React.createElement(
		"div",
		{ className: "p-4 rounded-lg border border-gray-200", style },
		React.createElement(
			"div",
			{ className: "flex items-start justify-between" },
			React.createElement(
				"div",
				{ className: "flex-1" },
				React.createElement("p", { className: "text-sm font-semibold text-gray-700 mb-1" }, label),
				React.createElement("p", { className: "text-gray-900 font-medium" }, value),
				isChanged && oldValue && React.createElement(
					"p",
					{ className: "text-xs text-gray-500 mt-2 line-through" },
					"Previous: ", oldValue
				)
			),
			isChanged && React.createElement(
				"div",
				{
					className: "px-2 py-1 rounded-full text-xs font-semibold ml-3",
					style: {
						backgroundColor: "#FEE2E2",
						color: "#DC2626",
					}
				},
				"🔄 Changed"
			)
		),
		children && React.createElement("div", { className: "mt-3" }, children)
	)
}

/**
 * Inline indicator for changed fields
 */
export const ChangeIndicator: React.FC<{
	isChanged: boolean
	type?: "badge" | "dot" | "icon"
}> = ({ isChanged, type = "badge" }) => {
	if (!isChanged) return null

	if (type === "dot") {
		return React.createElement("span", {
			className: "inline-block w-2 h-2 rounded-full ml-2",
			style: { backgroundColor: "#F59E0B" },
			title: "This field has been changed"
		})
	}

	if (type === "icon") {
		return React.createElement(
			"span",
			{ className: "ml-2 text-lg", title: "This field has been changed" },
			"🔄"
		)
	}

	// badge (default)
	return React.createElement(
		"span",
		{
			className: "inline-block px-2 py-0.5 text-xs font-semibold rounded-full ml-2",
			style: {
				backgroundColor: "#FFFBEB",
				color: "#F59E0B",
				border: "1px solid #F59E0B",
			}
		},
		"Changed"
	)
}

/**
 * Diff comparison view for field changes
 */
export const FieldDiffView: React.FC<{
	fieldName: string
	oldValue: string | null
	newValue: string | null
}> = ({ fieldName, oldValue, newValue }) => {
	return React.createElement(
		"div",
		{ className: "grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200" },
		React.createElement(
			"div",
			null,
			React.createElement("p", { className: "text-xs font-semibold text-red-700 uppercase mb-2" }, "Previous"),
			React.createElement(
				"p",
				{
					className: "p-2 rounded text-sm break-words",
					style: {
						backgroundColor: "#FEE2E2",
						color: "#991B1B",
						fontFamily: "monospace",
					}
				},
				oldValue || "(empty)"
			)
		),
		React.createElement(
			"div",
			null,
			React.createElement("p", { className: "text-xs font-semibold text-green-700 uppercase mb-2" }, "Current"),
			React.createElement(
				"p",
				{
					className: "p-2 rounded text-sm break-words",
					style: {
						backgroundColor: "#DCFCE7",
						color: "#166534",
						fontFamily: "monospace",
					}
				},
				newValue || "(empty)"
			)
		)
	)
}

/**
 * Field change timeline
 */
export const FieldChangeTimeline: React.FC<{
	changes: Array<{
		timestamp: string
		fieldName: string
		oldValue: string
		newValue: string
		changedBy: string
	}>
}> = ({ changes }) => {
	return React.createElement(
		"div",
		{ className: "space-y-4" },
		changes.map((change, idx) =>
			React.createElement(
				"div",
				{ key: idx, className: "flex gap-4" },
				React.createElement(
					"div",
					{ className: "flex flex-col items-center" },
					React.createElement("div", {
						className: "w-3 h-3 rounded-full mt-2",
						style: { backgroundColor: "#F59E0B" }
					}),
					idx < changes.length - 1 && React.createElement("div", {
						className: "w-0.5 h-12",
						style: { backgroundColor: "#D1D5DB" }
					})
				),
				React.createElement(
					"div",
					{ className: "flex-1 pb-4" },
					React.createElement("p", { className: "font-semibold text-gray-900" }, change.fieldName),
					React.createElement(
						"p",
						{ className: "text-xs text-gray-500 mt-1" },
						"Changed by ", change.changedBy, " at ", new Date(change.timestamp).toLocaleString()
					),
					React.createElement(FieldDiffView, {
						fieldName: change.fieldName,
						oldValue: change.oldValue,
						newValue: change.newValue
					})
				)
			)
		)
	)
}
