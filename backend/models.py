from pydantic import BaseModel, Field
from typing import List


class Transaction(BaseModel):
    """Represents a single financial transaction."""

    amount: float = Field(..., description="Transaction amount in the user's currency.")
    merchant: str = Field(..., description="Name of the merchant or payee.")
    category: str = Field(..., description="Spending category (e.g., 'Food', 'Travel', 'Utilities').")
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp of the transaction.")


class AnalysisRequest(BaseModel):
    """Request payload containing transactions to be analyzed."""

    transactions: List[Transaction] = Field(
        ...,
        description="List of financial transactions to analyze for behavioral signals.",
    )


class Signal(BaseModel):
    """A single behavioral or financial signal derived from transaction analysis."""

    signal: str = Field(..., description="Short label identifying the detected signal (e.g., 'Impulse Spending').")
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score for this signal, between 0.0 (low) and 1.0 (high).",
    )
    details: str = Field(..., description="Human-readable explanation of why this signal was detected.")


class AnalysisResponse(BaseModel):
    """Response payload containing the full behavioral intelligence analysis."""

    key_finding: str = Field(
        ...,
        description="The single most important insight derived from the transaction analysis.",
    )
    signals: List[Signal] = Field(
        ...,
        description="List of behavioral and financial signals identified in the transactions.",
    )
    report: str = Field(
        ...,
        description="Comprehensive narrative report summarizing the financial behavior analysis.",
    )
