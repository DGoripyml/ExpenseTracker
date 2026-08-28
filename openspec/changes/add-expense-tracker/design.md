## Context

See `proposal.md` — Why for motivation, and the `specs/` deltas for the behaviour
being built.

The repository is empty: no source files, no commits, no `.gitignore`. Every structural
decision here is greenfield, which means the main risk is over-building rather than
fitting into an existing design.

Two facts about the surroundings shape the approach:

- A sibling project, `../sample-demo`, is an existing FastAPI CRUD app in this same
  workspace. It establishes a house style worth matching: `app/main.py` creating the
  app and including routers, one router module per resource under `app/routers/`,
  Pydantic request/response models in `app/schemas.py`, the data layer isolated in its
  own module, docstrings on modules and functions, `204` on delete, and `404` raised
  through `HTTPException`. This design follows those conventions.
- The local environment already provides Node 24, Python 3.13, FastAPI 0.141, Pydantic
  2.13, and `uv`. SQLAlchemy is the one required dependency not yet installed.

The intended audience is a beginner reading the code to learn from it, so "fewer
concepts" is a real design constraint and not just a preference.

## Goals / Non-Goals

**Goals:**

- A layout where each file has one obvious job, small enough to read end to end.
- One and only one place in the frontend that performs HTTP, so data flow is traceable.
- No client-side state management beyond React's built-in `useState`.
- No CORS configuration, no environment variables, and no API base-URL juggling.
- Conventions consistent with the sibling `sample-demo` project.

**Non-Goals:**

- No database migration tooling. The schema is created at startup from the models; a
  schema change during development means deleting the SQLite file.
- No shared abstraction over the two CRUD resources. `expenses.py` and `categories.py`
  will contain visibly similar code, and that repetition is preferred over a generic
  base router that hides what is happening.
- No test suite in this change. The spec scenarios are written to be testable so tests
  can be added later without reworking them.
- No loading spinners, optimistic updates, or error toasts beyond plain inline text.

## Decisions

### Two applications in one repository, split by folder

`backend/` and `frontend/` are siblings under the repository root, each self-contained
with its own dependency manifest. They are developed with two terminals running two dev
servers.

*Alternative considered:* having FastAPI serve the built frontend as static files, so
one process serves everything. Rejected because it requires a build step before the UI
can be seen at all, which slows the edit-refresh loop and adds a deployment concept
this change does not need.

### The frontend calls `/api/...` and Vite proxies it

The frontend uses relative paths such as `/api/expenses`. Vite's dev server is
configured to forward `/api` to `http://127.0.0.1:8000`. From the browser's point of
view every request is same-origin.

```
  Browser (:5173)                            FastAPI (:8000)
  +----------------------+                   +-------------------+
  | fetch("/api/expenses")|                  | /api/expenses     |
  +----------+-----------+                   +---------+---------+
             |                                         ^
             v                                         |
     Vite dev server  -- proxy /api -------------------+
     (same origin, so no CORS)
```

This removes two concepts at once: no `CORSMiddleware` on the backend and no base-URL
constant or environment variable on the frontend.

*Alternative considered:* calling `http://localhost:8000` directly and enabling CORS.
Rejected because CORS failures are opaque and discouraging to debug, and it introduces
a hardcoded host that would need to change for any other environment.

All API routes are therefore mounted under an `/api` prefix.

### SQLAlchemy ORM rather than the `sqlite3` standard library

Table structure is declared as SQLAlchemy models and rows are read and written through
a session.

The trade-off was explicitly weighed: raw `sqlite3` needs no dependency and keeps the
whole data layer in roughly 25 lines of visible SQL, whereas SQLAlchemy adds a
dependency and four new concepts (engine, session, declarative base, model classes)
before the first endpoint works. SQLAlchemy was chosen because it is the pattern
encountered in real FastAPI codebases and transfers to future work, and because
relationship handling — reading an expense's category name, counting a category's
expenses — is expressed more directly through the ORM than by hand-written joins.

Consequences to handle deliberately:

- The data layer is two files, not one: `db.py` (engine, session factory, and the
  `get_db` dependency) and `models.py` (the table definitions).
- `models.py` and `schemas.py` will look almost identical. This is not duplication:
  the SQLAlchemy model describes the database table, the Pydantic schema describes the
  JSON contract. Keeping them separate is what allows the API shape to differ from the
  storage shape — for example returning `category_name` on an expense, which is not a
  stored column.
- Pydantic response models that are constructed from ORM rows need
  `model_config = ConfigDict(from_attributes=True)`. Without it, serialisation fails.
  This is the most common first stumble with this combination and is called out here so
  it is expected rather than debugged.
- Sessions are provided to routers through FastAPI's dependency injection
  (`Depends(get_db)`) so that each request gets its own session and it is always
  closed.
- `check_same_thread=False` is required in the SQLite connection arguments, because
  FastAPI may handle a request on a different thread than the one that created the
  connection.

### Two tables; dates stored as ISO text

```
  +---------------------+          +--------------------------+
  |     categories      |          |        expenses          |
  +---------------------+          +--------------------------+
  | id       INTEGER PK |<---+     | id          INTEGER PK   |
  | name     TEXT UNIQUE|    |     | amount      REAL         |
  +---------------------+    +-----| category_id INTEGER FK   |
                                   | description TEXT         |
                                   | date        TEXT (ISO)   |
                                   +--------------------------+
```

`date` is stored as a `YYYY-MM-DD` string. SQLite has no native date type, and ISO-8601
strings sort chronologically under ordinary string comparison. Current-month filtering
is therefore an inclusive lower bound and an exclusive upper bound on strings — that is,
`date >= '2026-08-01' AND date < '2026-09-01'` — which needs no date parsing on either
side of the wire and no date library in the frontend.

*Alternative considered:* SQLite's `strftime('%Y-%m', date)` to compare month strings.
Rejected because a bare range comparison can use an index and is easier to read.

`amount` is stored as `REAL`. This is a knowing compromise: binary floating point
cannot represent values like `0.10` exactly, so summing many amounts can drift by a
fraction of a unit. The correct approach for real financial software is integer minor
units (cents/paise) converted at every boundary. `REAL` is accepted here because the
conversion noise at every layer would work against the goal of a readable beginner
codebase, and a personal tracker's totals tolerate sub-cent drift. This is recorded so
the pattern is not copied into anything that matters.

### Deleting a category in use is refused

`DELETE /api/categories/{id}` counts the expenses assigned to the category first. If
the count is greater than zero it returns `409 Conflict` with a message naming the
count; nothing is modified.

```
  DELETE /api/categories/3
        |
        v
  count expenses where category_id = 3
        |
   +----+-----+
   |          |
  = 0       > 0
   |          |
   v          v
 delete   409 Conflict
  204     "Category has 40 expenses"
```

*Alternatives considered:*

- *Cascade* — delete the category's expenses along with it. Fewest lines of code, but a
  single click would silently destroy financial records with no undo. Rejected: a
  learning codebase should not model destructive defaults.
- *Orphan* — set `category_id` to `NULL` and display those expenses as "Uncategorized".
  Rejected because nullable foreign keys tax every read path: the expense list, both
  dashboard totals, and the recent-expenses join would each need a `NULL` branch. That
  cost is spread across the whole application to serve a rare action.

Refusing is three lines, destroys nothing, and leaves the user with the workable path
of renaming a category or reassigning its expenses first.

### Client-side routing with real URLs

`react-router-dom` provides four routes: `/`, `/expenses`, `/categories`, `/settings`.

*Alternative considered:* a `useState` value switching which page component renders,
which needs no dependency and about six lines. Rejected because it produces an
application where the browser back button does nothing and a refresh always returns to
the Dashboard — behaviour users read as broken. Real URLs cost one dependency and
roughly ten lines.

A useful consequence: because the router unmounts and remounts a page component on
navigation, each page can load its own data in a `useEffect` on mount and hold it in
local `useState`. No shared cache, no global store, and no cross-page invalidation
logic is needed. The cost is that navigating away and back refetches, which is
irrelevant against a local SQLite database.

### One module owns all HTTP; pages own their own state

`src/api.js` exports one function per operation (`listExpenses`, `createExpense`, and
so on) and is the only file containing `fetch`. Page components import from it and
never construct URLs.

This keeps the request surface enumerable in a single file, and means a change to error
handling or the URL prefix happens in one place. Pages stay focused on rendering and
local form state.

### Settings are client-side only, stored in `localStorage`

The preference never reaches the server: there is no settings endpoint and no settings
table. `src/settings.js` owns reading and writing the value and exports a
`formatMoney(amount)` helper that applies the selected symbol.

```
  Settings.jsx --> settings.js --> localStorage
                        |
                        +--> formatMoney()  used by Dashboard, Expenses
```

Routing every displayed amount through `formatMoney` means the currency symbol has
exactly one implementation. Unreadable or absent stored values fall back to dollars,
satisfying the settings spec's fallback scenario.

Currency selection swaps the symbol only and never converts. Real conversion would
require an exchange-rate source, a policy for whether historical expenses re-value, and
most likely a per-expense currency column — a schema change, and therefore a separate
future change rather than a hidden part of this one.

Theme switching was considered and dropped from scope: the application ships with a
single colour scheme. Colours are still declared once as CSS custom properties on
`:root` so they are named in one place and easy to adjust, which keeps the door open to
adding a theme later without restructuring the stylesheet:

```css
  :root  { --bg: #ffffff; --text: #222222; --card: #f5f5f5; }
  .card  { background: var(--card); color: var(--text); }
```

*Accepted limitation:* because each page reads preferences on mount, changing the
currency in Settings updates other pages when they are next navigated to, not live. In
a four-page application this is invisible. A React context would make it instant and is
the right fix if it ever becomes noticeable — deliberately deferred to avoid
introducing a provider pattern this size of app does not need.

### The dashboard summary is computed on the server

A single `GET /api/dashboard` returns all three figures: all-time total, current-month
total, and up to five recent expenses.

*Alternative considered:* fetching all expenses and computing the totals in React. That
needs no new endpoint, but transfers the whole table to compute three numbers and
degrades quietly as data grows. Server-side aggregation is roughly fifteen lines, keeps
the arithmetic in one place, and means the Dashboard page performs one request.

### Resulting file layout

```
ExpenseTracker/
+-- backend/
|   +-- app/
|   |   +-- __init__.py
|   |   +-- main.py            app, /api routers, /health, create tables
|   |   +-- db.py              engine, SessionLocal, get_db dependency
|   |   +-- models.py          SQLAlchemy: Category, Expense
|   |   +-- schemas.py         Pydantic request/response models
|   |   +-- routers/
|   |       +-- __init__.py
|   |       +-- expenses.py    CRUD
|   |       +-- categories.py  CRUD + 409 guard on delete
|   |       +-- dashboard.py   one read-only summary endpoint
|   +-- requirements.txt       fastapi, uvicorn[standard], sqlalchemy
+-- frontend/
|   +-- index.html
|   +-- package.json           react, react-dom, react-router-dom, vite
|   +-- vite.config.js         proxy /api -> 127.0.0.1:8000
|   +-- src/
|       +-- main.jsx           BrowserRouter
|       +-- App.jsx            nav + Routes
|       +-- api.js             every fetch call
|       +-- settings.js        currency, formatMoney
|       +-- styles.css         CSS custom properties, single scheme
|       +-- pages/
|           +-- Dashboard.jsx
|           +-- Expenses.jsx
|           +-- Categories.jsx
|           +-- Settings.jsx
+-- .gitignore
+-- README.md
```

### API surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/categories` | List categories, ordered by name |
| `POST` | `/api/categories` | Create a category (`409` on duplicate name) |
| `PUT` | `/api/categories/{id}` | Rename (`404` missing, `409` duplicate) |
| `DELETE` | `/api/categories/{id}` | Delete (`404` missing, `409` if in use) |
| `GET` | `/api/expenses` | List expenses, most recent date first |
| `POST` | `/api/expenses` | Create an expense (`422` invalid, `404` bad category) |
| `PUT` | `/api/expenses/{id}` | Update (`404` missing, `422` invalid) |
| `DELETE` | `/api/expenses/{id}` | Delete (`404` missing) |
| `GET` | `/api/dashboard` | Totals and recent expenses |
| `GET` | `/health` | Liveness check, matching the sibling project |

## Risks / Trade-offs

- **Floating-point `REAL` for money drifts over long sums** → Accepted knowingly for a
  personal-scale POC and documented above so the pattern is not reused. The fix, if
  ever needed, is integer minor units, which is an isolated change to the models plus
  conversion at the API boundary.
- **`models.py` and `schemas.py` look redundant and invite "simplification"** → The
  design records why they are separate. Collapsing them would couple the JSON contract
  to the table shape and break `category_name` on the expense response.
- **Missing `from_attributes=True` breaks serialisation with a confusing error** →
  Called out explicitly in the decisions above and in the implementation tasks, so it is
  configured on the response models from the start.
- **No migrations, so any model change breaks an existing database** → Acceptable while
  the data is disposable. The recovery is deleting the SQLite file and restarting; the
  README will say so plainly.
- **Refusing to delete an in-use category can strand a user with no bulk reassignment
  tool** → Mitigated by the error message naming the count, so the reason is clear, and
  by renaming being available as the usual alternative. A bulk reassign action is a
  candidate future change.
- **Two dev servers to start means one can be forgotten** → Symptom is every request
  failing through the proxy. The README will document both commands together, and
  `/health` gives a quick way to confirm the backend is up.
- **The unauthenticated API is bound locally but grants full read/write to anyone who
  can reach the port** → Acceptable for local single-user development, and the proposal
  states it is not for deployment. Binding to `127.0.0.1` rather than `0.0.0.0` keeps
  it off the local network.
- **Preference changes are not reflected live on already-loaded pages** → Accepted; see
  the settings decision. The mitigation, if needed, is a React context.
