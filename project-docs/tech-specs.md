# Technical Specifications

- Date: 2025-11-11

## Tech Stack
- React 19, TypeScript, Vite
- React Router v7
- Tailwind CSS v4

## Page: Verification Center
- Path: `/university/verification-center`
- Component: `src/pages/university/VerificationCenter.tsx`
- Local subcomponents: `FilterBar`, `AuditTable`, `AuditModal`
- Data: mock fetch in component (replace with `/api/audits`)

## Coding Notes
- Keep UI minimal: white card container, rounded-xl, shadow, p-4.
- Sticky header for page header.
- Hover state on table rows: `hover:bg-gray-50`.
- Simple toast state for download confirmation.

## Page: Change Logs
- Path: `/university/change-logs`
- Component: `src/pages/university/ChangeLogs.tsx`
- Local subcomponents: `FilterBar`, `ChangeTable`, `DiffModal`
- Data: mock fetch (replace with `/api/change-logs?universityId={id}`)
- Sort: latest first by `date`
- Styles: white card containers with `shadow-sm rounded-xl p-4`

## Page: Notifications Center
- Path: `/university/notifications-center`
- Component: `src/pages/university/NotificationsCenter.tsx`
- Local subcomponents: `NotificationTabs`, `NotificationCard`, `SearchBar`
- Data: mock list; replace with `/api/notifications?userId={repId}`
- Actions: mark single/all as read (mock), navigate to admission (placeholder)
- Styles: page bg `bg-gray-50`, container `max-w-5xl mx-auto p-6`

## Component: University AI Assistant
- Location: `src/components/ai/university/`
- Main component: `UniversityAIAssistant.tsx` (wrapper)
- Subcomponents:
  - `UniversityAIChatButton.tsx`: Floating toggle button
  - `UniversityAIChatWindow.tsx`: Chat interface with messages and input
  - `UniversityMessageBubble.tsx`: Message display component
  - `UniversityPromptChip.tsx`: Quick action button
- Integration: Added to all university pages:
  - `UniversityDashboard.tsx`
  - `ManageAdmissions.tsx`
  - `VerificationCenter.tsx`
  - `ChangeLogs.tsx`
  - `NotificationsCenter.tsx`
- State management: Local useState for open/close and messages
- Mock responses: Defined in `UniversityAIChatWindow.tsx` with university-specific queries
- Future API: POST `/api/ai/query?role=university` with `{ query, role: "university" }`
- Styling: Tailwind classes, fixed positioning, responsive max-widths


