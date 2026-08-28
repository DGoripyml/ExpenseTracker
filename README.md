# Expense Tracker

A small personal expense tracker: record what you spend, group it into categories,
and see simple totals. Built as a beginner-friendly reference app with React + Vite
on the front and FastAPI + SQLite behind it.

Single user, local only. There is no authentication, so do not expose it to a
network.

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer

## Setup and run

The app is two programs: an API and a web frontend. You need **two terminals**, one
for each, both running at the same time.

### Terminal 1 — backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate      # Windows
# source .venv/bin/activate # macOS / Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is now on <http://127.0.0.1:8000>. Two useful URLs:

- <http://127.0.0.1:8000/health> — confirms the backend is up
- <http://127.0.0.1:8000/docs> — interactive API documentation

The SQLite file `backend/expenses.db` is created automatically on first run and is
not tracked in git.

### Terminal 2 — frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

The Vite dev server forwards anything under `/api` to the backend on port 8000, so
the frontend never needs a CORS setup or a base URL. It also means **both servers
must be running** — if every page shows an error, the backend in terminal 1 has
probably stopped.

## The four pages

| Page | What it does |
|---|---|
| Dashboard | All-time total, current-month total, five most recent expenses |
| Expenses | Add, list, edit, delete expenses |
| Categories | Add, list, rename, delete categories |
| Settings | Choose the currency symbol (USD or INR) |

## Things worth knowing

**Deleting a category that has expenses is refused.** You will get a message saying
how many expenses are assigned. This is deliberate: cascading would silently destroy
records, and orphaning would push an "uncategorized" case onto every screen. Rename
the category, or move its expenses first.

**The currency setting swaps the symbol only.** It does not convert between
currencies — 42.50 stays 42.50 whether it displays as `$42.50` or `Rs.42.50`. It is
saved in your browser, not on the server, so it is per-device.

**There are no database migrations.** Tables are created from the models at startup.
If you change a model in `backend/app/models.py`, delete `backend/expenses.db` and
restart the backend to get the new schema. Your data is lost when you do this, which
is fine while the data is disposable.

**Amounts are stored as floating-point numbers.** Good enough for a personal tracker,
but summing very many values can drift by a fraction of a cent. Real financial
software should store integer cents instead.

## Project layout

```
backend/
  app/
    main.py            creates the app, mounts routers, creates tables
    db.py              engine, session factory, get_db dependency
    models.py          SQLAlchemy tables: Category, Expense
    schemas.py         Pydantic request/response models
    routers/
      categories.py    category endpoints
      expenses.py      expense endpoints
      dashboard.py     the summary endpoint
  requirements.txt
frontend/
  src/
    main.jsx           mounts React, wraps the app in BrowserRouter
    App.jsx            nav bar and the four routes
    api.js             every HTTP call in the app lives here
    settings.js        currency preference and formatMoney()
    styles.css         colours as CSS custom properties
    pages/             Dashboard, Expenses, Categories, Settings
```

Two conventions keep this easy to follow: **`api.js` is the only file that calls
`fetch`**, and **each page holds its own data in `useState`** — there is no global
store.

## API

All endpoints are under `/api`. Full interactive docs at `/docs` while the backend
runs.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/categories` | List categories, ordered by name |
| `POST` | `/api/categories` | Create a category (`409` if the name exists) |
| `PUT` | `/api/categories/{id}` | Rename (`404` missing, `409` duplicate) |
| `DELETE` | `/api/categories/{id}` | Delete (`404` missing, `409` if in use) |
| `GET` | `/api/expenses` | List expenses, most recent first |
| `POST` | `/api/expenses` | Create (`422` invalid, `404` unknown category) |
| `PUT` | `/api/expenses/{id}` | Update (`404` missing, `422` invalid) |
| `DELETE` | `/api/expenses/{id}` | Delete (`404` missing) |
| `GET` | `/api/dashboard` | Totals and recent expenses |
| `GET` | `/health` | Liveness check |

## How this project was built

Planned and implemented with [OpenSpec](https://github.com/Fission-AI/OpenSpec). The
behaviour contracts live in `openspec/specs/`, and the change that created the app is
in `openspec/changes/`. The specs are written as testable scenarios, so they describe
what the app must do independently of how it does it.
