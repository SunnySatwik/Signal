"""
rules.py – Behavioral rule engine for the Signal platform.

Each rule function accepts a list of transaction dicts (keys: amount, merchant,
category, timestamp) and returns a signal dict on detection, or None otherwise.

analyze_transactions() runs all rules and returns a prioritised list of up to 4
detected signals.
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
# Known subscription services
# ---------------------------------------------------------------------------

KNOWN_SUBSCRIPTION_MERCHANTS = {
    "netflix", "spotify", "amazon prime", "youtube premium", "prime video",
    "apple tv", "apple music", "disney+", "disney plus", "hotstar",
    "zee5", "sonyliv", "jiocinema", "linkedin premium", "google one",
    "dropbox", "adobe", "microsoft 365", "office 365", "slack",
    "notion", "grammarly", "duolingo", "headspace", "calm",
}


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
# Rule 1 – Category concentration (single category > 35 % of spending)
# ---------------------------------------------------------------------------

def detect_category_concentration(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Detect when a single spending category exceeds 35% of total expenditure.

    Threshold lowered from 40% → 35% to catch realistic heavy-category spending.
    """
    if not transactions:
        return None

    category_spend: Dict[str, float] = {}
    total_spend = 0.0

    for txn in transactions:
        category = txn.get("category", "").strip()
        amount = txn.get("amount", 0)
        if not category or amount <= 0:
            continue
        category_spend[category] = category_spend.get(category, 0) + amount
        total_spend += amount

    if total_spend == 0 or not category_spend:
        return None

    top_category = max(category_spend, key=lambda c: category_spend[c])
    top_spend = category_spend[top_category]
    ratio = top_spend / total_spend

    if ratio <= 0.35:
        return None

    confidence = min(0.50 + (ratio - 0.35) * 1.8, 0.99)

    return _build_signal(
        signal="Category Concentration",
        confidence=confidence,
        details=(
            f"A disproportionate {ratio:.0%} of total spending "
            f"(₹{top_spend:,.0f} out of ₹{total_spend:,.0f}) is concentrated "
            f"in the '{top_category}' category. This level of concentration "
            f"leaves little room for balanced financial planning and suggests "
            f"a lifestyle heavily dependent on one spending area."
        ),
    )


# ---------------------------------------------------------------------------
# Rule 2 – Merchant dependence (single merchant > 25% of transactions)
# ---------------------------------------------------------------------------

def detect_merchant_dependence(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Detect when a single merchant accounts for more than 25% of transactions.

    Threshold lowered from 30% → 25% to catch Swiggy-heavy datasets.
    """
    if not transactions:
        return None

    merchant_counts: Counter = Counter(
        txn.get("merchant", "").strip().lower()
        for txn in transactions
        if txn.get("merchant", "").strip()
    )

    if not merchant_counts:
        return None

    top_merchant_lower, top_count = merchant_counts.most_common(1)[0]
    ratio = top_count / len(transactions)

    if ratio <= 0.25:
        return None

    # Find original-case merchant name
    top_merchant_display = next(
        (txn.get("merchant", "").strip() for txn in transactions
         if txn.get("merchant", "").strip().lower() == top_merchant_lower),
        top_merchant_lower.title()
    )

    merchant_spend = sum(
        txn.get("amount", 0)
        for txn in transactions
        if txn.get("merchant", "").strip().lower() == top_merchant_lower
    )
    confidence = min(0.50 + (ratio - 0.25) * 2.0, 0.99)

    return _build_signal(
        signal="Merchant Dependence",
        confidence=confidence,
        details=(
            f"'{top_merchant_display}' appears in {top_count} out of "
            f"{len(transactions)} transactions ({ratio:.0%}), accounting for "
            f"₹{merchant_spend:,.0f} in total spend. A single merchant representing "
            f"this volume of activity often reflects habitual or convenience-driven "
            f"purchasing that may be worth revisiting."
        ),
    )


# ---------------------------------------------------------------------------
# Rule 3 – Late-night spending (22:00 – 04:59)
# ---------------------------------------------------------------------------

def detect_late_night_spending(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Detect spending that occurs between 10 PM and 5 AM.

    Signal fires as soon as any late-night spending is found.
    Confidence scales with the proportion of late-night transactions.
    """
    if not transactions:
        return None

    late_night: List[Transaction] = []
    timed_transactions = 0

    for txn in transactions:
        dt = _parse_timestamp(txn.get("timestamp", ""))
        if dt is None:
            continue
        timed_transactions += 1
        hour = dt.hour
        # 22:00 – 23:59  and  00:00 – 04:59
        if hour >= 22 or hour < 5:
            late_night.append(txn)

    if not late_night or timed_transactions == 0:
        return None

    ratio = len(late_night) / timed_transactions
    total_spent = sum(t.get("amount", 0) for t in late_night)

    # Base confidence 0.55 for any occurrence; scales up with ratio
    confidence = min(0.55 + ratio * 0.45, 0.99)

    return _build_signal(
        signal="Late-Night Spending",
        confidence=confidence,
        details=(
            f"{len(late_night)} of {timed_transactions} transactions "
            f"({ratio:.0%}) occurred between 10 PM and 5 AM, "
            f"totalling ₹{total_spent:,.0f}. Ordering food or making purchases "
            f"late at night often reflects convenience-driven habits that can "
            f"add up significantly over a month."
        ),
    )


# ---------------------------------------------------------------------------
# Rule 4 – Subscription creep
# ---------------------------------------------------------------------------

def detect_subscription_creep(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Detect active subscription services.

    Two detection paths:
      A) Known subscription merchants present in the data (even single month).
      B) Any merchant appearing across ≥ 2 distinct calendar months.

    Path A fires for demo datasets where only one month of data exists.
    """
    if not transactions:
        return None

    # --- Path A: known subscription services ---
    known_subs_found: Dict[str, float] = {}
    for txn in transactions:
        merchant = txn.get("merchant", "").strip()
        amount = txn.get("amount", 0)
        if not merchant or amount <= 0:
            continue
        if merchant.lower() in KNOWN_SUBSCRIPTION_MERCHANTS:
            known_subs_found[merchant] = known_subs_found.get(merchant, 0) + amount

    # --- Path B: merchants recurring across multiple months ---
    merchant_months: Dict[str, set] = {}
    for txn in transactions:
        merchant = txn.get("merchant", "").strip()
        if not merchant:
            continue
        dt = _parse_timestamp(txn.get("timestamp", ""))
        if dt is None:
            continue
        merchant_months.setdefault(merchant, set()).add((dt.year, dt.month))

    recurring_multi_month = {
        m: months for m, months in merchant_months.items() if len(months) >= 2
    }

    # Merge results
    all_sub_merchants: Dict[str, float] = dict(known_subs_found)
    for merchant in recurring_multi_month:
        if merchant not in all_sub_merchants:
            spend = sum(
                txn.get("amount", 0)
                for txn in transactions
                if txn.get("merchant", "").strip() == merchant
            )
            all_sub_merchants[merchant] = spend

    if not all_sub_merchants:
        return None

    total_sub_spend = sum(all_sub_merchants.values())
    count = len(all_sub_merchants)

    # Confidence: 0.55 base + 0.1 per service, capped at 0.95
    confidence = min(0.55 + count * 0.10, 0.95)

    merchant_list = ", ".join(sorted(all_sub_merchants.keys()))

    return _build_signal(
        signal="Subscription Creep",
        confidence=confidence,
        details=(
            f"{count} active subscription service(s) identified: {merchant_list}. "
            f"Combined monthly spend on these services totals ₹{total_sub_spend:,.0f}. "
            f"Subscription costs tend to be overlooked because they're small individually "
            f"but can accumulate into a significant fixed monthly outflow."
        ),
    )


# ---------------------------------------------------------------------------
# Rule 5 – Weekend overspending
# ---------------------------------------------------------------------------

def detect_weekend_overspending(transactions: List[Transaction]) -> Optional[SignalResult]:
    """
    Compare average daily spending on weekends (Sat/Sun) vs weekdays (Mon–Fri).

    Returns a signal when weekend daily average exceeds weekday daily average
    by more than 15% (lowered from 20%).
    """
    if not transactions:
        return None

    weekend_totals: Dict[str, float] = {}
    weekday_totals: Dict[str, float] = {}

    for txn in transactions:
        dt = _parse_timestamp(txn.get("timestamp", ""))
        if dt is None:
            continue
        amount = txn.get("amount", 0)
        if amount <= 0:
            continue
        date_key = dt.strftime("%Y-%m-%d")

        if dt.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            weekend_totals[date_key] = weekend_totals.get(date_key, 0) + amount
        else:
            weekday_totals[date_key] = weekday_totals.get(date_key, 0) + amount

    if not weekend_totals or not weekday_totals:
        return None

    avg_weekend = sum(weekend_totals.values()) / len(weekend_totals)
    avg_weekday = sum(weekday_totals.values()) / len(weekday_totals)

    if avg_weekday == 0 or avg_weekend <= avg_weekday * 1.15:
        return None

    overspend_ratio = (avg_weekend - avg_weekday) / avg_weekday
    confidence = min(0.45 + overspend_ratio * 0.55, 0.95)

    return _build_signal(
        signal="Weekend Overspending",
        confidence=confidence,
        details=(
            f"Average weekend daily spending (₹{avg_weekend:,.0f}) is "
            f"{overspend_ratio:.0%} higher than the weekday average "
            f"(₹{avg_weekday:,.0f}). This pattern suggests spending "
            f"relaxes significantly on weekends, which can silently erode "
            f"monthly budgets without feeling like a conscious choice."
        ),
    )


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

# Priority order: Category Concentration → Merchant Dependence →
#                 Late Night → Subscription Creep → Weekend Overspending
_RULES_PRIORITY = [
    detect_category_concentration,
    detect_merchant_dependence,
    detect_late_night_spending,
    detect_subscription_creep,
    detect_weekend_overspending,
]

_MAX_SIGNALS = 4


def analyze_transactions(transactions: List[Transaction]) -> List[SignalResult]:
    """
    Run all behavioural rules against the provided transactions.

    Rules are evaluated in priority order (most impactful first).
    Returns up to 4 detected signals in that priority order.

    Args:
        transactions: List of transaction dicts with keys:
                      amount, merchant, category, timestamp.

    Returns:
        A list of up to 4 detected signal dicts, ordered by rule priority.
    """
    detected: List[SignalResult] = []

    for rule in _RULES_PRIORITY:
        if len(detected) >= _MAX_SIGNALS:
            break
        result = rule(transactions)
        if result is not None:
            detected.append(result)

    return detected
