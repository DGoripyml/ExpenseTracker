"""Category endpoints: create, list, rename, delete."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Category, Expense
from app.schemas import Category as CategoryOut
from app.schemas import CategoryIn

router = APIRouter(prefix="/api/categories", tags=["categories"])


def _name_taken(db: Session, name: str, exclude_id: int | None = None) -> bool:
    """Return True if another category already uses this name."""
    query = select(Category).where(Category.name == name)
    if exclude_id is not None:
        query = query.where(Category.id != exclude_id)
    return db.scalars(query).first() is not None


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryIn, db: Session = Depends(get_db)):
    """Create a category. The name must be unique."""
    if _name_taken(db, payload.name):
        raise HTTPException(
            status_code=409, detail=f"A category named '{payload.name}' already exists"
        )

    category = Category(name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    """Return every category, ordered by name."""
    return db.scalars(select(Category).order_by(Category.name)).all()


@router.put("/{category_id}", response_model=CategoryOut)
def rename_category(
    category_id: int, payload: CategoryIn, db: Session = Depends(get_db)
):
    """Rename a category. Its id and its expenses are unaffected."""
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    if _name_taken(db, payload.name, exclude_id=category_id):
        raise HTTPException(
            status_code=409, detail=f"A category named '{payload.name}' already exists"
        )

    category.name = payload.name
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category, but only when no expenses are assigned to it.

    Refusing is deliberate: cascading would silently destroy expense records,
    and orphaning would push a null category onto every read path.
    """
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    assigned = db.scalar(
        select(func.count()).select_from(Expense).where(
            Expense.category_id == category_id
        )
    )
    if assigned:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Category has {assigned} "
                f"{'expense' if assigned == 1 else 'expenses'} assigned"
            ),
        )

    db.delete(category)
    db.commit()
