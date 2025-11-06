/**
 * Trigger credit reload across the application
 * Use this after any transaction that affects member credit
 */
export const reloadCredit = () => {
  window.dispatchEvent(new Event('reloadCredit'))
}
