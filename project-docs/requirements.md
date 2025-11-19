# Requirements & Features

- Date: 2025-11-11

## Verification Center (University)
- View audits fetched from `/api/audits` (mocked for now).
- Status filters: All, Pending, Verified, Rejected, Disputed.
- Search by admission title.
- Table columns: Admission Title, Status, Verified By, Last Action Date, Remarks, Actions.
- Status badges:
  - Pending: bg-yellow-100 text-yellow-700
  - Verified: bg-green-100 text-green-700
  - Rejected: bg-red-100 text-red-700
  - Disputed: bg-orange-100 text-orange-700
- Actions:
  - View Details: modal with admission info, admin comment, timestamp.
  - Download Log: mock download + toast confirmation (integrate later with `/api/verification/log/:id`).

## Edge Cases
- No results after filter/search — show empty state.
- Long remarks — truncate in table; show full in modal.
- Missing `verifiedBy` — show “—”.

## Change Logs (University)
- Path: `/university/change-logs`
- Filters:
  - Date Range (from/to)
  - Admission dropdown (All + specific admissions)
  - Search by title or modifier
- Table columns:
  - Admission Title, Modified By, Date & Time, Change Summary, Actions
- View Diff modal:
  - Field-level entries: “Field: old → new”
  - Styling: old in red, new in green; header blue
- Behavior:
  - Filtered results update dynamically
  - Sorted by date desc (latest first)
  - Empty state when no results

## Notifications Center (University)
- Path: `/university/notifications-center`
- Tabs: All, Admin Feedback, System Alert, Data Update
- Search: by title or message contents
- Card entries:
  - Title, short message, type badge, timestamp (relative), read/unread indicator
  - Actions: Mark as Read, View Admission (navigates to admission context; placeholder for now)
- Behavior:
  - Tabs and search dynamically filter list
  - "Mark All as Read" updates all items (mock)
  - Future integration:

## University AI Assistant Sidebar Widget
- Component: Floating chat widget for university users
- Location: Fixed bottom-right on all university pages
- Components:
  - `UniversityAIChatButton`: Floating button with message icon
  - `UniversityAIChatWindow`: Expandable chat window with messages, input, and quick prompts
  - `UniversityMessageBubble`: User/AI message display with alignment
  - `UniversityPromptChip`: Clickable quick action suggestions
- Features:
  - Initial greeting with university name personalization
  - Quick prompt chips: "Upload admission guide", "Explain status: Pending Audit", "Show verified admissions", "System verification policy"
  - University-specific mock responses for:
    - Upload admission guide
    - Verification statuses (Pending Audit, Verified, Rejected, Disputed)
    - System verification policy
    - Admission management queries
  - Auto-scroll to latest message
  - Send via Enter key
  - Responsive design (max-w-sm on mobile, w-96 on desktop)
- Styling:
  - Floating button: bg-blue-600, fixed bottom-6 right-6, rounded-full
  - Chat window: bg-white shadow-xl rounded-2xl, max-h-[60vh]
  - User messages: bg-blue-500 text-white, right-aligned
  - AI messages: bg-gray-100 text-gray-900, left-aligned
- Future Integration:
  - POST `/api/ai/query?role=university` with `{ query, role: "university" }`
  - Cache conversation history in localStorage
  - Context-aware responses based on current page
    - GET `/api/notifications?userId={repId}`
    - PATCH `/api/notifications/:id` to update read state


