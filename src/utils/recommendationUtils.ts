import type { StudentAdmission } from '../data/studentData'
import type { Recommendation } from '../services/recommendationsService'
import { transformAdmission } from './transformers'

export const RECOMMENDATION_MIN_SCORE = 50
export const RECOMMENDATION_COUNT_LIMIT = 5
export const RECOMMENDATION_RENDER_LIMIT = 4

export function mapRecommendationsToAdmissions(
  recommendations: Recommendation[],
  admissionsById: Map<string, StudentAdmission>
): StudentAdmission[] {
  return recommendations.map((recommendation): StudentAdmission => {
      const base = admissionsById.get(recommendation.admission_id)
      if (base) {
        return {
          ...base,
          matchNumeric: recommendation.score,
          aiSummary: recommendation.reason || base.aiSummary,
        }
      }

      const admissionPayload = recommendation.admission
      const fallbackAdmission = transformAdmission({
        id: admissionPayload?.id || recommendation.admission_id,
        university_id: admissionPayload?.university_id || null,
        title: admissionPayload?.program_name || 'Recommended Program',
        degree_level: admissionPayload?.degree_level || null,
        deadline: admissionPayload?.deadline || null,
        application_fee: null,
        location: admissionPayload?.university_city
          ? [admissionPayload.university_city, admissionPayload.university_country].filter(Boolean).join(', ')
          : null,
        description: recommendation.reason || null,
        verification_status: admissionPayload?.verification_status || admissionPayload?.status || 'verified',
        university_name: admissionPayload?.university_name || undefined,
        university_city: admissionPayload?.university_city || undefined,
        university_country: admissionPayload?.university_country || undefined,
        university_logo_url: admissionPayload?.university_logo_url || undefined,
        created_at: recommendation.generated_at,
        updated_at: recommendation.generated_at,
        match_score: recommendation.score,
        match_reason: recommendation.reason,
      } as unknown as Parameters<typeof transformAdmission>[0])

      return {
        ...fallbackAdmission,
        id: recommendation.admission_id,
        matchNumeric: recommendation.score,
        aiSummary: recommendation.reason || fallbackAdmission.aiSummary,
      }
    })
}

export function filterEligibleRecommendations(admissions: StudentAdmission[]): StudentAdmission[] {
  return admissions
    .filter((a) => (a.matchNumeric || 0) >= RECOMMENDATION_MIN_SCORE && a.daysRemaining >= 0)
    .sort((a, b) => (b.matchNumeric || 0) - (a.matchNumeric || 0))
}
