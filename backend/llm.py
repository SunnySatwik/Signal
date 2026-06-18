"""
llm.py – LLM-powered report generator for the Signal platform.

Uses Google Gemini API to analyze behavioral signals and generate
a concise Financial Intelligence Report written in the voice of a
human financial analyst.
"""

import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel, Field

# Load .env from backend directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


# Setup Logger
logger = logging.getLogger(__name__)

# Retrieve API Key from Environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
print("Gemini key loaded:", bool(GEMINI_API_KEY))
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. All LLM calls will use fallback responses.")


class GeminiReportSchema(BaseModel):
    """Pydantic schema to enforce structured response from Gemini API."""
    key_finding: str = Field(
        description="One clear sentence naming the most important spending pattern observed."
    )
    reasoning: str = Field(
        description=(
            "2–3 sentences explaining what the data shows and why it matters. "
            "Reference the specific signals and how they relate to each other. "
            "Write naturally, as a financial analyst would — not like a chatbot."
        )
    )
    impact: str = Field(
        description=(
            "1–2 sentences on the financial consequence of continuing this pattern. "
            "Be specific and realistic. Avoid dramatic or exaggerated language."
        )
    )
    suggested_action: str = Field(
        description=(
            "One concrete, practical recommendation the user can act on this week. "
            "No generic budgeting advice. Make it relevant to the specific signals detected."
        )
    )


# ---------------------------------------------------------------------------
# Fallback report templates (human-sounding)
# ---------------------------------------------------------------------------

_FALLBACK_TEMPLATES: Dict[str, Dict[str, str]] = {
    "Category Concentration": {
        "key_finding": "A single spending category is consuming a disproportionate share of monthly expenses.",
        "reasoning": (
            "The transaction data shows that one category — most likely food delivery — "
            "accounts for a significantly higher portion of total spending than would be typical. "
            "This kind of concentration often builds up gradually and goes unnoticed until "
            "it's compared against the overall budget."
        ),
        "impact": (
            "When a single category dominates spending, it limits flexibility for other expenses "
            "and reduces the amount available for savings or unplanned needs."
        ),
        "suggested_action": (
            "Set a monthly cap for this category and review your last 30 days of transactions "
            "in that area to identify the easiest cuts."
        ),
    },
    "Merchant Dependence": {
        "key_finding": "A single merchant accounts for an unusually high share of all transactions.",
        "reasoning": (
            "One vendor — likely a food delivery platform — appears repeatedly across the "
            "transaction history, suggesting a habitual reliance on that service. "
            "This pattern is common but worth examining, since per-order costs and fees "
            "add up quickly when usage is this frequent."
        ),
        "impact": (
            "Heavy use of a single platform typically means higher per-transaction costs "
            "through delivery fees, surge pricing, and convenience markups."
        ),
        "suggested_action": (
            "Try cooking at home or using alternatives two to three times a week and "
            "track the monthly savings at the end of the period."
        ),
    },
    "Late-Night Spending": {
        "key_finding": "A notable portion of spending is happening during late-night hours.",
        "reasoning": (
            "Many transactions in this dataset are timestamped between 10 PM and 5 AM. "
            "Late-night spending — particularly food delivery — tends to be driven by "
            "convenience rather than necessity, and often involves premium pricing."
        ),
        "impact": (
            "Late-night orders typically cost more than equivalent daytime purchases due to "
            "higher delivery fees and surge pricing, making this an easy area to reduce costs."
        ),
        "suggested_action": (
            "Review how many of these late-night purchases were truly necessary and consider "
            "meal prepping in the evenings to reduce reliance on late-night delivery."
        ),
    },
    "Subscription Creep": {
        "key_finding": "Multiple active subscription services are contributing to a steady monthly outflow.",
        "reasoning": (
            "Several recurring subscription charges appear across the data. While each individual "
            "service seems affordable, the combined monthly cost often becomes significant over time — "
            "particularly when some subscriptions are infrequently used."
        ),
        "impact": (
            "Fixed subscription costs reduce financial flexibility and can accumulate into "
            "a meaningful monthly commitment without feeling like an active decision."
        ),
        "suggested_action": (
            "List all active subscriptions and cancel any that haven't been used in the past 30 days. "
            "Consider consolidating streaming services to one or two at a time."
        ),
    },
    "Weekend Overspending": {
        "key_finding": "Weekend spending is running noticeably higher than weekday averages.",
        "reasoning": (
            "The data shows a consistent gap between weekend and weekday spending. "
            "This is typical when lifestyle expenses — dining, entertainment, and leisure — "
            "cluster around the weekend. The pattern itself isn't problematic, but the "
            "size of the gap is worth understanding."
        ),
        "impact": (
            "Sustained weekend overspending can offset savings made during the week, "
            "making it difficult to build a consistent monthly surplus."
        ),
        "suggested_action": (
            "Set a weekend spending budget and check in mid-week to see if you're on track. "
            "Even a modest cap can meaningfully reduce monthly outflows over time."
        ),
    },
}

_DEFAULT_FALLBACK = {
    "key_finding": "No significant behavioral patterns were identified in the provided transactions.",
    "reasoning": (
        "The transaction data does not show any strong concentration in a single category, "
        "merchant, or time period. Spending appears to be relatively balanced across different "
        "areas, which is generally a positive sign."
    ),
    "impact": "Without clear imbalances, there are no immediate concerns to address.",
    "suggested_action": (
        "Continue tracking your expenses regularly. Consider setting a monthly savings target "
        "to make the most of your current spending balance."
    ),
}


def _generate_fallback_report(signals: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Generate a human-sounding financial report without calling the Gemini API.
    Uses per-signal templates, falling back to a default when no signals detected.
    """
    if not signals:
        template = _DEFAULT_FALLBACK
    else:
        top_signal_name = signals[0].get("signal", "")
        template = _FALLBACK_TEMPLATES.get(top_signal_name, _DEFAULT_FALLBACK)

    kf = template["key_finding"]
    reasoning = template["reasoning"]

    # If multiple signals, briefly mention others in the reasoning
    if len(signals) > 1:
        other_signals = [s.get("signal", "") for s in signals[1:3]]
        others_str = " and ".join(other_signals)
        reasoning += (
            f" Additionally, the analysis identified {others_str}, "
            f"which may compound the primary finding."
        )

    impact = template["impact"]
    action = template["suggested_action"]

    report_md = (
        f"### Key Finding\n{kf}\n\n"
        f"### Reasoning\n{reasoning}\n\n"
        f"### Impact\n{impact}\n\n"
        f"### Suggested Action\n{action}"
    )

    return {"key_finding": kf, "report": report_md}


# ---------------------------------------------------------------------------
# Main report generator
# ---------------------------------------------------------------------------

def generate_financial_report(signals: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Generate a concise Financial Intelligence Report using Gemini API.

    Args:
        signals: List of detected behavioral signal dictionaries.
                 Each dict has: {"signal": str, "confidence": float, "details": str}

    Returns:
        A dictionary with:
          - "key_finding": The parsed key finding string.
          - "report": A markdown-formatted string with all 4 sections.
    """
    if not GEMINI_API_KEY:
        return _generate_fallback_report(signals)

    if not signals:
        return _generate_fallback_report([])

    # Build a clean signals summary for the prompt
    signals_summary = "\n".join(
        f"- {s.get('signal')}: {s.get('details')}"
        for s in signals
    )

    prompt = f"""You are a financial behavior analyst reviewing a client's recent transaction data.
Your job is to write a concise, professional report based on the behavioral signals listed below.

Detected Signals:
{signals_summary}

Instructions:
- Write as a financial analyst, not as an AI assistant.
- Reference the specific signals and explain how they relate to each other.
- Avoid generic advice like "create a budget" — make recommendations specific to what was detected.
- Do not use buzzwords, psychological claims, or dramatic language.
- Keep the entire report under 150 words total across all sections.
- Return your response as JSON matching the required schema.

The report must include:
1. key_finding – One sentence naming the most important spending pattern.
2. reasoning – 2–3 sentences explaining what the data shows and why it matters.
3. impact – 1–2 sentences on the realistic financial consequence of this pattern.
4. suggested_action – One specific, actionable recommendation for this week.
"""

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=GeminiReportSchema,
                temperature=0.3,
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
            "report": report_md,
        }

    except Exception as e:
        logger.error(
            f"Error calling Gemini API, returning fallback report. Error: {e}",
            exc_info=True,
        )
        return _generate_fallback_report(signals)
