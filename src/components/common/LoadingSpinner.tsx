/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner component for displaying loading states.
 * Supports different sizes and can be used inline or as a full-page overlay.
 * 
 * Usage:
 * ```tsx
 * <LoadingSpinner size="lg" />
 * <LoadingSpinner fullScreen />
 * ```
 * 
 * @module components/common/LoadingSpinner
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

/**
 * Loading Spinner Component
 * 
 * Displays a spinning loading indicator
 */
export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
