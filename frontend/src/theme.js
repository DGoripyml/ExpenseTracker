// The user's colour theme, kept on this device only. Like the currency preference in
// settings.js, nothing here is sent to the server.
//
// The theme is applied by setting one attribute on the <html> element. Every colour in
// styles.css is a custom property, so that single write re-resolves all of them and the
// whole page repaints at once — no React re-render involved.

const STORAGE_KEY = 'expense-tracker-theme'

// The supported themes. Adding one means adding an entry here and a matching block in
// styles.css, and nothing else.
export const THEMES = {
  light: { name: 'light', label: 'Light' },
  dark: { name: 'dark', label: 'Dark' },
}

const DEFAULT_THEME = 'light'

/**
 * Return the saved theme name, falling back to light when nothing is saved or the saved
 * value is not one we recognise. The operating system's own preference is deliberately
 * not consulted, so there is a single predictable starting state.
 */
export function getTheme() {
  let saved
  try {
    saved = localStorage.getItem(STORAGE_KEY)
  } catch {
    // localStorage can throw in private-browsing modes; the default is fine.
    return DEFAULT_THEME
  }

  return saved in THEMES ? saved : DEFAULT_THEME
}

/** Save the chosen theme name for next time. */
export function setTheme(name) {
  if (!(name in THEMES)) return
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
    // If saving fails the app still works, it just will not remember the choice.
  }
}

/**
 * Put the theme into effect by tagging the root element. styles.css declares the light
 * palette on :root and overrides it under [data-theme="dark"], so the cascade does the
 * repainting for us.
 */
export function applyTheme(name) {
  const theme = name in THEMES ? name : DEFAULT_THEME
  document.documentElement.dataset.theme = theme
}

/** The other theme, used to label a control with the effect of pressing it. */
export function otherTheme(name) {
  return name === 'dark' ? 'light' : 'dark'
}
