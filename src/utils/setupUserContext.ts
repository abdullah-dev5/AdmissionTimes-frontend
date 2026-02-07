/**
 * User Context Setup Utility
 * 
 * Sets up user context in localStorage for API authentication.
 * This is used for development/testing with mock authentication.
 * 
 * @module utils/setupUserContext
 */

/**
 * Setup user context for API authentication
 * 
 * @param userType - Type of user: 'student' | 'university' | 'admin'
 * @param userId - Optional user ID (if not provided, uses test user IDs)
 */
export function setupUserContext(userType: 'student' | 'university' | 'admin', userId?: string) {
  // Test user IDs matching backend test script
  const testUsers = {
    student: {
      id: '7998b0fe-9d05-44e4-94ab-e65e0213bf10',
      role: 'student',
    },
    university: {
      id: '412c9cd6-78db-46c1-84e1-c059a20d11bf',
      role: 'university',
      universityId: '412c9cd6-78db-46c1-84e1-c059a20d11bf',
    },
    admin: {
      id: 'e61690b2-0a64-47de-9274-66e06d1437b7',
      role: 'admin',
    },
  };

  const user = userId 
    ? { id: userId, role: userType, ...(userType === 'university' ? { universityId: userId } : {}) }
    : testUsers[userType];

  const userId_str = (user as any).id as string;
  const userRole_str = (user as any).role as string;
  const universityId_str = (user as any).universityId as string | undefined;

  localStorage.setItem('userId', userId_str);
  localStorage.setItem('userRole', userRole_str);
  
  if (userType === 'university' && universityId_str) {
    localStorage.setItem('universityId', universityId_str);
  } else {
    localStorage.removeItem('universityId');
  }

  console.log(`✅ User context set: ${userType} (${userId_str})`);
}

/**
 * Clear user context
 */
export function clearUserContext() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('universityId');
  console.log('✅ User context cleared');
}

/**
 * Get current user context
 */
export function getUserContext(): {
  userId: string | null;
  userRole: string | null;
  universityId: string | null;
} {
  return {
    userId: localStorage.getItem('userId'),
    userRole: localStorage.getItem('userRole'),
    universityId: localStorage.getItem('universityId'),
  };
}
