"""
llm.py – LLM-powered report generator for the Signal platform.

Uses Google Gemini API to analyze behavioral signals and generate
a concise Financial Intelligence Report.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, List
import google.generativeai as genai
from pydantic import BaseModel, Field

# Setup Logger
logger = logging.getLogger(__name__)

# Retrieve API Key from Environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. All LLM calls will use fallback responses.")


class GeminiReportSchema(BaseModel):
    """Pydantic schema to enforce structured response from Gemini API."""
    key_finding: str = Field(description="A single sentence summarizing the most critical finding.")
    reasoning: str = Field(description="Brief explanation of why this finding was reached based on the signals.")
    impact: str = Field(description="The financial consequences/implications of continuing this pattern.")
    suggested_action: str = Field(description="A concrete, actionable step the user can take.")


def _generate_fallback_report(signals: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Generates a deterministic financial report when Gemini API is unavailable or fails.
    """
    if not signals:
        kf = "No significant financial behavioral patterns detected."
        report_md = (
            "### Key Finding\n"
            "No significant behavioral signals or concerning spending patterns were identified.\n\n"
            "### Reasoning\n"
            "Your transaction history does not exhibit patterns of late-night spending, "
            "subscription creeping, weekend overspending, or high merchant/category concentrations.\n\n"
            "### Impact\n"
            "Your spending behavior appears stable, with no immediate indications of budget leakage.\n\n"
            "### Suggested Action\n"
            "Continue tracking your transactions regularly to maintain healthy financial habits."
        )
        return {"key_finding": kf, "report": report_md}

    # Extract the highest confidence signal as the key finding
    top_signal = signals[0]
    sig_name = top_signal.get("signal", "Behavioral Pattern")
    details = top_signal.get("details", "")

    kf = f"Significant indicator of {sig_name} detected in recent transactions."
    
    report_md = (
        f"### Key Finding\n"
        f"{kf}\n\n"
        f"### Reasoning\n"
        f"{details or 'Anomalous concentration or behavior observed for ' + sig_name + '.'}\n\n"
        f"### Impact\n"
        f"Unchecked patterns of this nature can lead to budget variance, unplanned outflows, "
        f"and reduced long-term saving potential.\n\n"
        f"### Suggested Action\n"
        f"Review recent transactions associated with {sig_name}. Set a strict monthly budget "
        f"limit for this specific merchant or category to avoid future overspending."
    )
    
    return {"key_finding": kf, "report": report_md}


def generate_financial_report(signals: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Generate a concise Financial Intelligence Report using Gemini API.

    Args:
        signals: List of detected behavioral signal dictionaries.
                 Each dict has: {"signal": str, "confidence": float, "details": str}

    Returns:
        A dictionary with two keys:
          - "key_finding": The parsed key finding string.
          - "report": A markdown-formatted string with all 4 sections.
    """
    if not GEMINI_API_KEY:
        return _generate_fallback_report(signals)

    if not signals:
        return _generate_fallback_report([])

    # Formulate a structured prompt
    signals_summary = "\n".join(
        f"- {s.get('signal')} (Confidence: {s.get('confidence'):.2f}): {s.get('details')}"
        for s in signals
    )

    prompt = f"""
You are an expert Financial Behavior AI Assistant.
Analyze the following behavioral signals extracted from a user's transactions and generate a concise Financial Intelligence Report.

Detected Signals:
{signals_summary}

Please generate the report structured exactly to fill the schema requirements:
1. Key Finding (A single sentence summarizing the most critical finding)
2. Reasoning (Brief explanation of why this finding was reached based on the signals)
3. Impact (The financial consequences of continuing this pattern)
4. Suggested Action (A concrete, actionable step the user can take)

Rules:
- Keep the overall content concise and focused. The entire combined response must be under 200 words.
- Return response in JSON matching the specified schema format.
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=GeminiReportSchema,
                temperature=0.2,
            ),
        )

        data = json.loads(response.text)
        kf = data.get("key_finding", "").strip()
        reasoning = data.get("reasoning", "").strip()
        impact = data.get("impact", "").strip()
        suggested_action = data.get("suggested_action", "").strip()

        # Build clean markdown report
        report_md = (
            f"### Key Finding\n{kf}\n\n"
            f"### Reasoning\n{reasoning}\n\n"
            f"### Impact\n{impact}\n\n"
            f"### Suggested Action\n{suggested_action}"
        )

        return {
            "key_finding": kf,
            "report": report_md
        }

    except Exception as e:
        logger.error(f"Error calling Gemini API, returning fallback report. Error: {e}", exc_info=True)
        return _generate_fallback_report(signals)
