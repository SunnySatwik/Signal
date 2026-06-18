/**
 * hooks/useAnalysis.ts – React hook that orchestrates the full analysis flow.
 *
 * Responsibilities:
 *  - Accepts frontend Transaction[] as input
 *  - Calls analyzeTransactions() from the API layer
 *  - Exposes loading, error, and result state to the consuming component
 *  - Derives a BehavioralSignal[] and AIInsight from the ApiAnalysisResponse
 *    so that the existing Dashboard UI requires minimal changes
 */

import { useCallback, useState } from "react";
import { analyzeTransactions } from "../lib/api";
import type {
  AIInsight,
  AnalysisStats,
  ApiAnalysisResponse,
  ApiSignal,
  BehavioralSignal,
  Transaction,
} from "../types";

// ─── Signal icon mapping ───────────────────────────────────────────────────────

function resolveSignalIcon(signalName: string): string {
  const lower = signalName.toLowerCase();
  if (lower.includes("night") || lower.includes("late")) return "Moon";
  if (lower.includes("subscription") || lower.includes("recurring")) return "Repeat";
  if (lower.includes("weekend") || lower.includes("spark")) return "Sparkles";
  if (lower.includes("impulse") || lower.includes("dopamine")) return "Zap";
  if (lower.includes("merchant") || lower.includes("depend")) return "Building";
  if (lower.includes("category") || lower.includes("concent")) return "Zap";
  return "Building";
}

// ─── Conversion helpers ────────────────────────────────────────────────────────

/**
 * Map ApiSignal[] → BehavioralSignal[] so the existing Dashboard renders
 * signals straight from the API without a full rewrite.
 */
function toBehavioralSignals(apiSignals: ApiSignal[]): BehavioralSignal[] {
  return apiSignals.map((s, idx) => ({
    id: `api_signal_${idx}`,
    title: s.signal,
    category: resolveSignalCategory(s.signal),
    description: s.details,
    confidence: Math.round(s.confidence * 100), // 0–1 → 0–100
    trend: "increasing" as const,
    icon: resolveSignalIcon(s.signal),
    impact: s.confidence > 0.75 ? "High" : s.confidence > 0.5 ? "Medium" : "Low",
    sparkline: [],
    supportingTransactionsCount: undefined,
    analysisPeriodWeeks: 4,
  }));
}

function resolveSignalCategory(signalName: string): string {
  const lower = signalName.toLowerCase();
  if (lower.includes("night") || lower.includes("late")) return "Surge Pattern";
  if (lower.includes("subscription")) return "Passive Drain";
  if (lower.includes("weekend")) return "Cyclical Habit";
  if (lower.includes("merchant")) return "Structural Risk";
  if (lower.includes("category")) return "Concentration Risk";
  return "Behavioral Signal";
}

/**
 * Parse the markdown-formatted report from the backend into the AIInsight
 * shape expected by the Dashboard.
 */
function toAiInsight(response: ApiAnalysisResponse): AIInsight {
  const report = response.report;

  // Extract sections delimited by ### headings
  const extract = (heading: string): string => {
    const regex = new RegExp(`###\\s*${heading}\\s*\\n([\\s\\S]*?)(?=###|$)`, "i");
    const match = report.match(regex);
    return match ? match[1].trim() : "";
  };

  const reasoning = extract("Reasoning");
  const impact = extract("Impact");
  const action = extract("Suggested Action");

  const suggestedActions = action
    ? action
        .split(/\n+/)
        .map((l) => l.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
    : ["Review flagged transactions and set appropriate budget limits."];

  return {
    detectedBehavior: response.key_finding || "Behavioral Pattern Detected",
    reasoningExplanation:
      reasoning || "Anomalous spending patterns were detected across your recent transactions.",
    riskImpact:
      impact ||
      "Unchecked, these patterns may lead to budget variance and reduced long-term savings.",
    suggestedActions,
    additionalInsights: undefined,
  };
}

/**
 * Derive local AnalysisStats (scores, chart timeline, category breakdown) from
 * the raw transactions. The backend does not return these, so we compute them
 * client-side the same way the old localRuleBasedAnalyze did.
 */
function deriveLocalStats(
  transactions: Transaction[],
  signals: BehavioralSignal[]
): AnalysisStats {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalIncome = 0;
  let totalSpent = 0;
  const categorySpent: Record<string, number> = {
    Food: 0,
    Entertainment: 0,
    Shopping: 0,
    Subscriptions: 0,
    Other: 0,
  };

  transactions.forEach((t) => {
    const isIncome = t.category === "Income" || t.amount < 0;
    const amount = Math.abs(t.amount);
    if (isIncome) {
      totalIncome += amount;
    } else {
      totalSpent += amount;
      if (categorySpent[t.category] !== undefined) {
        categorySpent[t.category] += amount;
      } else {
        categorySpent["Other"] = (categorySpent["Other"] || 0) + amount;
      }
    }
  });

  const savingsAmount = Math.max(0, totalIncome - totalSpent);
  const savingsRate = totalIncome > 0 ? savingsAmount / totalIncome : 0;

  // ─── Discipline Score ────────────────────────────────────────────────────
  // Signal-severity-based model. Healthy profiles (no signals or minor
  // subscription only) score 70–85. Moderate risk scores 45–70.
  // High-risk patterns (concentration, dependence, or 3+ signals) go below 45.
  //
  // Penalty weights per signal type:
  //   Category Concentration  → up to -25 (scaled by confidence)
  //   Merchant Dependence     → up to -20
  //   Late-Night Spending     → up to -18
  //   Weekend Overspending    → up to -15
  //   Subscription Creep      → up to -10 (minor by itself)
  //   Unknown / Other         → up to -12
  //
  // Multi-signal compounding: each signal beyond the first adds an extra -5.
  // Savings rate contributes a small bonus capped at +8.

  const SIGNAL_MAX_PENALTY: Record<string, number> = {
    "Category Concentration": 25,
    "Merchant Dependence": 20,
    "Late-Night Spending": 18,
    "Weekend Overspending": 15,
    "Subscription Creep": 10,
  };

  let disciplineScore = 85; // clean-profile baseline

  // Per-signal penalty scaled by confidence (0–1 from backend)
  signals.forEach((sig, idx) => {
    const maxPenalty = SIGNAL_MAX_PENALTY[sig.title] ?? 12;
    const confidenceFraction = sig.confidence / 100; // confidence stored as 0–100 here
    const penalty = Math.round(maxPenalty * confidenceFraction);
    disciplineScore -= penalty;

    // Compounding penalty for each additional signal beyond the first
    if (idx >= 1) {
      disciplineScore -= 5;
    }
  });

  // Minor savings-rate bonus (max +8) — supplement, not driver
  disciplineScore += Math.round(Math.min(savingsRate * 8, 8));

  disciplineScore = Math.min(100, Math.max(5, Math.round(disciplineScore)));

  let behaviorScore = 85;
  behaviorScore -= Math.min(signals.length * 5, 30);
  behaviorScore = Math.min(100, Math.max(10, Math.round(behaviorScore)));

  // Build timeline
  const timelineMap: Record<
    string,
    { Food: number; Entertainment: number; Shopping: number; Subscriptions: number; Income: number }
  > = {};

  sorted.forEach((t) => {
    if (!timelineMap[t.date]) {
      timelineMap[t.date] = { Food: 0, Entertainment: 0, Shopping: 0, Subscriptions: 0, Income: 0 };
    }
    const cat = t.category as keyof (typeof timelineMap)[string];
    if (timelineMap[t.date][cat] !== undefined) {
      timelineMap[t.date][cat] += Math.abs(t.amount);
    }
  });

  const timeline = Object.keys(timelineMap)
    .map((date) => ({ date, ...timelineMap[date] }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    scores: {
      behavior: behaviorScore,
      discipline: disciplineScore,
      trend:
        disciplineScore >= 70
          ? "Healthy"
          : disciplineScore >= 45
          ? "Moderate Risk"
          : "High Risk",
    },
    signals,
    categoryBreakdown: categorySpent,
    savingsRate: Math.round(savingsRate * 100),
    totalSpent,
    timeline,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseAnalysisResult {
  isLoading: boolean;
  error: string | null;
  apiResponse: ApiAnalysisResponse | null;
  stats: AnalysisStats | null;
  aiInsight: AIInsight | null;
  runAnalysis: (transactions: Transaction[]) => Promise<void>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiAnalysisResponse | null>(null);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);

  const runAnalysis = useCallback(async (transactions: Transaction[]) => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setStats(null);
    setAiInsight(null);

    try {
      const response = await analyzeTransactions(transactions);

      const behavioralSignals = toBehavioralSignals(response.signals);
      const derivedStats = deriveLocalStats(transactions, behavioralSignals);
      const insight = toAiInsight(response);

      setApiResponse(response);
      setStats(derivedStats);
      setAiInsight(insight);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred during analysis.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setApiResponse(null);
    setStats(null);
    setAiInsight(null);
  }, []);

  return { isLoading, error, apiResponse, stats, aiInsight, runAnalysis, reset };
}
