# User Flow & Project Structure

- Date: 2025-11-11

## User Flow (University Verification Center)
1. Navigate to `/university/verification-center`.
2. Review audits in the table.
3. Filter by status and/or search by title.
4. Click View Details to see modal with comments and timestamps.
5. Click Download Log to trigger toast confirmation.

## Project Structure (Relevant)
- `src/pages/university/VerificationCenter.tsx` — page and local components
- `src/Router/router.tsx` — route mapping

## User Flow (University Change Logs)
1. Navigate to `/university/change-logs`.
2. Select date range and admission; search if needed.
3. Review logs and click View Diff for details.

## Project Structure (Relevant)
- `src/pages/university/ChangeLogs.tsx` — page and local components

## User Flow (University Notifications Center)
1. Navigate to `/university/notifications-center`.
2. Use tabs to filter by type; search if needed.
3. Mark individual or all notifications as read.
4. Click View Admission to open related admission context.

## Project Structure (Relevant)
- `src/pages/university/NotificationsCenter.tsx` — page and local components

## User Flow (University AI Assistant)
1. User sees floating chat button (bottom-right) on any university page.
2. Click button to expand chat window.
3. View initial greeting with quick prompt chips.
4. Click a prompt chip or type a question.
5. View AI response with university-specific guidance.
6. Continue conversation or close chat window.

## Project Structure (Relevant)
- `src/components/ai/university/UniversityAIAssistant.tsx` — main wrapper component
- `src/components/ai/university/UniversityAIChatButton.tsx` — floating toggle button
- `src/components/ai/university/UniversityAIChatWindow.tsx` — chat interface
- `src/components/ai/university/UniversityMessageBubble.tsx` — message display
- `src/components/ai/university/UniversityPromptChip.tsx` — quick action button
- Integrated into all university pages via `<UniversityAIAssistant />` component


