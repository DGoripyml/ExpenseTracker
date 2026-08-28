"""Dashboard endpoint: the summary figures, computed in one request."""

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Expense
from app.schemas import Dashboard

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

RECENT_LIMIT = 5


def _current_month_bounds(today: date) -> tuple[str, str]:
    """Return the ISO date range covering the month containing `today`.

    The lower bound is inclusive and the upper bound is exclusive, so the range
    is `first of this month <= date < first of next month`. Because the dates are
    stored as ISO strings, which sort chronologically, this is a plain string
    comparison. Using the year in both bounds is what excludes the same month of
    a different year.
    """
    start = today.replace(day=1)
    if start.month == 12:
        next_month = start.replace(year=start.year + 1, month=1)
    else:
        next_month = start.replace(month=start.month + 1)
    return start.isoformat(), next_month.isoformat()


@router.get("", response_model=Dashboard)
def get_dashboard(db: Session = Depends(get_db)):
    """Return the all-time total, the current-month total, and recent expenses."""
    # coalesce so an empty table reports 0 rather than null.
    total = db.scalar(select(func.coalesce(func.sum(Expense.amount), 0.0)))

    month_start, next_month_start = _current_month_bounds(date.today())
    current_month_total = db.scalar(
        select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
            Expense.date >= month_start,
            Expense.date < next_month_start,
        )
    )

    recent = db.scalars(
        select(Expense)
        .order_by(Expense.date.desc(), Expense.id.desc())
        .limit(RECENT_LIMIT)
    ).all()

    return Dashboard(
        total=total,
        current_month_total=current_month_total,
        recent=recent,
    )
