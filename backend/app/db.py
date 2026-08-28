"""Database engine, session factory, and the request-scoped session dependency.

Everything that knows about connecting to SQLite lives here. Table definitions
live in models.py.
"""

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# The database file sits next to the backend/ folder, not inside app/, so it is
# easy to find and easy to delete when the models change.
DB_PATH = Path(__file__).resolve().parent.parent / "expenses.db"

# check_same_thread=False is required because FastAPI may serve a request on a
# different thread than the one that opened the connection.
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Base class every model inherits from, so SQLAlchemy can find the tables."""


def get_db():
    """Yield a session for one request and always close it afterwards.

    Used by routers as `db: Session = Depends(get_db)`.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
