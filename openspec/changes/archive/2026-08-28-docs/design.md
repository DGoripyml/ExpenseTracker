## Context

See proposal.md — Why. There is no spec delta; `.openspec.yaml` sets `skip_specs: true`.

The material being reorganised already exists. The root `README.md` is 134 lines with
nine top-level sections, and the archived change at
`openspec/changes/archive/2026-08-28-add-expense-tracker/design.md` holds eight design
decisions with their alternatives considered. Almost nothing here is new writing; the
work is deciding where each existing fact belongs and making sure it ends up in exactly
one place.

The one design-level question worth settling before writing is whether `docs/` becomes
authoritative or merely supplementary, because that decision determines whether the setup
commands can safely exist in two files.

## Goals / Non-Goals

**Goals:**

- Give each fact exactly one home, so no two files can disagree.
- Preserve the facts that are genuinely useful and currently only in the root README —
  particularly the rationale for refusing to delete a category in use, and the "no
  migrations, delete the `.db`" instruction.
- Keep the root `README.md` useful as a GitHub landing page even after slimming.

**Non-Goals:**

- No rewriting of the archived change artifacts. They are history and stay as they are;
  `docs/architecture.md` promotes their conclusions rather than editing or replacing them.
- No documentation tooling, static site generator, or link checker.

## Decisions

### `docs/` is authoritative; the root README links into it

Each fact lives in one file. The root `README.md` keeps the project pitch, a short
orientation, and links onward. The two-terminal setup commands move to `docs/setup.md`
and are not duplicated.

*Alternatives considered.* Leaving the root README intact and letting `docs/` add depth
would keep the landing page rich, but it puts the setup commands in two files, and the
moment one is corrected the other becomes a trap for the next reader — the specific
failure this change exists to prevent. Reducing the root README to nothing but a list of
links was rejected as it makes the landing page say nothing about the project; a visitor
should learn what this is without a second click.

*Trade-off accepted:* the GitHub landing page carries less detail than it does today.

### Three files split by the question each answers

`docs/README.md` answers "what is this?", `docs/setup.md` answers "how do I run it?", and
`docs/architecture.md` answers "how does it work, and why is it built this way?".

Mapping from today's root README:

```
  # Expense Tracker           -->  docs/README.md
  ## Prerequisites            -->  docs/setup.md
  ## Setup and run            -->  docs/setup.md
  ## The four pages           -->  docs/README.md
  ## Things worth knowing      -->  docs/architecture.md
  ## Project layout           -->  docs/architecture.md
  ## API                      -->  docs/architecture.md
  ## How this project was built -->  docs/architecture.md
```

*Alternatives considered.* A single longer `docs/guide.md` would avoid deciding where
anything goes, but reproduces the scanning problem one directory deeper. Splitting further
— a separate `api.md`, a separate `decisions.md` — was rejected as premature for a project
this size; three files is already the point where a reader must choose.

### `docs/architecture.md` explains why, not just what

The existing "Project layout" section is a file tree, which says where code sits but not
why. The archived design decisions say why. Promoting them means a reader gets the
reasoning without excavating `openspec/changes/archive/`.

This is also where the OpenSpec workflow is documented, using this repository's two
completed cycles as the example: the first merged a spec delta into `openspec/specs/`, and
this one declares `skip_specs: true`. The history is a better explanation than prose about
the workflow in the abstract.

### Keep `docs/README.md` rather than `docs/overview.md`

Two files named `README.md` in one repository is mildly confusing, since GitHub renders
both as directory landing pages.

*Alternative considered.* `docs/overview.md` removes that ambiguity. Kept as `README.md`
because it is what was asked for, and because GitHub rendering `docs/` with a landing page
is a small benefit in its own right. Worth revisiting if the ambiguity ever bites.

## Risks / Trade-offs

**Documentation describing code drifts as code changes** → This change is deliberately
sequenced after `add-theme-toggle` so `docs/architecture.md` describes a settled
codebase. It cannot be eliminated, only reduced: any future change that alters structure
should update `docs/architecture.md` in the same cycle.

**The slimmed root README loses something a visitor needed** → Mitigation: the content
mapping above is explicit, and the two high-value facts (the deletion refusal rationale
and the no-migrations instruction) are named as required content in the tasks rather than
left to judgement while editing.

**Links between the four documents break if a file is renamed** → Mitigation: keep
cross-links few and relative, and verify each one resolves as a task rather than assuming.

## Migration Plan

Not applicable. No deployed artefact, no data, no API. Rolling back is deleting `docs/`
and restoring the root `README.md` from git history.

## Open Questions

None.
