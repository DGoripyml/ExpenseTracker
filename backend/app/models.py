"""SQLAlchemy models: the shape of the database tables.

These describe storage. The JSON sent over the API is described separately in
schemas.py, which is what lets a response include a category's name even though
the expenses table only stores its id.
"""

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Category(Base):
    """A named bucket that expenses are grouped into."""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    expenses: Mapped[list["Expense"]] = relationship(back_populates="category")


class Expense(Base):
    """A single recorded expense."""

    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id"), nullable=False
    )
    description: Mapped[str] = mapped_column(String, nullable=False)
    # Stored as an ISO 'YYYY-MM-DD' string. SQLite has no date type, and ISO
    # strings sort chronologically, so month filtering is a plain range compare.
    date: Mapped[str] = mapped_column(String, nullable=False)

    category: Mapped["Category"] = relationship(back_populates="expenses")

    @property
    def category_name(self) -> str:
        """The name of this expense's category.

        Exposed so the API response can include the name directly. It is read
        through the relationship above, not stored on this table.
        """
        return self.category.name
