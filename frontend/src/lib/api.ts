/**
 * lib/api.ts – Centralised API layer for the Signal platform.
 *
 * All backend communication is routed through this module.
 * The base URL is read from the VITE_API_URL environment variable.
 */

import type { ApiAnalysisResponse, ApiReport, ApiTransaction, Transaction } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a frontend Transaction (which uses separate date + time fields)
 * into the ApiTransaction shape expected by the backend (ISO 8601 timestamp).
 */
export function toApiTransaction(tx: Transaction): ApiTransaction {
  // Build an ISO timestamp from date + optional time
  const time = tx.time ?? "12:00";
  const timestamp = `${tx.date}T${time.length === 5 ? time + ":00" : time}`;

  return {
    amount: Math.abs(tx.amount), // backend expects positive amounts
    merchant: tx.merchant || tx.description || "Unknown",
    category: tx.category === "Income" ? "Income" : tx.category,
    timestamp,
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Send a list of transactions to the Signal backend for analysis.
 *
 * @param transactions - Frontend transaction objects (from upload / demo data)
 * @returns            - The parsed ApiAnalysisResponse from the backend
 * @throws             - Throws an Error with a user-friendly message on failure
 */
export async function analyzeTransactions(
  transactions: Transaction[]
): Promise<ApiAnalysisResponse> {
  const apiTransactions: ApiTransaction[] = transactions
    .filter((tx) => tx.category !== "Income" && tx.amount > 0)
    .map(toApiTransaction);

  const response = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ transactions: apiTransactions }),
  });

  if (!response.ok) {
    let detail = `Backend responded with ${response.status}`;
    try {
      const err = await response.json();
      detail = err?.detail ?? detail;
    } catch {
      // ignore JSON parse error on error response
    }
    throw new Error(detail);
  }

  const data: ApiAnalysisResponse = await response.json();
  return data;
}

/**
 * Retrieve all previously saved analysis reports.
 *
 * @returns - Array of ApiReport objects ordered newest-first
 * @throws  - Throws an Error on non-OK response
 */
export async function fetchReports(): Promise<ApiReport[]> {
  const response = await fetch(`${BASE_URL}/reports`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.status}`);
  }

  return response.json();
}
