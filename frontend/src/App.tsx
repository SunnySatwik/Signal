import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LandingPage from "./components/LandingPage";
import UploadZone from "./components/UploadZone";
import ProgressIndicator from "./components/ProgressIndicator";
import Dashboard from "./components/Dashboard";
import SignalLogo from "./components/SignalLogo";
import { Transaction } from "./types";
import { FOUNDER_DATASET } from "./data/mockDatasets";
import { useAnalysis } from "./hooks/useAnalysis";

export default function App() {
  const [screen, setScreen] = useState<"landing" | "upload" | "progress" | "dashboard">("landing");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [schemaName, setSchemaName] = useState<string>("Demo Report");

  const { isLoading, error, apiResponse, stats, aiInsight, runAnalysis, reset } = useAnalysis();

  // ─── Navigation handlers ────────────────────────────────────────────────────

  const handleDataLoaded = (txs: Transaction[], schema: string) => {
    setTransactions(txs);
    setSchemaName(schema);
    setScreen("progress");
  };

  const handleViewDemo = () => {
    setTransactions(FOUNDER_DATASET);
    setSchemaName("startup_founder_vault.json");
    setScreen("progress");
  };

  /**
   * Called by ProgressIndicator when the animated pipeline is ready to fire.
   * Kicks off the real backend API call. The ProgressIndicator will hold at 90%
   * while isLoading is true, then race to 100% when it finishes.
   */
  const handleProgressStart = async () => {
    await runAnalysis(transactions);
  };

  /**
   * Called by ProgressIndicator when both the animation AND the API call are done.
   * Transitions to the dashboard if we have data, or shows an error state.
   */
  const handleProgressComplete = () => {
    if (stats && aiInsight) {
      setScreen("dashboard");
    } else if (error) {
      // If API failed, still show dashboard with error banner
      setScreen("dashboard");
    }
  };

  const handleRefresh = async () => {
    reset();
    setScreen("progress");
  };

  return (
    <div className="min-h-screen bg-brand-bg text-gray-100 flex flex-col justify-between select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col justify-center"
        >
          {screen === "landing" && (
            <LandingPage
              onStartAnalysis={() => setScreen("upload")}
              onViewDemo={handleViewDemo}
            />
          )}

          {screen === "upload" && (
            <UploadZone
              onDataLoaded={handleDataLoaded}
              onViewDemo={handleViewDemo}
              onBackToLanding={() => setScreen("landing")}
            />
          )}

          {screen === "progress" && (
            <ProgressIndicator
              schemaName={schemaName}
              isApiLoading={isLoading}
              onStart={handleProgressStart}
              onComplete={handleProgressComplete}
            />
          )}

          {screen === "dashboard" && (
            <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
              {/* Header */}
              <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/5 bg-brand-bg/60 backdrop-blur-md">
                <div onClick={() => setScreen("landing")} className="flex items-center gap-3 cursor-pointer select-none">
                  <SignalLogo className="w-7 h-7" />
                  <span className="font-display text-md font-bold tracking-[0.2em] text-white">SIGNAL</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden sm:inline-block">
                  Signal Engine: Active
                </span>
              </header>

              {/* Error banner */}
              {error && !stats && (
                <div className="w-full max-w-7xl mx-auto px-6 mt-6">
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-mono">
                    ⚠ Backend Analysis Error: {error}. Please ensure the backend is running at {import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}.
                  </div>
                </div>
              )}

              {stats && aiInsight && (
                <Dashboard
                  stats={stats}
                  aiInsight={aiInsight}
                  apiResponse={apiResponse}
                  schemaName={schemaName}
                  transactions={transactions}
                  onRefresh={handleRefresh}
                  onUploadNew={() => setScreen("upload")}
                />
              )}

              <footer className="w-full text-center py-6 text-[9px] font-mono text-gray-600 border-t border-white/5 max-w-7xl mx-auto mt-12 bg-brand-bg">
                SIGNAL BI METRIC PLATFORM · PRIVACY COMPLIANT · POWERED BY GEMINI-FLASH
              </footer>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
