# Setup and running

This is everything you need to get the Expense Tracker running from a fresh clone.

## Prerequisites

- Python 3.11 or newer
- Node.js 18 or newer

## The app is two programs

An API and a web frontend. You need **two terminals**, one for each, both running at
the same time. The frontend talks to the backend through a proxy, so if only one is
running the app will not work — see [Troubleshooting](#troubleshooting) below.

Nothing here needs to be created before you start: a category must exist before you can
add an expense, but you create that from the running app, not during setup. See
[First run](#first-run) once both servers are up.

## Terminal 1 — backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate      # Windows
# source .venv/bin/activate # macOS / Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API is now on <http://127.0.0.1:8000>. Two URLs confirm it is working:

- <http://127.0.0.1:8000/health> — returns `{"status": "ok"}` when the backend is up
- <http://127.0.0.1:8000/docs> — the interactive API documentation

The SQLite database file `backend/expenses.db` is created automatically on first run.
It is not tracked in git, so a fresh clone starts empty.

## Terminal 2 — frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

## First run

The app opens on the Dashboard, which is empty until you record something. You cannot
add an expense straight away, because every expense belongs to a category and there are
none yet — the Expenses page shows a prompt instead of a form until at least one
category exists.

So the working order on a fresh database is:

1. Go to **Categories** and add one (for example, "Groceries").
2. Go to **Expenses**, where the form is now available, and record an expense against it.

## Troubleshooting

The Vite dev server forwards anything under `/api` to the backend on port 8000. That is
why the frontend needs no CORS setup and no API base URL — but it also means **both
servers must be running at once**. If every page shows an error, the backend in terminal
1 has almost certainly stopped; the proxy has nothing to forward to. Restart it and the
pages recover.
