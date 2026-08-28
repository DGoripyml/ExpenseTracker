## Why

This repository is empty and needs a small, working expense tracker that a single
person can run locally to record what they spend and see simple totals. The goal is
a beginner-friendly reference application: small enough to read end to end in one
sitting, while still being a realistic React + FastAPI + SQLite stack.

## What Changes

- Add a FastAPI backend (`backend/`) serving a JSON API over a SQLite database with
  two tables: `expenses` and `categories`.
- Add a React + Vite frontend (`frontend/`) with four pages: Dashboard, Expenses,
  Categories, and Settings.
- Full create / list / edit / delete for expenses.
- Full create / list / edit / delete for categories, with a guard: deleting a
  category that still has expenses is rejected rather than cascading or orphaning.
- A read-only dashboard summary: all-time total, current-month total, and the most
  recent expenses.
- A Settings page holding one client-side preference: a currency symbol choice
  (USD or INR), persisted in `localStorage`.
- Plain hand-written CSS using custom properties for colours. No CSS framework.

Non-goals for this change (deliberately excluded to keep it small):

- No authentication, user accounts, or multi-user support. The API is unauthenticated
  and intended for local use only.
- No currency conversion. Changing the currency setting swaps the displayed symbol
  only; stored amounts are never re-valued.
- No CSV/bank import, receipt uploads, budgets, recurring expenses, or reporting
  beyond the three dashboard figures.
- No light/dark theme switching. The app ships with a single colour scheme.
- No pagination, search, or sorting controls on the expense list.
- No deployment, containerisation, or CI configuration.

## Capabilities

### New Capabilities
- `expenses`: Recording, listing, editing, and deleting individual expenses, each
  with an amount, date, description, and an assigned category.
- `categories`: Managing the set of spending categories that expenses are assigned
  to, including the rules that protect categories currently in use.
- `dashboard`: A read-only summary view of spending: all-time total, current-month
  total, and most recent expenses.
- `settings`: User-adjustable display preferences (currency symbol) that
  persist across sessions and affect how the rest of the app renders.

### Modified Capabilities
<!-- None. This is a greenfield change; no specs exist yet under openspec/specs/. -->

## Impact

- **New code**: `backend/` (FastAPI app, SQLAlchemy models, three routers) and
  `frontend/` (Vite project, four pages, one API module, one stylesheet).
- **New dependencies**: `fastapi`, `uvicorn[standard]`, `sqlalchemy` on the Python
  side; `react`, `react-dom`, `react-router-dom`, `vite` on the JavaScript side.
  SQLAlchemy is the only one not already present in the local environment.
- **Data**: A SQLite file created on first run and excluded from version control.
  Schema is created automatically at startup; there is no migration tooling.
- **Local ports**: Vite dev server on 5173, FastAPI on 8000. Vite proxies `/api` to
  the backend so the frontend needs no CORS configuration or base URL handling.
- **Repository root**: Adds `.gitignore` and `README.md`. No existing files are
  modified, because there are none.
