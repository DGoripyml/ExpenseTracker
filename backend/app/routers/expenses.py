"""Expense endpoints: create, list, update, delete."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Category, Expense
from app.schemas import Expense as ExpenseOut
from app.schemas import ExpenseIn

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


def _require_category(db: Session, category_id: int) -> None:
    """Raise 404 unless the category exists."""
    if db.get(Category, category_id) is None:
        raise HTTPException(
            status_code=404, detail=f"Category {category_id} not found"
        )


@router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(payload: ExpenseIn, db: Session = Depends(get_db)):
    """Record a new expense against an existing category."""
    _require_category(db, payload.category_id)

    expense = Expense(
        amount=payload.amount,
        category_id=payload.category_id,
        description=payload.description,
        # Stored as 'YYYY-MM-DD' text; Pydantic already validated the date.
        date=payload.date.isoformat(),
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("", response_model=list[ExpenseOut])
def list_expenses(db: Session = Depends(get_db)):
    """Return every expense, most recent date first."""
    return db.scalars(
        select(Expense).order_by(Expense.date.desc(), Expense.id.desc())
    ).all()


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int, payload: ExpenseIn, db: Session = Depends(get_db)
):
    """Update an expense. The same rules as creating one apply."""
    expense = db.get(Expense, expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    _require_category(db, payload.category_id)

    expense.amount = payload.amount
    expense.category_id = payload.category_id
    expense.description = payload.description
    expense.date = payload.date.isoformat()
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Delete a single expense. Its category is left alone."""
    expense = db.get(Expense, expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
