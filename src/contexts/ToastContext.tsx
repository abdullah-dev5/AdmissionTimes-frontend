/**
 * Toast Context
 * 
 * Global context for managing toast notifications throughout the application.
 * Provides a centralized way to show success, error, warning, and info messages.
 * 
 * Usage:
 * ```tsx
 * const { showToast } = useToast();
 * showToast('Operation successful', 'success');
 * ```
 * 
 * @module contexts/ToastContext
 */

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import Swal from 'sweetalert2';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component
 * 
 * Wraps the application to provide toast notification functionality
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  /**
   * Show a toast notification
   */
  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      void Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: duration,
        timerProgressBar: true,
        icon: type,
        title: message,
      });
    },
    []
  );

  /**
   * Convenience methods for different toast types
   */
  const showSuccess = useCallback(
    (message: string) => showToast(message, 'success'),
    [showToast]
  );

  const showError = useCallback(
    (message: string) => showToast(message, 'error', 5000), // Errors stay longer
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => showToast(message, 'warning'),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => showToast(message, 'info'),
    [showToast]
  );

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value: ToastContextType = useMemo(() => ({
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }), [showToast, showSuccess, showError, showWarning, showInfo]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast context
 * 
 * @throws Error if used outside ToastProvider
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
