## Context

See proposal.md — Why. The requirements are in `specs/settings/spec.md`.

Three properties of the existing frontend shape this design:

1. **All colour is already centralised.** `frontend/src/styles.css` declares seven
   colour custom properties on `:root` and then refers to them through 27 `var()`
   references. Only two hard-coded colour literals remain, both `#ffffff` for text drawn
   on the accent colour (the active nav item and primary buttons).
2. **There is an established preference pattern.** `frontend/src/settings.js` stores the
   currency choice under a single `localStorage` key, guards every access with
   `try`/`catch` because `localStorage` throws in some private-browsing modes, and falls
   back to a default when the saved value is unrecognised.
3. **Pages read preferences on mount, not reactively.** Each page holds its own state
   with `useState` and there is no global store or context. The previous change accepted
   this: changing the currency updates other pages when they are next navigated to.

Point 3 is a real constraint. For currency it is invisible. For a theme it would be
unacceptable — a toggle that leaves the current page unchanged reads as broken.

## Goals / Non-Goals

**Goals:**

- Repaint the entire application the instant the toggle is activated, without
  introducing a global state container.
- Keep the light theme byte-for-byte identical to what ships today, so this change
  cannot regress the existing appearance.
- Match the shape of the existing currency preference closely enough that the two read
  as the same idea applied twice.
- Leave the stylesheet with no hard-coded colour literals at all.

**Non-Goals:**

- No React context, provider, or state-management library.
- No CSS preprocessor, theming library, or build-step change.
- No refactor of how pages read the currency preference. That accepted limitation stays
  as it is; this design routes around it rather than fixing it.

## Decisions

### Apply the theme with a `data-theme` attribute on the root element, not through React

`applyTheme()` sets `document.documentElement.dataset.theme`. The stylesheet defines the
dark palette as an attribute-scoped override of the same variable names:

```css
  :root               { --bg: #ffffff; --text: #222222; }
  [data-theme="dark"] { --bg: #1a1a1a; --text: #e8e8e8; }
```

One attribute write re-resolves every `var()` reference in the document, so the whole
application repaints at once. React is not involved and no component re-renders.

This is why the theme can be instant while the currency is not. The currency is consumed
by `formatMoney()` *inside* components, so showing a new symbol genuinely requires a
re-render. The theme is consumed by the CSS cascade, which is already reactive to
attribute changes. The two preferences look similar but sit on opposite sides of the
React boundary.

*Alternatives considered.* A React context with a provider in `main.jsx` would also work
and would additionally fix the currency delay — rejected because it introduces a provider
pattern an application of this size does not need, and it would touch every page rather
than one stylesheet. Swapping an entire stylesheet file per theme was rejected as it
duplicates 200 lines to vary seven values. Setting inline styles on `document.body` was
rejected because it cannot reach descendant selectors such as `.card` or `th`.

### Put the theme in its own `theme.js` rather than extending `settings.js`

`theme.js` mirrors the structure of `settings.js` — a storage key, a map of valid values,
a default, a getter that falls back on unrecognised input, and a setter — and adds
`applyTheme()`, which has no analogue on the currency side.

*Alternatives considered.* Adding theme functions to `settings.js` keeps preferences in
one file and was tempting. Rejected because the two work by different mechanisms: one
formats a string that a component renders, the other mutates the DOM. Keeping them apart
stops `settings.js` becoming a drawer of unrelated preferences, and it means the theme's
storage key, default, and validity check are visible in one short file.

### Default to light, and do not consult `prefers-color-scheme`

`getTheme()` returns the saved value when it is recognised and `'light'` otherwise.

*Alternatives considered.* Reading the operating system's `prefers-color-scheme` via
`matchMedia` would give a dark-mode user dark on first visit. Rejected for two reasons:
it creates a second source of truth, so "what theme am I in" no longer has a single
answer; and it makes the first-visit requirement awkward to verify, since a test must
mock a media query rather than clear one storage key. Defaulting to light also matches
how the currency defaults to USD regardless of locale, so the two preferences behave
consistently. The cost is accepted: a dark-mode user must click once.

### Lighten the accent for dark mode and add `--accent-text`

`--accent: #2563eb` is chosen to carry white text on a white-backgrounded page. Left
unchanged on a `#1a1a1a` background it reads as muddy and low-contrast. Lightening it to
`#60a5fa` fixes that, but white text on `#60a5fa` falls to roughly 2:1 contrast and
becomes unreadable — so the text colour has to vary with the theme too:

```
  light:  --accent #2563eb   --accent-text #ffffff
  dark:   --accent #60a5fa   --accent-text #1a1a1a
```

The two `#ffffff` literals at `styles.css:54` and `styles.css:170` become
`var(--accent-text)`. This is the one place where the change is not purely additive, and
it is also the reason the spec carries an explicit legibility scenario rather than
leaving contrast implicit.

*Alternatives considered.* Keeping `#2563eb` in both themes needs no new variable and
touches nothing — rejected because the muddy accent is exactly the kind of result that
makes a dark theme feel unfinished, and it would leave two colour literals stranded
outside the palette block. Computing a lighter accent with `color-mix()` was rejected as
harder to read than stating the value.

### A toggle button labelled with its destination

The control is a `<button>` reading "Switch to dark" while light is active, and "Switch
to light" while dark is active.

*Alternatives considered.* A `<select>` with two options would match the currency control
exactly, but the user asked for a toggle, and a two-option dropdown is a clumsy way to
express a binary. A checkbox labelled "Dark mode" is idiomatic, though it needs the user
to map checked-ness onto a visual state. A sun/moon icon button was rejected as it needs
an accessible label anyway, and the label alone is clearer. Labelling by state (for
example "Theme: light") was rejected because it is ambiguous about whether pressing it
reports or changes.

### Apply the saved theme in `main.jsx` before `createRoot`, and accept a brief flash

`main.jsx` calls `applyTheme(getTheme())` immediately after importing `./styles.css` and
before `createRoot(...).render(...)`. At that moment `#root` is still empty, so no part of
the interface is ever painted in the wrong theme.

The page background, however, can show light for a frame or two before the attribute is
set, because the browser paints after parsing the stylesheet and before the module
executes.

*Alternatives considered.* An inline `<script>` in `index.html`'s `<head>` runs before the
stylesheet paints and removes the flash entirely. Rejected because it duplicates the
storage-key name and fallback logic in raw JavaScript outside the module system, where it
can drift out of step with `theme.js`. For a locally run single-user application, one
frame of light is a smaller cost than two copies of the same logic. If it ever becomes
irritating, the inline script is the known fix.

## Risks / Trade-offs

**A dark-mode user gets light on first visit** → Accepted deliberately, in exchange for a
single predictable default and a testable first-visit requirement. One click fixes it,
and the choice is then remembered.

**Brief light flash on load when dark is saved** → Accepted. Recorded here so it is a
known limitation rather than a bug discovered later; the inline-script fix is documented
above.

**Contrast is asserted by inspection, not measured** → The spec requires legible text on
the accent colour, but nothing in the project computes contrast ratios. Mitigation: the
palette values are stated explicitly in this design so they can be checked against a
contrast tool by hand, and the legibility scenario names the two specific places
(active nav item, primary button) where the risk lives.

**`localStorage` can throw** → Already the established pattern in `settings.js`: wrap
access in `try`/`catch` and fall through to the default. The application still works, it
simply forgets the choice.

**Two independent preferences in two files could drift in style** → Mitigation:
`theme.js` deliberately mirrors `settings.js` in structure and naming, so a reader who
understands one understands the other.

## Migration Plan

None required. There is no stored data to migrate, no API contract to version, and no
database change. A user with no saved theme sees exactly what they see today, because the
light palette is unchanged.

Rolling back means reverting the four frontend files; nothing outside the browser's
`localStorage` retains any trace of the feature, and an orphaned theme key is ignored
harmlessly.

## Open Questions

None. The four decisions that could have changed the specs — the default theme, the dark
accent treatment, the control type, and where the theme is applied — are all settled
above.
