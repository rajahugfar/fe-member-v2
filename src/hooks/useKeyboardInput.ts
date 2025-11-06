import { useEffect, useCallback, useRef } from 'react'

/**
 * Keyboard Input Hook Options
 */
export interface UseKeyboardInputOptions {
  enabled: boolean
  maxLength: number
  onComplete: (value: string) => void
  currentValue: string
  setValue: (value: string) => void
}

/**
 * Custom Hook for Physical Keyboard Input
 * รองรับการกดคีย์บอร์ดจริงสำหรับใส่เลข
 */
export function useKeyboardInput({
  enabled,
  maxLength,
  onComplete,
  currentValue,
  setValue
}: UseKeyboardInputOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  /**
   * Handle keyboard key press
   */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Ignore if typing in input field
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }

    // Get the pressed key
    let key: string | null = null

    // Handle number keys (0-9)
    if (event.key >= '0' && event.key <= '9') {
      key = event.key
    }
    // Handle numpad keys
    else if (event.code >= 'Numpad0' && event.code <= 'Numpad9') {
      key = event.code.replace('Numpad', '')
    }
    // Handle backspace
    else if (event.key === 'Backspace') {
      event.preventDefault()
      if (currentValue.length > 0) {
        setValue(currentValue.slice(0, -1))
      }
      return
    }
    // Handle escape (clear)
    else if (event.key === 'Escape') {
      event.preventDefault()
      setValue('')
      return
    }
    // Handle enter (submit)
    else if (event.key === 'Enter') {
      event.preventDefault()
      if (currentValue.length === maxLength) {
        onComplete(currentValue)
        setValue('')
      }
      return
    }

    // Add number to current value
    if (key !== null && currentValue.length < maxLength) {
      event.preventDefault()
      const newValue = currentValue + key

      setValue(newValue)

      // Auto-submit when length is reached
      if (newValue.length === maxLength) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Add small delay for visual feedback
        timeoutRef.current = setTimeout(() => {
          onComplete(newValue)
          setValue('')
        }, 100)
      }
    }
  }, [enabled, maxLength, currentValue, setValue, onComplete])

  /**
   * Register keyboard event listener
   */
  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, handleKeyPress])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
}

/**
 * Keyboard Input Helper Functions
 */

/**
 * Check if key is a number
 */
export function isNumberKey(event: KeyboardEvent): boolean {
  return (
    (event.key >= '0' && event.key <= '9') ||
    (event.code >= 'Numpad0' && event.code <= 'Numpad9')
  )
}

/**
 * Get number from keyboard event
 */
export function getNumberFromKey(event: KeyboardEvent): string | null {
  if (event.key >= '0' && event.key <= '9') {
    return event.key
  }
  if (event.code >= 'Numpad0' && event.code <= 'Numpad9') {
    return event.code.replace('Numpad', '')
  }
  return null
}

/**
 * Check if event should be handled (not in input)
 */
export function shouldHandleKeyEvent(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement
  return target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA'
}
