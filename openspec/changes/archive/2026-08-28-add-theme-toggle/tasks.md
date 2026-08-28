## 1. The theme preference module

- [x] 1.1 Create `frontend/src/theme.js` exporting a `THEMES` map of the two valid theme
  names, mirroring how `settings.js` declares `CURRENCIES`; verify the file exists and
  names exactly `light` and `dark`
- [x] 1.2 Add `getTheme()` returning the saved theme, falling back to `light` when nothing
  is saved, when the saved value is unrecognised, or when reading `localStorage` throws;
  verify by calling it with no key set, with a bogus value set, and with `dark` set
- [x] 1.3 Add `setTheme(name)` that ignores names not in `THEMES` and wraps the write in
  `try`/`catch` like `setCurrency()`; verify a valid name round-trips through
  `getTheme()` and an invalid one leaves the stored value untouched
- [x] 1.4 Add `applyTheme(name)` setting `document.documentElement.dataset.theme`; verify
  the attribute appears on `<html>` when called with `dark`
- [x] 1.5 Confirm the theme storage key differs from the currency key in `settings.js`;
  verify setting a theme leaves `getCurrency()` unchanged and vice versa, satisfying the
  independence scenario in the spec

## 2. The dark palette

- [x] 2.1 Add `--accent-text: #ffffff` to the `:root` block in
  `frontend/src/styles.css`, leaving all seven existing light values exactly as they are;
  verify the light theme still renders identically to before the change
- [x] 2.2 Replace the hard-coded `#ffffff` at `styles.css:54` (`nav a.active`) and
  `styles.css:170` (`button.primary`) with `var(--accent-text)`; verify no colour literal
  remains outside the palette blocks by searching the file for `#`
- [x] 2.3 Add a `[data-theme="dark"]` block overriding all eight variables, using
  `--accent: #60a5fa` and `--accent-text: #1a1a1a` as decided in design.md; verify every
  variable named in `:root` is also named in the dark block
- [x] 2.4 Check the dark palette by eye across every surface that uses a colour variable —
  navigation, cards, tables, forms, buttons, error messages, and the empty-state text;
  verify each is legible and no element disappears into its background

## 3. Applying the theme at startup

- [x] 3.1 In `frontend/src/main.jsx`, call `applyTheme(getTheme())` after the
  `./styles.css` import and before `createRoot(...).render(...)`; verify that with `dark`
  saved, a reload shows the dark theme with no light-coloured UI visible at any point

## 4. The Settings toggle

- [x] 4.1 Add a theme toggle button to `frontend/src/pages/Settings.jsx` below the
  existing currency field, holding the active theme in `useState` seeded from
  `getTheme()`; verify the button renders alongside the currency select
- [x] 4.2 Label the button with its destination — "Switch to dark" while light is active
  and "Switch to light" while dark is active; verify the label flips after each press
- [x] 4.3 On press, call `setTheme()` and `applyTheme()` and update local state; verify the
  settings page itself repaints immediately without a reload or navigation
- [x] 4.4 Add a short explanatory line matching the tone of the existing currency note,
  saying the theme is remembered on this device only; verify it appears under the form
  — **reversed on request:** the line was added, then removed along with the pre-existing
  currency note, leaving the Settings page as the form alone. No requirement in
  `specs/settings/spec.md` depends on either note, so the spec still holds.

## 5. Verify against the spec

- [x] 5.1 Walk the three "Choose a light or dark theme" scenarios in the browser,
  including checking that the active nav item and a primary button stay legible in both
  themes; verify all three scenarios hold
- [x] 5.2 Walk the three "applies immediately" scenarios: the settings page redraws at
  once, the dashboard, expenses, and categories pages all honour the choice, and listed
  expense values are unchanged; verify all three hold
- [x] 5.3 Walk the four "persists across sessions" scenarios: reload keeps the choice, a
  cleared key gives light, a bogus stored value gives light, and the currency preference
  is unaffected; verify all four hold
- [x] 5.4 Run `npm run build` in `frontend/` and verify it completes with `theme.js`
  included in the bundle and no unresolved imports

## 6. Update the specs and close the change

- [x] 6.1 Widen the `## Purpose` section of `openspec/specs/settings/spec.md` so it covers
  display preferences generally rather than the currency symbol alone, editing the main
  spec directly because a delta cannot change Purpose; verify the new wording is at least
  50 characters and mentions both preferences
- [x] 6.2 Run `openspec validate "add-theme-toggle" --strict` and verify it reports the
  change as valid
- [x] 6.3 Confirm `git status` shows only the four intended frontend files plus the
  OpenSpec artifacts, with no database file, virtual environment, or `node_modules`
  entries; verify the working tree contains nothing unexpected
