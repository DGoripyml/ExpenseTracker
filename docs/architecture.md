# Architecture

How the pieces fit together, and why they are built the way they are.

## Two processes

The application is two programs that run side by side:

- **FastAPI** serves the HTTP API under `/api` (plus a `/health` check) on port 8000.
- **Vite** serves the React frontend on port 5173 and proxies every `/api` request
  through to FastAPI.

Because the proxy sits in front of the backend, the frontend never needs a CORS
configuration or a hard-coded API URL — it just calls `/api/...` and Vite forwards it.
The cost is that both processes must run together; see [setup.md](setup.md) for how to
start them and what a stopped backend looks like.

```
  browser  -->  Vite dev server (5173)  --/api-->  FastAPI (8000)  -->  SQLite
                serves React app                    serves JSON          expenses.db
```

## Project layout

```
backend/
  app/
    main.py            creates the app, mounts routers, creates tables at startup
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
    main.jsx           mounts React, applies the saved theme, wraps the app in BrowserRouter
    App.jsx            nav bar and the four routes
    api.js             every HTTP call in the app lives here
    settings.js        currency preference and formatMoney()
    theme.js           light/dark theme preference
    styles.css         colours as CSS custom properties, with a dark palette
    pages/             Dashboard, Expenses, Categories, Settings
```

## Backend design

**Two tables, one relationship.** `models.py` defines `Category` (an `id` and a unique
`name`) and `Expense` (`id`, `amount`, `category_id`, `description`, `date`), joined by a
foreign key. The API can return a category's name alongside an expense without storing it
twice: `Expense.category_name` reads it through the relationship rather than duplicating
it in the expenses table.

**Storage and presentation are separate.** `models.py` describes the database tables;
`schemas.py` describes the JSON that goes over the wire. Keeping them apart is what lets a
response include the joined `category_name` even though the table only stores a
`category_id`.

**Dates are ISO `YYYY-MM-DD` strings, not a date type.** SQLite has no native date type,
and ISO date strings sort chronologically as plain text. So "expenses in the current
month" is a string range comparison — `first of this month <= date < first of next
month` — with no date parsing in the query. That logic lives in the dashboard router.

## Frontend design

Two conventions keep the frontend easy to follow:

- **`api.js` is the only file that calls `fetch`.** Every network request in the app goes
  through it, so there is one place to look when something talks to the backend.
- **Each page owns its own data with `useState`.** There is no Redux, context store, or
  other global state. A page fetches what it needs when it mounts and holds it locally.

## Display preferences

Two things about how the app *looks* are remembered per browser, in `localStorage`, and
never sent to the server — there is no settings endpoint and no settings table.

- **Currency symbol** (`settings.js`). Choosing USD or INR swaps the symbol shown next to
  every amount. It does **not** convert values: 42.50 displays as `$42.50` or `Rs.42.50`
  with the same underlying number. It changes presentation only, through `formatMoney()`,
  which every component uses to render an amount.
- **Light or dark theme** (`theme.js`, `styles.css`). All colours are declared once as CSS
  custom properties on `:root`, and a `[data-theme="dark"]` block overrides them.
  Switching the theme sets a single `data-theme` attribute on the `<html>` element;
  because every colour is a `var()`, that one write re-resolves them all and the whole
  page repaints at once, with no React re-render involved. `main.jsx` applies the saved
  theme before the app renders, so a returning user never sees a flash of the wrong theme.

Both default to a fixed starting point (USD, light) and fall back to it if the stored
value is missing or unrecognised, rather than failing to load. The theme deliberately
does not follow the operating system's colour-scheme preference, so the starting state is
predictable.

## Two behaviours that surprise people

**Deleting a category that has expenses is refused.** The `DELETE` returns `409` with a
message saying how many expenses are assigned. This is deliberate. Cascading the delete
would silently destroy expense records; orphaning them would push a null-category case
onto every screen that lists expenses. Refusing leaves the choice with the user: rename
the category, or move its expenses first.

**There are no database migrations.** Tables are created from the models at startup
(`Base.metadata.create_all` in `main.py`). If you change a model in
`backend/app/models.py`, the existing `backend/expenses.db` keeps its old shape — delete
that file and restart the backend to get the new schema. Your data is lost when you do,
which is acceptable while the data is disposable, and is why no migration tool was added.

## API reference

All endpoints are under `/api`. The live, interactive reference is at
<http://127.0.0.1:8000/docs> while the backend runs — this table is a summary.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/categories` | List categories, ordered by name |
| `POST` | `/api/categories` | Create a category (`201`; `409` if the name exists) |
| `PUT` | `/api/categories/{id}` | Rename (`404` missing, `409` duplicate name) |
| `DELETE` | `/api/categories/{id}` | Delete (`204`; `404` missing, `409` if in use) |
| `GET` | `/api/expenses` | List expenses, most recent date first |
| `POST` | `/api/expenses` | Create (`201`; `422` invalid, `404` unknown category) |
| `PUT` | `/api/expenses/{id}` | Update (`404` missing, `404` unknown category, `422` invalid) |
| `DELETE` | `/api/expenses/{id}` | Delete (`204`; `404` missing) |
| `GET` | `/api/dashboard` | All-time total, current-month total, five recent expenses |
| `GET` | `/health` | Liveness check, returns `{"status": "ok"}` |

## Security posture

The application is **single-user and intended for local use only**. There is no
authentication of any kind. The setup binds the backend to `127.0.0.1` rather than
`0.0.0.0` on purpose: it must not be exposed to a network, because anyone who could reach
it could read and change every record without a credential.

## How this project was built: the OpenSpec workflow

The app was planned and implemented with [OpenSpec](https://github.com/Fission-AI/OpenSpec).
The behaviour contracts live in `openspec/specs/`, written as testable scenarios that say
what the app must do independently of how it does it. Each change is proposed, specified,
designed, and broken into tasks under `openspec/changes/` before any code is written; once
the tasks are done the change is archived under `openspec/changes/archive/`.

This repository's own archive is the clearest example, because it shows the two shapes a
change can take:

- **`add-expense-tracker`** built the whole app. Its spec delta was *merged* into the main
  specs on archive — the requirements now in `openspec/specs/categories`, `dashboard`,
  `expenses`, and `settings` came from it.
- **`add-theme-toggle`** added the dark theme. It also carried a spec delta, which merged
  three new requirements into `openspec/specs/settings`.
- **This documentation change** touches no behaviour, so it has no spec delta at all. Its
  `.openspec.yaml` declares `skip_specs: true`, which records that the absence of a delta
  is deliberate rather than an omission — without it, validation would reject a change that
  specifies nothing.

So a change that alters what the app does merges a delta into `openspec/specs/`, and a
change that only alters documentation or tooling declares `skip_specs: true`. Both are in
`openspec/changes/archive/`, side by side, if you want to read the real thing.
