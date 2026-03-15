/**
 * Supabase Client Configuration
 * 
 * This module initializes and exports the Supabase client for authentication
 * and real-time database functionality.
 * 
 * Features:
 * - JWT token management
 * - Session persistence
 * - Real-time subscriptions
 * - Auth state change listeners
 * 
 * @module services/supabase
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Get Supabase configuration from environment variables
 */
const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Validate configuration
  if (!url || !key) {
    console.error('❌ Missing Supabase Configuration');
    console.error('   VITE_SUPABASE_URL:', url ? '✅' : '❌ NOT SET');
    console.error('   VITE_SUPABASE_ANON_KEY:', key ? '✅' : '❌ NOT SET');
    console.error('   Please check your .env file');
  }

  return { url: url || '', key: key || '' };
};

const { url, key } = getSupabaseConfig();

/**
 * Frontend realtime feature flag.
 *
 * Keep disabled by default in local development where websocket access may be blocked,
 * while polling continues to provide notification refresh.
 */
export const isRealtimeEnabled = import.meta.env.VITE_ENABLE_REALTIME === 'true';

/**
 * Supabase client instance
 * 
 * This client is used for:
 * - User authentication (sign in, sign up, sign out)
 * - Session management
 * - JWT token refresh
 * - Real-time subscriptions
 * 
 * @example
 * // Get current session
 * const { data: { session } } = await supabase.auth.getSession();
 * 
 * // Get access token for API requests
 * const token = session?.access_token;
 * 
 * // Listen for auth changes
 * supabase.auth.onAuthStateChange((event, session) => {
 *   console.log('Auth state changed:', event);
 * });
 */
export const supabase: SupabaseClient = createClient(url, key, {
  auth: {
    /**
     * Use persistent session storage (localStorage)
     * This keeps users logged in across page reloads
     */
    persistSession: true,
    
    /**
     * Automatically refresh token when expired
     */
    autoRefreshToken: true,
    
    /**
     * Session timeout (in seconds)
     */
    detectSessionInUrl: true,
  },
});

/**
 * Get current session with JWT token
 * 
 * @returns Promise with session data and access token
 * 
 * @example
 * const { session, error } = await getSession();
 * if (session) {
 *   console.log('User is logged in');
 *   console.log('Access token:', session.access_token);
 * }
 */
export const getSession = async () => {
  return await supabase.auth.getSession();
};

/**
 * Get current access token
 * 
 * This token should be attached to all API requests in the Authorization header
 * Format: Authorization: Bearer <token>
 * 
 * @returns Promise with access token or null if not authenticated
 * 
 * @example
 * const token = await getAccessToken();
 * if (token) {
 *   headers.Authorization = `Bearer ${token}`;
 * }
 */
export const getAccessToken = async (): Promise<string | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Failed to get session:', error);
    return null;
  }

  return session?.access_token || null;
};

/**
 * Get current authenticated user
 * 
 * @returns Promise with user object or null if not authenticated
 * 
 * @example
 * const user = await getAuthUser();
 * if (user) {
 *   console.log('User ID:', user.id);
 *   console.log('Email:', user.email);
 * }
 */
export const getAuthUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Failed to get user:', error);
    return null;
  }

  return session?.user || null;
};

/**
 * Sign out and clear session
 * 
 * @returns Promise with result of sign out operation
 * 
 * @example
 * await signOutUser();
 * // Session is now cleared, user is logged out
 */
export const signOutUser = async () => {
  return await supabase.auth.signOut();
};

/**
 * Listen for authentication state changes
 * 
 * This should be called in a useEffect hook to listen for login/logout events
 * 
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function to stop listening
 * 
 * @example
 * useEffect(() => {
 *   const { data: { subscription } } = supabase.auth.onAuthStateChange(
 *     (event, session) => {
 *       console.log('Auth event:', event);
 *       setUser(session?.user || null);
 *     }
 *   );
 * 
 *   return () => subscription?.unsubscribe();
 * }, []);
 */
export const onAuthStateChange = (callback: any) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Refresh the current JWT token
 * 
 * This is useful when the token is about to expire
 * Usually handled automatically by the API client interceptor
 * 
 * @returns Promise with new session and token
 * 
 * @example
 * const { data: { session }, error } = await supabase.auth.refreshSession();
 * if (session) {
 *   console.log('New token:', session.access_token);
 * }
 */
export const refreshToken = async () => {
  return await supabase.auth.refreshSession();
};

export default supabase;
