/**
 * Clears every store that holds data belonging to the signed-in user, so the
 * next account on this browser never sees the previous user's data.
 */

import { useStudentStore } from './studentStore'
import { useUniversityStore } from './universityStore'

export function resetUserScopedStores(): void {
  useStudentStore.getState().reset()
  useUniversityStore.getState().reset()
}
