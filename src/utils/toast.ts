import baseToast from 'react-hot-toast'

// Extend toast with info method
const toast = baseToast as typeof baseToast & {
  info: (message: string, options?: any) => string
}

// Add info method if it doesn't exist
if (!(toast as any).info) {
  (toast as any).info = (message: string, options?: any) => {
    return baseToast(message, {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
      ...options,
    })
  }
}

export default toast
