## 1. Prepare

- [x] 1.1 Re-read the current root `README.md` and
  `openspec/changes/archive/2026-08-28-add-expense-tracker/design.md`, and confirm the
  `add-theme-toggle` change has been applied and archived so the code being described is
  settled; verify the frontend on disk matches what will be documented
- [x] 1.2 Create the `docs/` directory at the repository root, as a sibling of `backend/`,
  `frontend/`, and `openspec/` — not nested inside any of them; verify it exists at the
  root, is empty, and that `docs/` in every path below therefore resolves from the root

## 2. docs/setup.md

- [x] 2.1 Write the prerequisites and the two-terminal setup, moving the commands from the
  root README rather than copying them; verify a reader following only this file can start
  both halves from a fresh clone
- [x] 2.2 Include the two backend checks (`/health` returning ok and `/docs` for the
  interactive API) and note that the SQLite file is created automatically on first run;
  verify both URLs are stated correctly
- [x] 2.3 Explain that both servers must run at once because Vite proxies `/api` to port
  8000, and that every page erroring usually means the backend stopped; verify the
  troubleshooting note names the proxy as the reason
- [x] 2.4 State that a category must be created before any expense can be added, since the
  Expenses page shows a prompt instead of a form when no category exists; verify a
  first-time reader is told the working order

## 3. docs/architecture.md

- [x] 3.1 Document the two-process shape — FastAPI serving `/api`, Vite serving the
  frontend and proxying to it — and the project layout, adapting the tree from the root
  README; verify every file named in the tree exists on disk
- [x] 3.2 Promote the design decisions from the archived change into readable prose,
  covering the SQLAlchemy models, dates stored as ISO strings, and the two frontend
  conventions (`api.js` is the only file that calls `fetch`; each page owns its state with
  no global store); verify each claim against the code rather than the archive alone
- [x] 3.3 Carry over the two behaviours that surprise people: deleting a category in use
  is refused with a count and why that beats cascading or orphaning, and there are no
  migrations so a model change means deleting `backend/expenses.db`; verify both appear
  with their rationale intact
- [x] 3.4 Document the display preferences — the currency symbol swaps the symbol without
  converting, the theme applies via a `data-theme` attribute so the CSS cascade repaints,
  and both are stored per-device in `localStorage`; verify this matches `settings.js` and
  `theme.js` as built
- [x] 3.5 Include the API endpoint table with its status codes, and point at `/docs` as
  the live reference; verify each row against the routers in `backend/app/routers/`
- [x] 3.6 Note that the app is unauthenticated and intended for local use only, and should
  be bound to `127.0.0.1` rather than exposed to a network; verify the warning is present
  and unambiguous
- [x] 3.7 Explain the OpenSpec workflow using this repository's own archive as the example
  — one change that merged a spec delta into `openspec/specs/`, and one documentation
  change that declares `skip_specs: true`; verify the described archive contents match
  what is actually in `openspec/changes/archive/`

## 4. docs/README.md

- [x] 4.1 Write the overview: what the application is, who it is for, and the technology
  in one line each; verify it reads as an introduction and does not repeat setup commands
- [x] 4.2 Include the four-page tour as a table, describing what each page does; verify all
  four pages are covered and match the routes in `App.jsx`
- [x] 4.3 State the deliberate limitations — single user, local only, no authentication,
  amounts stored as floating point rather than integer cents; verify each is stated as a
  choice rather than a defect
- [x] 4.4 Link onward to `setup.md` and `architecture.md`; verify both relative links
  resolve

## 5. Slim the root README

- [x] 5.1 Reduce the root `README.md` to the project pitch, a brief orientation, and links
  into `docs/`, removing the sections that have moved; verify no setup command, API row, or
  layout tree remains duplicated in it
- [x] 5.2 Keep the note that behaviour contracts live in `openspec/specs/` and that the
  changes that produced them are in `openspec/changes/`; verify both paths exist as
  described
- [x] 5.3 Read the slimmed README as a first-time visitor and confirm it answers "what is
  this and where do I start"; verify the path to running the app is at most one click away

## 6. Verify

- [x] 6.1 Follow `docs/setup.md` from a clean state and start both servers using only that
  file; verify the application loads at the documented URL
  — **verified statically, not by a live run:** every command target exists
  (`backend/requirements.txt`, `app.main:app`, `frontend`'s `dev` script) and the proxy
  in `vite.config` matches the documented `/api` -> `127.0.0.1:8000`. The two servers
  were not actually booted, so confirming the app loads in a browser is still a manual
  step for the reader.
- [x] 6.2 Check every cross-link in all four documents resolves to a file that exists;
  verify no link points at a moved or renamed section
- [x] 6.3 Confirm no fact appears in two files with different wording, particularly the
  setup commands and the API table; verify each has exactly one home
- [x] 6.4 Run `openspec validate "docs" --strict` and verify it reports the change as
  valid despite having no spec delta, which confirms `skip_specs: true` is doing its job
