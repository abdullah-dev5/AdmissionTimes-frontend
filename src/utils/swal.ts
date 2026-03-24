import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

type AlertKind = 'success' | 'error' | 'warning' | 'info'

const baseConfig = {
  confirmButtonColor: '#2563EB',
  reverseButtons: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
}

export const showAlert = async (title: string, text: string, icon: AlertKind = 'info') => {
  await Swal.fire({
    ...baseConfig,
    title,
    text,
    icon,
  })
}

export const showSuccess = async (text: string, title = 'Success') => {
  await showAlert(title, text, 'success')
}

export const showError = async (text: string, title = 'Error') => {
  await showAlert(title, text, 'error')
}

export const showInfo = async (text: string, title = 'Info') => {
  await showAlert(title, text, 'info')
}

export const showWarning = async (text: string, title = 'Warning') => {
  await showAlert(title, text, 'warning')
}

export const showConfirm = async (
  title: string,
  text: string,
  confirmText = 'Yes',
  cancelText = 'Cancel'
): Promise<boolean> => {
  const result = await Swal.fire({
    ...baseConfig,
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    cancelButtonColor: '#6B7280',
  })

  return result.isConfirmed
}
