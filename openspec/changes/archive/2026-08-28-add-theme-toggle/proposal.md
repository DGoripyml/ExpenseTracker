## Why

The application ships with a single light colour scheme, which is uncomfortable to
read in a dark room and is the one display preference users most commonly expect to
control. Settings already exists as the home for device-local display preferences, and
the stylesheet was deliberately built with its colours declared once as CSS custom
properties, so adding a theme now is a small, contained change rather than a
restructuring.

## What Changes

- Add a theme toggle to the Settings page, so a user can switch between a light and a
  dark colour scheme.
- The toggle is a button labelled with the theme it will switch *to* (for example
  "Switch to dark" while light is active), so the control states what pressing it does.
- Switching the theme repaints the whole application immediately, without navigating
  away and back.
- The chosen theme is remembered on the device and is still in effect after a reload.
- A first-time visitor with no saved preference starts in the light theme.
- Define a dark palette alongside the existing light one. The accent blue is lightened
  for the dark theme so it stays legible, which introduces one new colour variable for
  text drawn on top of the accent.
- No change to the backend, the database, or any API. The theme is a device preference,
  exactly like the existing currency preference.

## Capabilities

### New Capabilities

None. This change adds requirements to an existing capability.

### Modified Capabilities

- `settings`: gains requirements for choosing a light or dark theme, for that choice
  taking effect immediately across the application, and for it persisting on the device
  between sessions. The three existing currency requirements are unchanged.

## Impact

- `frontend/src/theme.js` (new): reads, saves, and applies the theme preference.
- `frontend/src/styles.css`: adds a dark palette and one variable for text on the
  accent colour; replaces the two remaining hard-coded colour literals.
- `frontend/src/main.jsx`: applies the saved theme before the application renders.
- `frontend/src/pages/Settings.jsx`: adds the toggle button.
- `openspec/specs/settings/spec.md`: its `## Purpose` currently describes the currency
  symbol only and no longer covers the capability; it needs widening. Purpose is edited
  directly in the main spec rather than through a delta.

Not affected: the backend, the SQLite schema, the HTTP API, and the currency
preference, which continues to behave exactly as it does today.

### Non-goals

- No detection of the operating system's dark-mode setting. The default is always light
  so there is a single predictable starting state.
- The theme is not stored on the server and is not shared between devices or browsers,
  matching how the currency preference already works.
- No per-page or per-component theming, and no third theme or "auto" option.
- No documentation restructuring. Writing `docs/` is deliberately left to a separate
  change so that it can describe the codebase after this one has settled.
