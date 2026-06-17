"""
main.py – FastAPI application entry point for the Signal platform.

Handles request routing, CORS configuration, database initialization,
and orchestrates transaction analysis and reporting.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_reports, init_db, save_report
from llm import generate_financial_report
from models import AnalysisRequest, AnalysisResponse
from rules import analyze_transactions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events manager to initialize resources like the database."""
    init_db()
    yield


app = FastAPI(
    title="Signal – AI-Powered Financial Behavior Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend running on localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root() -> Dict[str, str]:
    """
    Health check endpoint to verify backend status.
    """
    return {"status": "Signal API Running"}


@app.post("/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze(request: AnalysisRequest) -> Dict[str, Any]:
    """
    Analyze financial transactions to detect behavioral patterns,
    generate an AI report, and store the output.
    """
    try:
        # Convert Pydantic transaction models to dicts for rules engine
        transactions_dict = [tx.model_dump() for tx in request.transactions]

        # 1. Detect behavioral signals
        detected_signals = analyze_transactions(transactions_dict)

        # 2. Generate the report utilizing Gemini LLM
        report_result = generate_financial_report(detected_signals)

        # 3. Save report to SQLite database
        save_report(report_result["report"])

        return {
            "key_finding": report_result["key_finding"],
            "signals": detected_signals,
            "report": report_result["report"],
        }
    except Exception as e:
        # Generic error handling to ensure production robustness
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during transaction analysis: {str(e)}",
        )


@app.get("/reports", tags=["Reports"])
async def fetch_reports() -> List[Dict[str, Any]]:
    """
    Retrieve all historically generated financial behavior reports.
    """
    try:
        return get_reports()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve reports: {str(e)}",
        )
