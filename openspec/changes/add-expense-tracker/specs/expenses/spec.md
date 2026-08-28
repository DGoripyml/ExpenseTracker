## Purpose

Lets a person record what they spent, on what, and when, so that their individual
spending records can be reviewed, corrected, and summarised over time.

## ADDED Requirements

### Requirement: Record an expense

The system SHALL allow a user to record a new expense consisting of an amount, a
date, a description, and a category chosen from the existing categories. On success
the system SHALL assign the expense a unique identifier and return the stored record.

The amount MUST be greater than zero. The date MUST be a calendar date in `YYYY-MM-DD`
form. The description MUST NOT be empty. The category MUST refer to an existing
category.

#### Scenario: Expense recorded successfully

- **WHEN** a user submits an amount of 42.50, the date 2026-08-28, the description
  "Groceries at market", and an existing category
- **THEN** the system stores the expense, assigns it a unique identifier, and returns
  the complete record including that identifier

#### Scenario: Amount is zero or negative

- **WHEN** a user submits an expense with an amount of 0 or a negative amount
- **THEN** the system rejects the request with a validation error and stores nothing

#### Scenario: Description is empty

- **WHEN** a user submits an expense with an empty or whitespace-only description
- **THEN** the system rejects the request with a validation error and stores nothing

#### Scenario: Category does not exist

- **WHEN** a user submits an expense referring to a category identifier that does not
  exist
- **THEN** the system rejects the request with a validation error and stores nothing

#### Scenario: Date is malformed

- **WHEN** a user submits an expense whose date is not a valid `YYYY-MM-DD` calendar
  date
- **THEN** the system rejects the request with a validation error and stores nothing

### Requirement: List expenses

The system SHALL return all recorded expenses, most recent date first. Each returned
expense SHALL include its identifier, amount, date, description, and the name of its
category so that a list can be displayed without additional lookups.

#### Scenario: Expenses exist

- **WHEN** a user requests the list of expenses and three expenses are recorded
- **THEN** the system returns all three, ordered with the most recent date first, each
  including its category name

#### Scenario: No expenses recorded

- **WHEN** a user requests the list of expenses and none are recorded
- **THEN** the system returns an empty list rather than an error

### Requirement: Edit an expense

The system SHALL allow a user to change the amount, date, description, or category of
an existing expense. The same validation rules that apply when recording an expense
SHALL apply when editing one. The expense identifier SHALL NOT change.

#### Scenario: Expense updated successfully

- **WHEN** a user changes the amount and category of an existing expense to valid
  values
- **THEN** the system stores the new values, keeps the same identifier, and returns
  the updated record

#### Scenario: Editing an expense that does not exist

- **WHEN** a user attempts to edit an expense identifier that does not exist
- **THEN** the system responds that the expense was not found and changes nothing

#### Scenario: Edit fails validation

- **WHEN** a user attempts to change an existing expense's amount to a negative value
- **THEN** the system rejects the request with a validation error and the stored
  expense remains unchanged

### Requirement: Delete an expense

The system SHALL allow a user to permanently delete a single expense. Deleting an
expense SHALL NOT affect its category or any other expense.

#### Scenario: Expense deleted successfully

- **WHEN** a user deletes an existing expense
- **THEN** the system removes it, confirms success, and the expense no longer appears
  in the list of expenses

#### Scenario: Deleting an expense that does not exist

- **WHEN** a user attempts to delete an expense identifier that does not exist
- **THEN** the system responds that the expense was not found and removes nothing

#### Scenario: Category survives expense deletion

- **WHEN** a user deletes the only expense assigned to a category
- **THEN** the category still exists and remains available for new expenses
