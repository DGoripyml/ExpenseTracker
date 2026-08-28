# Expense Tracker

A small personal expense tracker: record what you spend, group it into categories, and
see simple totals at a glance.

- **What it is** — a single-user app for keeping track of personal spending, built as a
  beginner-friendly reference project.
- **Who it is for** — one person tracking their own expenses on their own machine; it is
  not a shared or multi-user tool.
- **Built with** — React + Vite on the frontend, FastAPI + SQLite on the backend.

## The pages

| Page | What it does |
|---|---|
| Dashboard | All-time total, current-month total, and the five most recent expenses |
| Expenses | Add, list, edit, and delete expenses |
| Categories | Add, list, rename, and delete categories |
| Settings | Choose the currency symbol (USD or INR) and switch between the light and dark theme |

## Deliberate limitations

These are choices, not gaps — they keep a learning project small:

- **Single user.** There are no accounts and no notion of "whose" data it is.
- **Local only.** It runs on your machine and is meant to stay there.
- **No authentication.** Nothing guards the API, which is exactly why it must not be put
  on a network. See the security note in [architecture.md](architecture.md).
- **Amounts are floating-point.** Fine for a personal tracker, but summing very many
  values can drift by a fraction of a cent; real financial software would store integer
  cents instead.

## Where to next

- **[setup.md](setup.md)** — prerequisites and how to run both halves of the app.
- **[architecture.md](architecture.md)** — how it fits together, the API reference, and
  why it is built this way.
