## ADDED Requirements

### Requirement: Choose a light or dark theme

The system SHALL allow a user to switch the application between a light theme and a
dark theme from the settings page. Exactly one of the two themes SHALL be active at any
time.

The control SHALL be a single toggle labelled with the theme it will switch to, so that
the label states the effect of activating it rather than the state it is reporting.

Both themes SHALL keep text legible against its background, including text drawn on the
accent colour used for the active navigation item and primary buttons.

#### Scenario: Switching to the dark theme

- **WHEN** the light theme is active and a user activates the theme toggle
- **THEN** the dark theme becomes active and the toggle now offers to switch back to the
  light theme

#### Scenario: Switching back to the light theme

- **WHEN** the dark theme is active and a user activates the theme toggle
- **THEN** the light theme becomes active and the toggle now offers to switch to the
  dark theme

#### Scenario: Text on the accent colour stays legible

- **WHEN** either theme is active
- **THEN** the label of the active navigation item and the label of a primary button are
  legible against the accent colour behind them

### Requirement: The theme applies immediately across the whole application

Activating the theme toggle SHALL change the appearance of the entire application at
once, without requiring a reload or navigation to another page. Every part of the
interface SHALL use the active theme, including navigation, cards, tables, forms,
buttons, and error messages.

The theme SHALL affect presentation only. Switching it SHALL NOT alter any stored
expense or category, and SHALL NOT change any displayed amount, date, description, or
category name.

#### Scenario: The change is visible without navigating away

- **WHEN** a user activates the theme toggle on the settings page
- **THEN** the settings page itself is redrawn in the newly chosen theme immediately

#### Scenario: Other pages use the chosen theme

- **WHEN** a user switches theme on the settings page and then opens the dashboard, the
  expenses page, and the categories page
- **THEN** each of those pages is drawn in the chosen theme

#### Scenario: Stored data and displayed values are untouched

- **WHEN** a user switches theme while expenses are listed
- **THEN** no stored expense or category is modified, and every displayed amount, date,
  description, and category name is unchanged

### Requirement: The theme preference persists across sessions

The system SHALL remember the user's theme choice on the device where it was made, so it
remains in effect after the page is reloaded or reopened later. The preference SHALL be
stored locally on the device and SHALL NOT be sent to or stored by the server.

A user who has never chosen a theme SHALL be shown the light theme. The operating
system's own colour-scheme preference SHALL NOT be consulted.

#### Scenario: The preference survives a reload

- **WHEN** a user switches to the dark theme and then reloads the application
- **THEN** the dark theme is still active

#### Scenario: First visit uses the light theme

- **WHEN** a user opens the application on a device with no previously saved theme
  preference
- **THEN** the light theme is active, regardless of how the operating system's own
  colour-scheme preference is set

#### Scenario: A saved preference is unreadable

- **WHEN** the locally stored theme preference is missing or holds an unrecognised value
- **THEN** the application falls back to the light theme instead of failing to load

#### Scenario: The theme preference is independent of the currency preference

- **WHEN** a user changes the theme
- **THEN** the saved currency choice is unaffected, and changing the currency likewise
  leaves the saved theme unaffected
