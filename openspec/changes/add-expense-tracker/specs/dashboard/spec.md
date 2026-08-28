## Purpose

Gives the user an at-a-glance answer to "how much have I spent, and on what lately"
without reading through the full expense list.

## ADDED Requirements

### Requirement: Report all-time total spending

The system SHALL report the sum of the amounts of every recorded expense.

#### Scenario: Total across several expenses

- **WHEN** expenses of 10.00, 25.50, and 4.50 are recorded and the user views the
  summary
- **THEN** the reported all-time total is 40.00

#### Scenario: Total when nothing is recorded

- **WHEN** no expenses are recorded and the user views the summary
- **THEN** the reported all-time total is 0 rather than blank or an error

### Requirement: Report current-month spending

The system SHALL report the sum of the amounts of expenses dated within the current
calendar month. An expense SHALL be included when its date falls on or after the first
day of the current month and on or before the last day of the current month. Expenses
dated in any other month SHALL be excluded, including expenses dated in the same month
of a different year.

#### Scenario: Only current-month expenses counted

- **WHEN** the current month is August 2026 and expenses exist dated 2026-08-01
  (30.00), 2026-08-28 (12.00), and 2026-07-31 (99.00)
- **THEN** the reported current-month total is 42.00

#### Scenario: Same month in a previous year excluded

- **WHEN** the current month is August 2026 and an expense is dated 2025-08-15
- **THEN** that expense is excluded from the current-month total

#### Scenario: Boundary dates included

- **WHEN** expenses are dated on the first and last calendar days of the current month
- **THEN** both are included in the current-month total

#### Scenario: No expenses in the current month

- **WHEN** expenses exist but none fall in the current month
- **THEN** the reported current-month total is 0 while the all-time total remains
  unchanged

### Requirement: Report recent expenses

The system SHALL report the most recent expenses, most recent date first, limited to at
most five entries. Each SHALL include enough detail to be displayed directly: its
amount, date, description, and category name.

#### Scenario: More than five expenses recorded

- **WHEN** twelve expenses are recorded and the user views the summary
- **THEN** exactly five are reported, being those with the most recent dates, ordered
  most recent first

#### Scenario: Fewer than five expenses recorded

- **WHEN** two expenses are recorded and the user views the summary
- **THEN** both are reported and the absence of further entries is not an error

#### Scenario: No expenses recorded

- **WHEN** no expenses are recorded and the user views the summary
- **THEN** an empty list of recent expenses is reported

### Requirement: Summary reflects current data

The summary SHALL be derived from the stored expenses at the time it is requested, so
that recording, editing, or deleting an expense is reflected the next time the summary
is viewed.

#### Scenario: Summary updates after a new expense

- **WHEN** a user views the summary, records a new expense of 15.00 dated today, then
  views the summary again
- **THEN** both the all-time total and the current-month total have increased by 15.00
  and the new expense appears among the recent expenses

#### Scenario: Summary updates after a deletion

- **WHEN** a user deletes an expense dated in the current month and views the summary
- **THEN** that expense is absent from the recent expenses and both totals have
  decreased by its amount
