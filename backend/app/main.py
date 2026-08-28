"""FastAPI application: creates the tables and mounts the routers."""

from fastapi import FastAPI

from app import models  # noqa: F401  (imported so the tables are registered)
from app.db import Base, engine
from app.routers import categories, dashboard, expenses

# There is no migration tooling in this project. The tables are created from the
# models at startup; changing a model means deleting expenses.db and restarting.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API", version="0.1.0")

app.include_router(categories.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["meta"])
def health():
    """Liveness check, useful for confirming the backend is running."""
    return {"status": "ok"}
