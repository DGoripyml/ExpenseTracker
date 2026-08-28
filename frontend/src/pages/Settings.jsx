import { useState } from 'react'

import { CURRENCIES, getCurrency, setCurrency } from '../settings.js'
import { applyTheme, getTheme, otherTheme, setTheme } from '../theme.js'

export default function Settings() {
  // Read the saved values once when the page mounts.
  const [currency, setCurrencyState] = useState(getCurrency)
  const [theme, setThemeState] = useState(getTheme)

  function handleChange(event) {
    const code = event.target.value
    setCurrency(code) // save for next time
    setCurrencyState(code) // update what this page shows
  }

  function handleToggleTheme() {
    const next = otherTheme(theme)
    setTheme(next) // save for next time
    applyTheme(next) // repaint the whole app straight away
    setThemeState(next) // update this page's button label
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

        <div className="field">
          <label htmlFor="theme">Theme</label>
          {/* The label names the theme the button switches to, so it says what
              pressing it does rather than reporting the current state. */}
          <button id="theme" type="button" onClick={handleToggleTheme}>
            Switch to {otherTheme(theme)}
          </button>
        </div>
      </form>
    </div>
  )
}
