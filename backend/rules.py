"""
rules.py – Behavioral rule engine for the Signal platform.

Each rule function accepts a list of transaction dicts (keys: amount, merchant,
category, timestamp) and returns a signal dict on detection, or None otherwise.

analyze_transactions() runs all rules and returns a list of detected signals.
"""

from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Type aliases
# ---------------------------------------------------------------------------

Transaction = Dict[str, Any]
SignalResult = Dict[str, Any]


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _parse_timestamp(ts: str) -> Optional[datetime]:
    """Parse an ISO 8601 timestamp string, returning None on failure."""
    for fmt in (
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%d %H:%M:%S",
    ):
        try:
            return datetime.strptime(ts, fmt)
        except ValueError:
            continue
    return None


def _build_signal(signal: str, confidence: float, details: str) -> SignalResult:
    """Construct a normalised signal dict."""
    return {
        "signal": signal,
        "confidence": round(max(0.0, min(1.0, confidence)), 4),
        "details": details,
    }


# ---------------------------------------------------------------------------
# Rule 1 – Late-night spending (22:00 – 04:59)
# ---------------------------------------------------------------------------

def detect_late_night_spending(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Detect spending that occurs between 10 PM and 5 AM.

    Returns a signal when at least one late-night transaction is found.
    Confidence scales with the proportion of late-night transactions.
    """
    if not transactions:
        return None

    late_night: List[Transaction] = []

    for txn in transactions:
        dt = _parse_timestamp(txn.get("timestamp", ""))
        if dt is None:
            continue
        hour = dt.hour
        # 22:00 – 23:59  and  00:00 – 04:59
        if hour >= 22 or hour < 5:
            late_night.append(txn)

    if not late_night:
        return None

    ratio = len(late_night) / len(transactions)
    total_spent = sum(t.get("amount", 0) for t in late_night)
    confidence = min(0.5 + ratio * 0.5, 1.0)

    return _build_signal(
        signal="Late-Night Spending",
        confidence=confidence,
        details=(
            f"{len(late_night)} of {len(transactions)} transactions "
            f"({ratio:.0%}) occurred between 10 PM and 5 AM, "
            f"totalling {total_spent:.2f}. Late-night spending is associated "
            f"with impulsive or emotionally-driven purchases."
        ),
    )


# ---------------------------------------------------------------------------
# Rule 2 – Subscription creep (recurring monthly merchants)
# ---------------------------------------------------------------------------

def detect_subscription_creep(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Detect merchants that appear in multiple distinct calendar months,
    which is a strong indicator of recurring subscriptions.

    A merchant must appear in ≥ 2 months to be flagged.
    """
    if not transactions:
        return None

    # merchant → set of (year, month) tuples
    merchant_months: Dict[str, set] = {}

    for txn in transactions:
        merchant = txn.get("merchant", "").strip()
        if not merchant:
            continue
        dt = _parse_timestamp(txn.get("timestamp", ""))
        if dt is None:
            continue
        merchant_months.setdefault(merchant, set()).add((dt.year, dt.month))

    recurring = {m: months for m, months in merchant_months.items() if len(months) >= 2}

    if not recurring:
        return None

    total_recurring_spend = sum(
        txn.get("amount", 0)
        for txn in transactions
        if txn.get("merchant", "").strip() in recurring
    )
    count = len(recurring)
    confidence = min(0.4 + count * 0.1, 1.0)

    merchant_summary = ", ".join(
        f"{m} ({len(months)} months)" for m, months in sorted(recurring.items())
    )

    return _build_signal(
        signal="Subscription Creep",
        confidence=confidence,
        details=(
            f"{count} recurring merchant(s) detected across multiple months: "
            f"{merchant_summary}. Total recurring spend: {total_recurring_spend:.2f}. "
            f"Review these subscriptions to identify unused or forgotten services."
        ),
    )


# ---------------------------------------------------------------------------
# Rule 3 – Weekend overspending
# ---------------------------------------------------------------------------

def detect_weekend_overspending(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Compare average daily spending on weekends (Sat/Sun) vs weekdays (Mon–Fri).

    Returns a signal when weekend daily average exceeds weekday daily average
    by more than 20%.
    """
    if not transactions:
        return None

    weekend_totals: Dict[str, float] = {}  # date string → amount
    weekday_totals: Dict[str, float] = {}

    for txn in transactions:
        dt = _parse_timestamp(txn.get("timestamp", ""))
        if dt is None:
            continue
        amount = txn.get("amount", 0)
        date_key = dt.strftime("%Y-%m-%d")

        if dt.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            weekend_totals[date_key] = weekend_totals.get(date_key, 0) + amount
        else:
            weekday_totals[date_key] = weekday_totals.get(date_key, 0) + amount

    if not weekend_totals or not weekday_totals:
        return None

    avg_weekend = sum(weekend_totals.values()) / len(weekend_totals)
    avg_weekday = sum(weekday_totals.values()) / len(weekday_totals)

    if avg_weekday == 0 or avg_weekend <= avg_weekday * 1.20:
        return None

    overspend_ratio = (avg_weekend - avg_weekday) / avg_weekday
    confidence = min(0.4 + overspend_ratio * 0.6, 1.0)

    return _build_signal(
        signal="Weekend Overspending",
        confidence=confidence,
        details=(
            f"Average weekend daily spend ({avg_weekend:.2f}) is "
            f"{overspend_ratio:.0%} higher than weekday average ({avg_weekday:.2f}). "
            f"Consistent weekend overspending can silently erode monthly budgets."
        ),
    )


# ---------------------------------------------------------------------------
# Rule 4 – Merchant dependence (single merchant > 30 % of transactions)
# ---------------------------------------------------------------------------

def detect_merchant_dependence(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Detect when a single merchant accounts for more than 30% of all transactions.

    High merchant concentration may indicate reliance on a single vendor
    or a habitual, potentially impulsive spending pattern.
    """
    if not transactions:
        return None

    merchant_counts: Counter = Counter(
        txn.get("merchant", "").strip() for txn in transactions if txn.get("merchant", "").strip()
    )

    if not merchant_counts:
        return None

    top_merchant, top_count = merchant_counts.most_common(1)[0]
    ratio = top_count / len(transactions)

    if ratio <= 0.30:
        return None

    merchant_spend = sum(
        txn.get("amount", 0)
        for txn in transactions
        if txn.get("merchant", "").strip() == top_merchant
    )
    confidence = min(0.4 + (ratio - 0.30) * 2.0, 1.0)

    return _build_signal(
        signal="Merchant Dependence",
        confidence=confidence,
        details=(
            f"'{top_merchant}' accounts for {top_count} of {len(transactions)} "
            f"transactions ({ratio:.0%}) with a total spend of {merchant_spend:.2f}. "
            f"Heavy reliance on a single merchant may reflect habitual or "
            f"compulsive spending behaviour."
        ),
    )


# ---------------------------------------------------------------------------
# Rule 5 – Category concentration (single category > 40 % of spending)
# ---------------------------------------------------------------------------

def detect_category_concentration(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Detect when a single spending category exceeds 40% of total expenditure.

    Extreme category concentration signals a potential imbalance in spending
    priorities or a lifestyle area that warrants closer attention.
    """
    if not transactions:
        return None

    category_spend: Dict[str, float] = {}
    total_spend = 0.0

    for txn in transactions:
        category = txn.get("category", "").strip()
        amount = txn.get("amount", 0)
        if not category:
            continue
        category_spend[category] = category_spend.get(category, 0) + amount
        total_spend += amount

    if total_spend == 0 or not category_spend:
        return None

    top_category = max(category_spend, key=lambda c: category_spend[c])
    top_spend = category_spend[top_category]
    ratio = top_spend / total_spend

    if ratio <= 0.40:
        return None

    confidence = min(0.4 + (ratio - 0.40) * 1.5, 1.0)

    return _build_signal(
        signal="Category Concentration",
        confidence=confidence,
        details=(
            f"The '{top_category}' category accounts for {top_spend:.2f} "
            f"({ratio:.0%}) of total spending ({total_spend:.2f}). "
            f"A single category dominating expenditure may indicate an "
            f"imbalanced financial lifestyle."
        ),
    )


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

_RULES = [
    detect_late_night_spending,
    detect_subscription_creep,
    detect_weekend_overspending,
    detect_merchant_dependence,
    detect_category_concentration,
]


def analyze_transactions(transactions: List[Transaction]) -> List[SignalResult]:
    """
    Run all behavioural rules against the provided transactions.

    Args:
        transactions: List of transaction dicts, each with keys:
                      amount, merchant, category, timestamp.

    Returns:
        A list of detected signal dicts, sorted by confidence (descending).
        Returns an empty list when no signals are detected.
    """
    detected: List[SignalResult] = []

    for rule in _RULES:
        result = rule(transactions)
        if result is not None:
            detected.append(result)

    detected.sort(key=lambda s: s["confidence"], reverse=True)
    return detected
