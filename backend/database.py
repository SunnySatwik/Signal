"""
database.py – SQLite and SQLAlchemy database configuration for the Signal platform.

Defines the AnalysisReport table and provides helper functions to manage reports.
"""

from __future__ import annotations

import os
from datetime import datetime
from typing import List
from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Setup database URL in the local directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "signal.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite in multi-threaded environments like FastAPI
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AnalysisReport(Base):
    """
    SQLAlchemy model representing the AnalysisReport table.
    """
    __tablename__ = "analysis_report"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self) -> dict:
        """Convert database record to a standard dictionary."""
        return {
            "id": self.id,
            "report": self.report,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


def init_db() -> None:
    """
    Initializes the SQLite database and creates all tables if they do not exist.
    """
    Base.metadata.create_all(bind=engine)


def save_report(report_text: str) -> dict:
    """
    Save a new report string to the database.

    Args:
        report_text: The markdown report text to save.

    Returns:
        A dictionary representation of the saved AnalysisReport.
    """
    db = SessionLocal()
    try:
        new_report = AnalysisReport(report=report_text)
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return new_report.to_dict()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_reports() -> List[dict]:
    """
    Retrieve all analysis reports from the database ordered by creation date descending.

    Returns:
        A list of dictionaries representing the AnalysisReports.
    """
    db = SessionLocal()
    try:
        reports = db.query(AnalysisReport).order_by(AnalysisReport.created_at.desc()).all()
        return [report.to_dict() for report in reports]
    finally:
        db.close()
