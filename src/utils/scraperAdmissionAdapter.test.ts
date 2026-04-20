import { describe, expect, it } from 'vitest'
import {
  extractScraperFee,
  extractScraperOfficialUrl,
  flattenProgramAdmissions,
  getScraperFallbackLocation,
  inferScraperDegreeLabelFromTitle,
  resolveScraperAdmissionLocation,
  shouldHideGenericScraperAnnouncement,
} from './scraperAdmissionAdapter'

describe('scraperAdmissionAdapter', () => {
  it('flattens object program collection into stable child admissions', () => {
    const rows: Array<Record<string, any>> = [
      {
        id: 'parent-1',
        data_origin: 'scraper',
        title: 'Admissions Open 2026',
        programs: [
          { id: 'child-1', program_name: 'BS Computer Science' },
          { program_title: 'BBA' },
        ],
      },
    ]

    const flattened = flattenProgramAdmissions(rows)

    expect(flattened).toHaveLength(2)
    expect(flattened[0].id).toBe('child-1')
    expect(flattened[0].title).toBe('BS Computer Science')
    expect(flattened[0].source_admission_id).toBe('parent-1')
    expect(flattened[1].id).toBe('parent-1::program::2')
    expect(flattened[1].program_title).toBe('BBA')
    expect(flattened[1].parent_admission_id).toBe('parent-1')
  })

  it('expands comma-delimited requirements.programs_offered values', () => {
    const rows: Array<Record<string, any>> = [
      {
        id: 'parent-2',
        title: 'Engineering Admissions',
        requirements: {
          programs_offered: 'BSCS, BSSE, BSAI',
        },
      },
    ]

    const flattened = flattenProgramAdmissions(rows)

    expect(flattened).toHaveLength(3)
    expect(flattened.map((item) => item.title)).toEqual(['BSCS', 'BSSE', 'BSAI'])
  })

  it('hides generic scraper announcements only when program count indicates parent rows', () => {
    const genericParent = {
      data_origin: 'scraper',
      title: 'Undergraduate Admissions 2026',
      requirements: { programs_offered_count: 10 },
    }
    const normalProgram = {
      data_origin: 'scraper',
      title: 'BS Computer Science',
      requirements: { programs_offered_count: 1 },
    }
    const manualRow = {
      data_origin: 'manual',
      title: 'Admissions Open',
      requirements: { programs_offered_count: 9 },
    }

    expect(shouldHideGenericScraperAnnouncement(genericParent)).toBe(true)
    expect(shouldHideGenericScraperAnnouncement(normalProgram)).toBe(false)
    expect(shouldHideGenericScraperAnnouncement(manualRow)).toBe(false)
  })

  it('infers degree label for scraper titles', () => {
    expect(inferScraperDegreeLabelFromTitle('BS Computer Science')).toBe('BS')
    expect(inferScraperDegreeLabelFromTitle('Master of Science in Data Science')).toBe('MS')
    expect(inferScraperDegreeLabelFromTitle('Undergraduate Admissions 2026')).toBe('BS')
    expect(inferScraperDegreeLabelFromTitle('Graduate Admissions 2026')).toBe('MS')
    expect(inferScraperDegreeLabelFromTitle('Postgraduate Admissions 2026')).toBe('MS')
    expect(inferScraperDegreeLabelFromTitle('Doctor of Philosophy in Physics')).toBe('PhD')
    expect(inferScraperDegreeLabelFromTitle('')).toBeNull()
  })

  it('builds fallback location from university city and country', () => {
    expect(getScraperFallbackLocation({ university_city: 'Karachi', university_country: 'Pakistan' })).toBe('Karachi, Pakistan')
    expect(getScraperFallbackLocation({ university_city: 'Lahore' })).toBe('Lahore')
    expect(getScraperFallbackLocation({ university_country: '' })).toBeNull()
  })

  it('extracts scraper website url from source fields', () => {
    const url = extractScraperOfficialUrl({
      source_url: 'https://uni.edu/admissions',
      requirements: {},
    })

    expect(url).toBe('https://uni.edu/admissions')
  })

  it('extracts scraper fee from textual payload', () => {
    const parsed = extractScraperFee({
      title: 'BSCS Admissions',
      description: 'Application fee: PKR 2500 for all candidates',
      requirements: {},
    })

    expect(parsed.feeNumeric).toBe(2500)
    expect(parsed.feeDisplay).toContain('2,500')
  })

  it('resolves scraper location from scraper-specific fields before generic text', () => {
    const location = resolveScraperAdmissionLocation({
      location: 'Admissions Open 2026',
      requirements: {
        campus: 'Main Campus, Islamabad',
      },
      university_city: 'Islamabad',
      university_country: 'Pakistan',
    })

    expect(location).toBe('Main Campus, Islamabad')
  })

  it('does not fallback scraper location to mapped university city when source location is missing', () => {
    const location = resolveScraperAdmissionLocation({
      location: 'Admissions Open 2026',
      university_city: 'Sukkur',
      university_country: 'Pakistan',
      requirements: {},
    })

    expect(location).toBeNull()
  })

  it('applies scraper university fallback for requested institutions', () => {
    expect(resolveScraperAdmissionLocation({ university_name: 'GIKI', requirements: {} })).toBe('Topi, KPK, Pakistan')
    expect(resolveScraperAdmissionLocation({ university_name: 'Mohammad Ali Jinnah University', requirements: {} })).toBe('Karachi, Sindh, Pakistan')
    expect(resolveScraperAdmissionLocation({ university_name: 'National University of Technology (NUTECH)', requirements: {} })).toBe('Islamabad, Pakistan')
    expect(resolveScraperAdmissionLocation({ university_name: 'FAST-NUCES', requirements: {} })).toBe('Islamabad (Main Campus), Multiple campuses in Pakistan')
    expect(resolveScraperAdmissionLocation({ university_name: 'IBA Karachi', requirements: {} })).toBe('Karachi, Sindh, Pakistan')
    expect(resolveScraperAdmissionLocation({ university_name: 'IBA Sukkur', requirements: {} })).toBe('Sukkur, Sindh, Pakistan')
  })

  it('infers BBA correctly from full program title', () => {
    expect(inferScraperDegreeLabelFromTitle('Bachelor of Business Administration')).toBe('BBA')
  })
})
