## Purpose

Holds the display preference a user can adjust — which currency symbol monetary amounts
are shown with — and keeps it in effect across visits so the app reads the way they
chose.

## ADDED Requirements

### Requirement: Choose a currency symbol

The system SHALL allow a user to choose which currency symbol is used when displaying
monetary amounts, offering US dollars and Indian rupees. Every displayed amount in the
application SHALL use the chosen symbol.

#### Scenario: Selecting Indian rupees

- **WHEN** a user selects the Indian rupee option
- **THEN** amounts throughout the application are displayed prefixed with the rupee
  symbol

#### Scenario: Selecting US dollars

- **WHEN** a user selects the US dollar option
- **THEN** amounts throughout the application are displayed prefixed with the dollar
  symbol

### Requirement: Currency choice changes presentation only

Changing the currency symbol SHALL NOT alter any stored expense amount and SHALL NOT
convert amounts between currencies. The numeric value displayed for an expense SHALL be
identical regardless of which currency symbol is selected.

#### Scenario: Amount is not converted

- **WHEN** an expense of 42.50 is displayed as "$42.50" and the user switches the
  currency setting to Indian rupees
- **THEN** the same expense is displayed with the rupee symbol and the numeric value
  remains 42.50, with no exchange rate applied

#### Scenario: Stored data is untouched

- **WHEN** a user changes the currency setting
- **THEN** no stored expense or category is modified

### Requirement: The currency preference persists across sessions

The system SHALL remember the user's currency choice on the device where it was made, so
it remains in effect after the page is reloaded or reopened later. The preference SHALL
be stored locally on the device and SHALL NOT be sent to or stored by the server.

#### Scenario: The preference survives a reload

- **WHEN** a user selects Indian rupees, then reloads the application
- **THEN** the rupee symbol is still in effect

#### Scenario: First visit uses the default

- **WHEN** a user opens the application on a device with no previously saved preference
- **THEN** the application starts with the US dollar symbol without reporting an error

#### Scenario: A saved preference is unreadable

- **WHEN** the locally stored preference is missing or holds an unrecognised value
- **THEN** the application falls back to the US dollar symbol instead of failing to load
