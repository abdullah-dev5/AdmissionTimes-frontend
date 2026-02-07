# Admission Schema Comparison Report

Date: February 7, 2026

## Scope and Sources

This report compares the schema shown in the provided ERD diagrams against the schema currently represented in code and documentation.

Sources used:
- Frontend API contract types: [src/types/api.ts](src/types/api.ts)
- Backend notes on user/university linkage: [docs/UNIVERSITY_ID_MECHANISM.md](../admission-times-backend/docs/UNIVERSITY_ID_MECHANISM.md)
- Backend implementation plan (schema drafts): [context-todos/BACKEND_IMPLEMENTATION_PLAN.md](context-todos/BACKEND_IMPLEMENTATION_PLAN.md)
- Attached ERD diagrams (two versions) provided by user
- Supabase schema listing (information_schema.columns) provided by user

## Diagram Tables (from ERD)

The diagrams show these tables:
- universities
- users
- admissions
- watchlists
- alerts_notifications
- recommendations
- analytics_events
- change_logs
- verification_logs
- scraper_logs

## Current Schema in Code (API Contract)

Tables/interfaces currently represented in code:
- admissions: [src/types/api.ts](src/types/api.ts)
- universities: [src/types/api.ts](src/types/api.ts)
- users: [src/types/api.ts](src/types/api.ts)
- notifications: [src/types/api.ts](src/types/api.ts)
- watchlists: [src/types/api.ts](src/types/api.ts)
- deadlines: [src/types/api.ts](src/types/api.ts)
- change_logs: [src/types/api.ts](src/types/api.ts)
- activity (events): [src/types/api.ts](src/types/api.ts)

## Current Schema in Supabase (Confirmed)

Tables present in Supabase:
- admissions
- analytics_events
- changelogs
- deadlines
- notifications
- recommendations
- users
- watchlists
- user_activity
- user_preferences
- schema_migrations
- seed_tracking

## Missing Tables (Diagram -> Supabase)

These tables exist in the diagrams but are NOT present in Supabase:
- universities
- alerts_notifications
- verification_logs
- scraper_logs

Note: A migration was added to create universities table in backend:
- [supabase/migrations/20260207000001_create_universities_table.sql](../admission-times-backend/supabase/migrations/20260207000001_create_universities_table.sql)

These tables exist in Supabase but are NOT present in the diagrams:
- deadlines
- user_activity
- user_preferences
- schema_migrations
- seed_tracking

## Naming and Merge Notes

- alerts_notifications (diagram) is the same purpose as notifications (Supabase). The diagram splits alert-specific fields that are represented in Supabase as category, priority, related_entity_type/id, and action_url.
- analytics_events (diagram) aligns to analytics_events (Supabase), but the field naming differs (diagram uses event_id, meta_json, device_info; Supabase uses id, metadata, and no device_info field).
- change_logs (diagram) aligns to changelogs (Supabase). Diagram uses diff_json; Supabase uses field_name, old_value/new_value, diff_summary, and metadata.

## Admission Fields: Diagram vs Current

Diagram admissions fields (combined view):
- admission_id, university_id, uploaded_by, verified_by, updated_by
- title, program, degree, academic_year
- fee, deadline, status
- ai_summary, summary, metadata
- source_url, source_timestamp
- change_reason, verified_at
- created_at, updated_at

Current admissions fields (API contract):
- id, university_id, created_by
- title
- program_type, degree_level, field_of_study
- duration, delivery_mode, location
- application_fee, tuition_fee, currency
- deadline, start_date
- description, requirements
- website_url, admission_portal_link
- verification_status, verified_at, verified_by
- rejection_reason, dispute_reason
- created_at, updated_at, is_active

Key differences:
- program vs program_type
- degree vs degree_level
- academic_year exists in diagram only (not in API contract)
- fee vs application_fee and tuition_fee (split in API contract)
- status exists in diagram only (API uses verification_status + is_active)
- ai_summary and summary exist in diagram only
- metadata exists in diagram only
- source_url and source_timestamp exist in diagram only
- change_reason exists in diagram only
- created_by exists in API contract only
- requirements exists in API contract only
- delivery_mode, duration, location exist in API contract only
- website_url and admission_portal_link exist in API contract only

## Users Fields: Diagram vs Current

Diagram users fields:
- user_id, name, email, password_hash
- role, university_id
- metadata, created_at

Current users fields (API contract):
- id, email
- role (and optional user_type)
- university_id
- created_at, updated_at

Current users fields (Supabase):
- id, auth_user_id, role, display_name, organization_id, status
- email, password
- created_at, updated_at

Key differences:
- name in diagram maps to display_name in Supabase
- password_hash in diagram maps to password in Supabase (if used)
- metadata exists in diagram only
- updated_at exists in API contract and Supabase (diagram shows created_at only)
- role naming matches, but user_id vs id differs

## Universities Fields: Diagram vs Current

Diagram universities fields:
- university_id, name, city, website, description, logo
- created_at, updated_at

Current universities fields (API contract):
- id, name, city, country, website, logo_url
- created_at, updated_at

Key differences:
- description exists in diagram only
- country exists in API contract only
- logo vs logo_url naming difference
- university_id vs id naming difference

## Watchlists Fields: Diagram vs Current

Diagram watchlists fields:
- watchlist_id, user_id, admission_id, notes, saved_at

Current watchlists fields (API contract):
- id, user_id, admission_id, saved_at, alert_opt_in, notes

Current watchlists fields (Supabase):
- id, user_id, admission_id, notes
- created_at, updated_at
- alert_opt_in

Key differences:
- alert_opt_in exists in API contract only
- watchlist_id vs id naming difference
- saved_at in API contract maps to created_at in Supabase

## Notifications Fields: Diagram vs Current

Diagram alerts_notifications fields:
- alert_id, user_id, admission_id
- type, trigger_type, trigger_time
- delivery_status, message, is_read
- created_at, executed_at

Current notifications fields (API contract):
- id, user_id, user_type
- category, priority, title, message
- related_entity_type, related_entity_id
- is_read, read_at, action_url
- created_at

Current notifications fields (Supabase):
- id, user_id, user_type
- category, priority, title, message
- related_entity_type, related_entity_id
- is_read, read_at, action_url
- created_at

Key differences:
- trigger_type, trigger_time, delivery_status, executed_at exist in diagram only
- category, priority, title, related_entity_type/id, read_at, action_url exist in API contract only
- alerts_notifications vs notifications naming

## Change Logs Fields: Diagram vs Current

Diagram change_logs fields:
- changelog_id, admission_id, modified_by
- diff_json, created_at

Current change_logs fields (API contract):
- id, admission_id, changed_by
- change_type, field_name, old_value, new_value, created_at

Key differences:
- diff_json exists in diagram only
- change_type and field-level columns exist in API contract only
- modified_by vs changed_by naming difference

## Recommendations, Analytics, Verification Logs

Diagram tables with no current API contract:
- recommendations (recommendation_id, user_id, admission_id, score, method, metadata, created_at, expires_at)
- analytics_events (event_id, user_id, admission_id, event_type, meta_json, device_info, created_at, session_id)
- verification_logs (verification_id, admission_id, verified_by, action, similarity_score, comment, created_at)
- scraper_logs (scraper_id, university_id, source_name, source_url, config_json, status, log_json, last_run_at, created_at)

Supabase status:
- recommendations: PRESENT in Supabase (fields differ from diagram)
- analytics_events: PRESENT in Supabase (fields differ from diagram)
- verification_logs: MISSING in Supabase
- scraper_logs: MISSING in Supabase

Closest existing type is Activity in the API contract, but it is not equivalent to analytics_events.

## Field Name Mapping Suggestions

Admission fields:
- program -> program_type
- degree -> degree_level
- academic_year -> academic_year (add to API/DB if desired)
- fee -> application_fee or tuition_fee
- status -> verification_status + is_active
- ai_summary/summary -> description or add ai_summary column
- metadata -> metadata (add column) or map into requirements
- source_url -> source_url (add column)
- source_timestamp -> source_timestamp (add column)
- change_reason -> change_reason (add column)

User fields:
- user_id -> id
- name -> display_name or add name column
- password_hash -> managed by auth provider (do not expose in API)

University fields:
- university_id -> id
- logo -> logo_url

## Recommendation

If the ERD is the intended final schema, the API contract and backend schema need to be extended to include the missing tables and fields listed above. If the API contract is the source of truth, update the diagrams to match the current contracts and remove fields like ai_summary, metadata, source_url, and change_reason.
