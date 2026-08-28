## Why

Everything a reader needs is currently in a single 134-line `README.md` that mixes the
project overview, the setup commands, the four-page tour, the design rationale, and the
full API table. That is already hard to scan, and it is the only place the setup steps
exist, so it has to serve both "what is this?" and "how do I run it?" at once. Splitting
it into a small set of purpose-built documents gives each question one obvious home.

## What Changes

- Add a `docs/` directory containing three documents:
  - `docs/README.md` — what the application is, the four pages, and what it deliberately
    does not do.
  - `docs/architecture.md` — how the pieces fit together and why, including the design
    decisions currently buried in the archived change, and the two behaviours that
    surprise people (a category in use refuses deletion; there are no database
    migrations).
  - `docs/setup.md` — prerequisites and the two-terminal run instructions, including the
    checks that tell you each half is working.
- Slim the root `README.md` to an overview that links into `docs/`, so that each fact
  lives in exactly one place. The setup commands move out rather than being copied.
- Document the OpenSpec workflow using this repository's own history as the worked
  example, now that the archive contains both a change that merged a spec delta into the
  main specs and a change that declares `skip_specs: true`.
- No change to any behaviour, dependency, or configuration. Nothing the running
  application does differs before and after.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change alters documentation only, so no requirement changes and no delta spec
is written. `.openspec.yaml` declares `skip_specs: true` to record that the absence of a
spec delta is deliberate rather than an omission.

## Impact

- `docs/README.md`, `docs/architecture.md`, `docs/setup.md` (new).
- `README.md` (root): reduced to an overview plus links. Its "How this project was built"
  note already points at `openspec/specs/`, which is now a real path, and that reference
  is kept.
- No source file, dependency, or configuration file is touched. The backend, the
  frontend, the database, and the HTTP API are all unaffected.

### Non-goals

- No API reference generated from code. The FastAPI `/docs` endpoint already provides an
  interactive one, and a hand-maintained duplicate would drift.
- No screenshots or diagrams that would need updating whenever the interface changes.
- No contribution guide, changelog, or licence file. This is a single-user learning
  project and none of them has a reader yet.
- No documentation of unbuilt features. `docs/` describes what exists at the time it is
  written, which is why this change deliberately follows the theme toggle rather than
  preceding it.
