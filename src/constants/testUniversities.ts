/**
 * Test Universities for Development/Testing
 * 
 * These are pre-seeded universities with known IDs for testing purposes.
 * In production, universities would be created by admins and
 * representatives would receive their university_id via admin invitation.
 * 
 * @module constants/testUniversities
 */

export interface TestUniversity {
  id: string;
  name: string;
  country: string;
  description: string;
}

/**
 * Test universities for development
 * These IDs should match the seeded data in your backend database
 */
export const TEST_UNIVERSITIES: TestUniversity[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Stanford University',
    country: 'USA',
    description: 'Leading research university in California',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'MIT',
    country: 'USA',
    description: 'Massachusetts Institute of Technology',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Harvard University',
    country: 'USA',
    description: 'Ivy League research university',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Oxford University',
    country: 'UK',
    description: 'Historic university in England',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Cambridge University',
    country: 'UK',
    description: 'Collegiate research university',
  },
];

/**
 * Check if we're in development mode
 */
export const isDevelopmentMode = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Get a university by ID
 */
export const getUniversityById = (id: string): TestUniversity | undefined => {
  return TEST_UNIVERSITIES.find(uni => uni.id === id);
};

/**
 * Get university name by ID
 */
export const getUniversityName = (id: string): string => {
  const university = getUniversityById(id);
  return university?.name || 'Unknown University';
};
