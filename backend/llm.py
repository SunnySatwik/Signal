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
    Generate a data-driven, human-sounding fallback report.
    Extracts actual numbers from signal detail strings for specificity.
    """
    if not signals:
        template = _DEFAULT_FALLBACK
        kf = template["key_finding"]
        reasoning = template["reasoning"]
        impact = template["impact"]
        action = template["suggested_action"]
        report_md = (
            f"### Key Finding\n{kf}\n\n"
            f"### Reasoning\n{reasoning}\n\n"
            f"### Impact\n{impact}\n\n"
            f"### Suggested Action\n{action}"
        )
        return {"key_finding": kf, "report": report_md}

    top = signals[0]
    top_name = top.get("signal", "")
    top_details = top.get("details", "")

    # Build signal index for cross-referencing
    signal_names = [s.get("signal", "") for s in signals]
    has_merchant = any("Merchant" in n for n in signal_names)
    has_subscription = any("Subscription" in n for n in signal_names)
    has_late_night = any("Late" in n for n in signal_names)
    has_weekend = any("Weekend" in n for n in signal_names)

    # Use the top signal's details as the basis for the key finding
    # Craft specific language using the details string directly
    if top_name == "Category Concentration":
        kf = (
            f"A single spending category is consuming a disproportionate share of total expenses — "
            f"review the details below for exact figures."
        )
        reasoning = top_details
        if has_merchant:
            merchant_details = next(
                (s.get("details", "") for s in signals if "Merchant" in s.get("signal", "")), ""
            )
            reasoning += f" This aligns with the merchant concentration finding: {merchant_details}"
        impact = (
            "When a single category absorbs this share of spending, it leaves little room "
            "to absorb unexpected costs or redirect money toward savings."
        )
        action = (
            "Review your last 30 days of spending in this category, identify the top 3 recurring "
            "merchants, and set a hard monthly cap for each."
        )

    elif top_name == "Merchant Dependence":
        kf = (
            "A single merchant dominates transaction frequency — "
            "this level of reliance warrants closer attention."
        )
        reasoning = top_details
        if has_subscription:
            sub_details = next(
                (s.get("details", "") for s in signals if "Subscription" in s.get("signal", "")), ""
            )
            reasoning += f" Subscription services are also a contributing factor: {sub_details}"
        impact = (
            "Repeated use of a single platform typically incurs premium delivery fees, "
            "surge charges, and convenience markups that wouldn't apply to alternatives."
        )
        action = (
            "Identify the top merchant from the signal above and try replacing a portion of "
            "those orders with lower-cost alternatives or home preparation over the next two weeks."
        )

    elif top_name == "Late-Night Spending":
        kf = "A significant portion of transactions occurred during late-night hours, adding to total spend."
        reasoning = top_details
        impact = (
            "Late-night purchases — particularly food delivery — often carry higher delivery fees "
            "and surge pricing compared to daytime equivalents."
        )
        action = (
            "Review the late-night transactions in detail and identify how many were truly "
            "necessary. Consider preparing meals in advance to reduce reliance on late-night delivery."
        )

    elif top_name == "Subscription Creep":
        kf = "Multiple active subscription services are creating a recurring monthly outflow."
        reasoning = top_details
        impact = (
            "Subscription costs are easy to overlook because they feel small in isolation, "
            "but the aggregate figure can represent a meaningful fixed commitment each month."
        )
        action = (
            "List all active subscriptions identified above and cancel any not used in the past month. "
            "Consider pausing rather than maintaining multiple streaming services simultaneously."
        )

    elif top_name == "Weekend Overspending":
        kf = "Weekend spending is consistently higher than weekday spending on a per-day basis."
        reasoning = top_details
        impact = (
            "Recurring weekend overspending can cancel out savings accumulated during the week, "
            "making it difficult to build a surplus month over month."
        )
        action = (
            "Set a specific daily spending limit for weekends and review your last four "
            "weekends to understand which categories are driving the gap."
        )

    else:
        template = _FALLBACK_TEMPLATES.get(top_name, _DEFAULT_FALLBACK)
        kf = template["key_finding"]
        reasoning = template["reasoning"]
        impact = template["impact"]
        action = template["suggested_action"]

    # Append secondary signal context if multiple signals detected
    secondary = [s for s in signals[1:] if s.get("signal", "") != top_name]
    if secondary:
        secondary_names = " and ".join(s.get("signal", "") for s in secondary[:2])
        reasoning += (
            f" The analysis also detected {secondary_names}, "
            f"which may be contributing to the same underlying spending pressure."
        )

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
Your job is to write a precise, evidence-based report using the data from the detected signals below.

Detected Signals:
{signals_summary}

Critical instructions:
- Quote ACTUAL numbers from the signals above: percentages, rupee amounts, transaction counts, merchant names.
  Example: "Swiggy represents 41% of all transactions and ₹25,688 in spending" — not vague statements.
- Write like a financial analyst who has reviewed the data — professional, direct, no buzzwords.
- Explain how the signals RELATE to each other if multiple are detected.
- The recommended action must be specific to the top merchant/category/signal found — not generic.
- Do NOT say "create a budget", "track expenses", or use phrases like "financial wellness".
- Do NOT make psychological assumptions about why the user spends this way.
- Keep the entire report under 150 words total.
- Return response as JSON matching the schema.

The report must include:
1. key_finding – One clear sentence with actual figures from the data.
2. reasoning – 2–3 sentences referencing specific merchants, categories, percentages, and counts.
3. impact – 1–2 sentences on the realistic financial consequence.
4. suggested_action – One actionable recommendation referencing the specific merchant/category identified.
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
