/**
 * Toast Notification Component
 * 
 * Displays temporary notification messages (success, error, warning, info).
 * Supports auto-dismiss and manual dismiss functionality.
 * 
 * Usage:
 * ```tsx
 * <Toast
 *   message="Operation successful"
 *   type="success"
 *   isVisible={true}
 *   onDismiss={() => setVisible(false)}
 * />
 * ```
 * 
 * @module components/common/Toast
 */

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number; // Auto-dismiss duration in milliseconds (default: 3000)
}

/**
 * Toast Notification Component
 * 
 * Displays a temporary notification message with auto-dismiss functionality
 */
export function Toast({
  message,
  type = 'info',
  isVisible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) return null;

  // Type-specific styling
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✓',
      iconBg: 'bg-green-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✕',
      iconBg: 'bg-red-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠',
      iconBg: 'bg-yellow-100',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ',
      iconBg: 'bg-blue-100',
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in`}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-6 h-6 ${styles.iconBg} rounded-full flex items-center justify-center ${styles.text} text-sm font-bold`}>
        {styles.icon}
      </div>

      {/* Message */}
      <div className="flex-1">
        <p className={`${styles.text} text-sm font-medium`}>{message}</p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className={`flex-shrink-0 ${styles.text} hover:opacity-70 transition-opacity`}
        aria-label="Dismiss notification"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast Container Component
 * 
 * Manages multiple toast notifications
 */
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
  }>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onDismiss={() => onDismiss(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}
