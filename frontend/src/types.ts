// ─── Existing UI types ────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  date: string;
  time?: string;
  description: string;
  amount: number;
  category: "Food" | "Entertainment" | "Shopping" | "Subscriptions" | "Income" | "Other";
  merchant: string;
}

export interface ScoreBoard {
  behavior: number;
  discipline: number;
  trend: string;
}

export interface BehavioralSignal {
  id: string;
  title: string;
  category: string;
  description: string;
  confidence: number;
  trend: "increasing" | "stable" | "decreasing";
  icon: string;
  impact: string;
  sparkline: number[];
  supportingTransactionsCount?: number;
  analysisPeriodWeeks?: number;
}

export interface AnalysisStats {
  scores: ScoreBoard;
  signals: BehavioralSignal[];
  categoryBreakdown: Record<string, number>;
  savingsRate: number;
  totalSpent: number;
  timeline: Array<{
    date: string;
    Food: number;
    Entertainment: number;
    Shopping: number;
    Subscriptions: number;
    Income: number;
  }>;
}

export interface AIInsight {
  detectedBehavior: string;
  reasoningExplanation: string;
  riskImpact: string;
  suggestedActions: string[];
  additionalInsights?: string;
}

// ─── Backend API types ────────────────────────────────────────────────────────

/** Transaction payload sent to POST /analyze */
export interface ApiTransaction {
  amount: number;
  merchant: string;
  category: string;
  timestamp: string; // ISO 8601 e.g. "2026-06-12T22:45:00"
}

/** Single behavioral signal returned by the backend */
export interface ApiSignal {
  signal: string;
  confidence: number; // 0.0–1.0
  details: string;
}

/** Full response from POST /analyze */
export interface ApiAnalysisResponse {
  key_finding: string;
  signals: ApiSignal[];
  report: string;
}

/** Shape of records returned by GET /reports */
export interface ApiReport {
  id: number;
  report: string;
  created_at: string;
}
