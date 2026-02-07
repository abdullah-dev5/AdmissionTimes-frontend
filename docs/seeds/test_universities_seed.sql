-- ============================================================================
-- Test Universities Seed Script
-- ============================================================================
-- 
-- Purpose: Seeds test universities for development and testing
-- These UUIDs match the frontend TEST_UNIVERSITIES constant
-- 
-- Usage:
--   psql -U your_user -d your_database -f test_universities_seed.sql
-- 
-- Note: Adjust column names to match your actual database schema
-- ============================================================================

-- Create test universities
INSERT INTO universities (
  id, 
  name, 
  country, 
  city, 
  description, 
  website, 
  created_at, 
  updated_at
)
VALUES 
  -- Stanford University
  (
    '00000000-0000-0000-0000-000000000001',
    'Stanford University',
    'USA',
    'Stanford, California',
    'Leading research university in California',
    'https://www.stanford.edu',
    NOW(),
    NOW()
  ),
  
  -- MIT
  (
    '00000000-0000-0000-0000-000000000002',
    'MIT',
    'USA',
    'Cambridge, Massachusetts',
    'Massachusetts Institute of Technology',
    'https://www.mit.edu',
    NOW(),
    NOW()
  ),
  
  -- Harvard University
  (
    '00000000-0000-0000-0000-000000000003',
    'Harvard University',
    'USA',
    'Cambridge, Massachusetts',
    'Ivy League research university',
    'https://www.harvard.edu',
    NOW(),
    NOW()
  ),
  
  -- Oxford University
  (
    '00000000-0000-0000-0000-000000000004',
    'Oxford University',
    'UK',
    'Oxford',
    'Historic university in England',
    'https://www.ox.ac.uk',
    NOW(),
    NOW()
  ),
  
  -- Cambridge University
  (
    '00000000-0000-0000-0000-000000000005',
    'Cambridge University',
    'UK',
    'Cambridge',
    'Collegiate research university',
    'https://www.cam.ac.uk',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the seed
SELECT 
  id, 
  name, 
  country, 
  city 
FROM universities 
WHERE id::text LIKE '00000000-0000-0000-0000-%'
ORDER BY name;

-- Output success message
DO $$
BEGIN
  RAISE NOTICE '✅ Test universities seeded successfully!';
  RAISE NOTICE 'Added 5 test universities with known UUIDs';
  RAISE NOTICE 'These IDs match the frontend TEST_UNIVERSITIES constant';
END $$;
