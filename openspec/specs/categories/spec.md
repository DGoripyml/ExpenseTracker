## Purpose

Provides the named buckets that expenses are grouped into, so spending can be
organised and summarised by kind, while protecting categories that are already in use
from accidental removal.

## Requirements

### Requirement: Create a category

The system SHALL allow a user to create a category identified by a name. On success
the system SHALL assign the category a unique identifier and return the stored record.

The name MUST NOT be empty. Category names MUST be unique, compared without regard to
surrounding whitespace.

#### Scenario: Category created successfully

- **WHEN** a user submits the category name "Groceries" and no such category exists
- **THEN** the system stores it, assigns a unique identifier, and returns the record

#### Scenario: Name is empty

- **WHEN** a user submits an empty or whitespace-only category name
- **THEN** the system rejects the request with a validation error and stores nothing

#### Scenario: Name already exists

- **WHEN** a user submits a category name that already exists
- **THEN** the system rejects the request with a conflict error and stores nothing

### Requirement: List categories

The system SHALL return all categories ordered by name so they can be presented as a
stable, predictable list for selection when recording an expense.

#### Scenario: Categories exist

- **WHEN** a user requests the list of categories and three exist
- **THEN** the system returns all three ordered by name

#### Scenario: No categories exist

- **WHEN** a user requests the list of categories and none exist
- **THEN** the system returns an empty list rather than an error

### Requirement: Rename a category

The system SHALL allow a user to change an existing category's name. The uniqueness
and non-empty rules that apply when creating a category SHALL apply when renaming one.
Renaming a category SHALL NOT change which expenses are assigned to it.

#### Scenario: Category renamed successfully

- **WHEN** a user renames an existing category to a name no other category uses
- **THEN** the system stores the new name, keeps the same identifier, and every
  expense previously assigned to that category remains assigned to it

#### Scenario: Renaming to an existing name

- **WHEN** a user renames a category to a name another category already uses
- **THEN** the system rejects the request with a conflict error and the stored name
  remains unchanged

#### Scenario: Renaming a category that does not exist

- **WHEN** a user attempts to rename a category identifier that does not exist
- **THEN** the system responds that the category was not found and changes nothing

### Requirement: Delete an unused category

The system SHALL allow a user to permanently delete a category that has no expenses
assigned to it.

#### Scenario: Unused category deleted successfully

- **WHEN** a user deletes a category with no expenses assigned to it
- **THEN** the system removes it, confirms success, and it no longer appears in the
  list of categories

#### Scenario: Deleting a category that does not exist

- **WHEN** a user attempts to delete a category identifier that does not exist
- **THEN** the system responds that the category was not found and removes nothing

### Requirement: Categories in use are protected from deletion

The system SHALL refuse to delete a category that still has expenses assigned to it.
The refusal SHALL be reported as a conflict and SHALL state how many expenses are
assigned, so the user understands why the deletion was blocked. No expense SHALL be
deleted or reassigned as a side effect of an attempted category deletion.

#### Scenario: Deletion blocked because expenses are assigned

- **WHEN** a user attempts to delete a category that has 40 expenses assigned to it
- **THEN** the system refuses with a conflict error stating that 40 expenses are
  assigned, the category still exists, and all 40 expenses remain unchanged

#### Scenario: Deletion succeeds after the last expense is reassigned

- **WHEN** a user reassigns or deletes every expense belonging to a category and then
  deletes that category
- **THEN** the system removes the category successfully
