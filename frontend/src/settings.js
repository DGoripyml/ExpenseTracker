// The user's display preference, kept on this device only. Nothing here is sent
// to the server: there is no settings endpoint and no settings table.

const STORAGE_KEY = 'expense-tracker-currency'

// The supported currencies. Adding one means adding an entry here and nothing else.
export const CURRENCIES = {
  USD: { code: 'USD', label: 'USD ($)', symbol: '$' },
  INR: { code: 'INR', label: 'INR (Rs.)', symbol: 'Rs.' },
}

const DEFAULT_CURRENCY = 'USD'

/**
 * Return the saved currency code, falling back to USD when nothing is saved or
 * the saved value is not one we recognise.
 */
export function getCurrency() {
  let saved
  try {
    saved = localStorage.getItem(STORAGE_KEY)
  } catch {
    // localStorage can throw in private-browsing modes; the default is fine.
    return DEFAULT_CURRENCY
  }

  return saved in CURRENCIES ? saved : DEFAULT_CURRENCY
}

/** Save the chosen currency code for next time. */
export function setCurrency(code) {
  if (!(code in CURRENCIES)) return
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // If saving fails the app still works, it just will not remember the choice.
  }
}

/**
 * Format an amount for display using the chosen currency symbol.
 *
 * This only changes the symbol. The number is never converted between
 * currencies, so 42.5 shows as "$42.50" or "Rs.42.50" with the same value.
 */
export function formatMoney(amount) {
  const { symbol } = CURRENCIES[getCurrency()]
  return `${symbol}${Number(amount).toFixed(2)}`
}
