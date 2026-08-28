## 1. Repository setup

- [x] 1.1 Create `.gitignore` at the repository root covering `.venv/`, `__pycache__/`, `*.py[cod]`, `node_modules/`, `dist/`, `*.db`, and `.env`; verify `git status --short` lists no virtual-environment, dependency, or database files after later steps create them
- [x] 1.2 Create the `backend/app/` and `backend/app/routers/` directories with empty `__init__.py` files in both packages, and verify `python -c "import app"` succeeds from `backend/`
- [x] 1.3 Create `backend/requirements.txt` listing `fastapi`, `uvicorn[standard]`, and `sqlalchemy` unpinned to match the sibling project's style; verify installing into a fresh `backend/.venv` succeeds and `python -c "import sqlalchemy, fastapi"` runs without error

## 2. Backend data layer

- [x] 2.1 Write `backend/app/db.py` with the SQLite engine (using `check_same_thread=False`), a `SessionLocal` session factory, the declarative `Base`, and a `get_db` dependency that always closes its session; verify importing the module creates no file yet and raises no error
- [x] 2.2 Write `backend/app/models.py` defining the `Category` model (`id`, unique `name`) and the `Expense` model (`id`, `amount`, `category_id` foreign key, `description`, `date` as ISO text) per the design's schema diagram; verify both classes import and expose the expected column names
- [x] 2.3 Call `Base.metadata.create_all` at application startup in `backend/app/main.py`; verify running the app creates the SQLite file and that `sqlite3 <db> ".schema"` shows both tables with the expected columns
- [x] 2.4 Write `backend/app/schemas.py` with `CategoryIn`/`Category` and `ExpenseIn`/`Expense` following the sibling project's `XxxIn` plus `Xxx(XxxIn)` naming, adding `category_name` to the expense response, plus a dashboard summary model; set `model_config = ConfigDict(from_attributes=True)` on every model returned from an ORM row and verify a model validates successfully from a model instance

## 3. Categories API

- [x] 3.1 Create `backend/app/routers/categories.py` with an `APIRouter` prefixed `/api/categories`, mount it in `main.py`, and verify `GET /api/categories` returns `200` with an empty list on a fresh database
- [x] 3.2 Implement create returning `201`, rejecting an empty or whitespace-only name and rejecting a duplicate name with `409`; verify all three outcomes against the categories spec scenarios
- [x] 3.3 Implement list ordered by name; verify three created categories come back in name order
- [x] 3.4 Implement rename returning the updated record, `404` for a missing id and `409` for a name another category already uses; verify the renamed category keeps its id and its expenses stay assigned
- [x] 3.5 Implement delete returning `204` for an unused category and `404` for a missing id; verify the category disappears from the list afterwards
- [x] 3.6 Add the in-use guard: count assigned expenses before deleting and return `409` naming the count when it is greater than zero; verify deleting a category with expenses is refused, the category still exists, and every expense is unchanged

## 4. Expenses API

- [x] 4.1 Create `backend/app/routers/expenses.py` with an `APIRouter` prefixed `/api/expenses`, mount it in `main.py`, and verify `GET /api/expenses` returns `200` with an empty list on a fresh database
- [x] 4.2 Implement create returning `201`, rejecting a zero or negative amount, an empty description, and a malformed date via validation, and rejecting an unknown `category_id`; verify each rejection stores nothing
- [x] 4.3 Implement list ordered by date descending with each row including its `category_name`; verify the ordering and that no extra request is needed to display a category name
- [x] 4.4 Implement update applying the same validation as create, returning `404` for a missing id and leaving the stored expense unchanged when validation fails; verify the id is preserved on success
- [x] 4.5 Implement delete returning `204`, and `404` for a missing id; verify the expense leaves the list and its category still exists

## 5. Dashboard API

- [x] 5.1 Create `backend/app/routers/dashboard.py` with `GET /api/dashboard` mounted in `main.py`, returning the all-time total, current-month total, and recent expenses in one response; verify it returns zeros and an empty list on a fresh database rather than nulls
- [x] 5.2 Compute the all-time total as a server-side sum coalescing to `0` when no expenses exist; verify expenses of 10.00, 25.50, and 4.50 report 40.00
- [x] 5.3 Compute the current-month total using an inclusive lower and exclusive upper ISO date bound as described in the design; verify the dashboard spec's boundary cases — first and last day of the month included, previous month excluded, and the same month in a previous year excluded
- [x] 5.4 Return at most five recent expenses ordered most recent first, each with amount, date, description, and category name; verify twelve stored expenses yield exactly the five most recent and that two stored expenses yield two without error

## 6. Backend verification

- [x] 6.1 Add a `GET /health` endpoint returning `{"status": "ok"}` to match the sibling project; verify it responds `200` while the server runs
- [x] 6.2 Walk every scenario in `specs/expenses/spec.md`, `specs/categories/spec.md`, and `specs/dashboard/spec.md` against the interactive docs at `/docs` or with `curl`, confirming each expected status code and payload; record any scenario that does not behave as specified

## 7. Frontend scaffolding

- [x] 7.1 Create the Vite React project under `frontend/` with `index.html`, `package.json`, and `src/main.jsx`; verify `npm install` then `npm run dev` serves a page at `http://localhost:5173`
- [x] 7.2 Add `react-router-dom` as a dependency; verify it appears in `package.json` and imports without error
- [x] 7.3 Configure the `/api` proxy to `http://127.0.0.1:8000` in `frontend/vite.config.js`; verify that with both servers running, a browser request to `/api/dashboard` from the dev server returns backend JSON and no CORS error appears in the console
- [x] 7.4 Write `frontend/src/api.js` exporting one function per endpoint in the design's API surface table, as the only file in the project containing `fetch`, surfacing non-OK responses as thrown errors carrying the server's detail message; verify a category can be listed and created from the browser console

## 8. Settings and styling

- [x] 8.1 Write `frontend/src/settings.js` with get/set for the currency backed by `localStorage`, plus `formatMoney(amount)` applying the selected symbol; verify unset and unrecognised stored values fall back to the dollar symbol per the settings spec
- [x] 8.2 Write `frontend/src/styles.css` declaring colours once as CSS custom properties on `:root`, and style the nav, cards, tables, and forms using those variables; verify every page picks up a colour change made in one place
- [x] 8.3 Build `frontend/src/pages/Settings.jsx` with the USD/INR currency picker persisting the choice; verify the choice survives a page reload
- [x] 8.4 Confirm changing the currency setting alters only the displayed symbol: verify an expense shown as `$42.50` becomes the rupee symbol with the value still 42.50, and that no stored record was modified

## 9. Frontend pages

- [x] 9.1 Write `frontend/src/App.jsx` with the nav links and four routes (`/`, `/expenses`, `/categories`, `/settings`) and wrap the app in `BrowserRouter` in `main.jsx`; verify each URL loads its page directly, the back button moves between pages, and a refresh stays put
- [x] 9.2 Build `frontend/src/pages/Categories.jsx` listing categories with add, rename, and delete, loading data on mount into local state; verify the list refreshes after each action
- [x] 9.3 Display the server's message inline when a category delete is refused, so the user sees how many expenses are assigned; verify attempting to delete an in-use category shows that count and leaves the list unchanged
- [x] 9.4 Build `frontend/src/pages/Expenses.jsx` with the expense list and a form to add, edit, and delete, with the category chosen from a dropdown populated from the categories endpoint and amounts rendered via `formatMoney`; verify each operation updates the list
- [x] 9.5 Show validation errors from the server inline on the expense form; verify submitting a zero amount or an empty description displays a message and adds nothing
- [x] 9.6 Build `frontend/src/pages/Dashboard.jsx` showing the all-time total, current-month total, and recent expenses from the single dashboard request, with amounts via `formatMoney`; verify adding an expense dated today then returning to the Dashboard increases both totals and lists the new expense

## 10. Documentation and end-to-end check

- [x] 10.1 Write `README.md` covering prerequisites, backend setup and run command, frontend install and run command, the two-terminal workflow, both URLs, and the note that a model change means deleting the SQLite file; verify a reader following it from a clean clone reaches a working app
- [x] 10.2 Run a full manual pass with both servers up: create categories, add several expenses across at least two months, edit one, delete one, attempt to delete an in-use category, and check the Dashboard figures against hand-computed totals; verify every result matches the specs
- [x] 10.3 Confirm `git status --short` shows only intended source files, with no `node_modules/`, `.venv/`, `__pycache__/`, or `*.db` entries
