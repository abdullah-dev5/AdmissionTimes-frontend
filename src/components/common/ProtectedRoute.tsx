/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication.
 * Redirects to sign in page if user is not authenticated.
 * 
 * @module components/common/ProtectedRoute
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'university' | 'admin';
}

/**
 * Protected Route Component
 * 
 * Protects routes that require authentication.
 * Optionally checks for specific user role.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Checking authentication..." />
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && user?.user_type !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user?.user_type === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user?.user_type === 'university') {
      return <Navigate to="/university/dashboard" replace />;
    } else if (user?.user_type === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
