import { useState } from 'react'

import { CURRENCIES, getCurrency, setCurrency } from '../settings.js'

export default function Settings() {
  // Read the saved value once when the page mounts.
  const [currency, setCurrencyState] = useState(getCurrency)

  function handleChange(event) {
    const code = event.target.value
    setCurrency(code) // save for next time
    setCurrencyState(code) // update what this page shows
  }

  return (
    <div>
      <h1>Settings</h1>

      <form onSubmit={(event) => event.preventDefault()}>
        <div className="field">
          <label htmlFor="currency">Currency symbol</label>
          <select id="currency" value={currency} onChange={handleChange}>
            {Object.values(CURRENCIES).map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      <p className="empty">
        Changing the currency swaps the symbol shown next to amounts. It does not
        convert values, and nothing stored is changed.
      </p>
    </div>
  )
}
