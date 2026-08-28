"""Pydantic schemas: the shape of the JSON the API accepts and returns.

These describe the API contract, which is deliberately not the same as the
database tables in models.py. The clearest example is `category_name` below:
it is returned on every expense so the frontend can render a list without a
second request, even though the expenses table only stores `category_id`.

Every model built from a SQLAlchemy row sets `from_attributes=True`, which is
what allows Pydantic to read attributes off an ORM object instead of a dict.
"""

from datetime import date as Date

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryIn(BaseModel):
    """Request body for creating or renaming a category."""

    name: str

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str) -> str:
        """Reject empty or whitespace-only names, and store the trimmed form."""
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("name must not be empty")
        return trimmed


class Category(CategoryIn):
    """A stored category, including its server-assigned id."""

    model_config = ConfigDict(from_attributes=True)

    id: int


class ExpenseIn(BaseModel):
    """Request body for creating or updating an expense."""

    amount: float = Field(gt=0, description="Must be greater than zero.")
    category_id: int
    description: str
    # Accepting `date` rather than `str` means Pydantic rejects malformed and
    # impossible dates (such as 2026-13-45) before any code runs.
    date: Date

    @field_validator("description")
    @classmethod
    def description_must_not_be_blank(cls, value: str) -> str:
        """Reject empty or whitespace-only descriptions, and store the trimmed form."""
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("description must not be empty")
        return trimmed


class Expense(ExpenseIn):
    """A stored expense, including its id and its category's name."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    category_name: str


class Dashboard(BaseModel):
    """The three summary figures shown on the dashboard."""

    total: float
    current_month_total: float
    recent: list[Expense]
