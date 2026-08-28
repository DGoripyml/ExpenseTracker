# Expense Tracker

A small personal expense tracker: record what you spend, group it into categories, and
see simple totals. Built as a beginner-friendly reference app with React + Vite on the
front and FastAPI + SQLite behind it.

Single user, local only. There is no authentication, so do not expose it to a network.

## Documentation

The full documentation lives in [`docs/`](docs/):

- **[docs/README.md](docs/README.md)** — what the app is, a tour of its four pages, and
  what it deliberately does not do.
- **[docs/setup.md](docs/setup.md)** — prerequisites and how to run it. **Start here to
  get it running.**
- **[docs/architecture.md](docs/architecture.md)** — how the pieces fit together, the API
  reference, and the reasoning behind the design.

## How this project was built

Planned and implemented with [OpenSpec](https://github.com/Fission-AI/OpenSpec). The
behaviour contracts live in `openspec/specs/`, written as testable scenarios that
describe what the app must do independently of how it does it, and the changes that
produced them are in `openspec/changes/`. See the OpenSpec section of
[docs/architecture.md](docs/architecture.md) for how this repository's own history works
as a worked example.
