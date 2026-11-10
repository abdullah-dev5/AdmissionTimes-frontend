/**
 * Change log API (GET /changelogs).
 *
 * The backend scopes results by role: admins see everything, university
 * representatives only their own university's admissions.
 */

import apiClient from './apiClient'
import type { PaginatedResponse } from '../types/api'

export interface ApiChangeLogEntry {
  id: string
  admission_id: string
  admission_title?: string | null
  program_title?: string | null
  changed_by?: string | null
  modified_by?: string | null
  actor_type?: string | null
  action_type?: string | null
  field_name?: string | null
  old_value?: unknown
  new_value?: unknown
  diff_summary?: string | null
  changed_at_iso?: string | null
  created_at?: string
  metadata?: Record<string, unknown> | null
}

export interface ChangeLogQuery {
  admission_id?: string
  changed_by?: string
  actor_type?: string
  date_from?: string
  date_to?: string
  search?: string
}

/** GET /changelogs/summary: counts over everything the viewer may see. */
export interface ChangeLogSummary {
  total: number
  by_actor: { admin: number; university: number; system: number }
  reviews: number
  today: number
  last_7_days: number
}

export const changelogsService = {
  list: async (page = 1, limit = 100, filters: ChangeLogQuery = {}): Promise<PaginatedResponse<ApiChangeLogEntry>> => {
    const response = await apiClient.get('/changelogs', { params: { page, limit, ...filters } })
    return response.data
  },

  summary: async (): Promise<ChangeLogSummary> => {
    const response = await apiClient.get('/changelogs/summary')
    return response.data.data
  },
}
