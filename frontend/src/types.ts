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
