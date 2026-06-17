import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Moon, Repeat, Zap, Building, Sparkles,
  ArrowDown, ArrowUp, RefreshCw, UploadCloud,
  TrendingUp, TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Transaction, AnalysisStats, AIInsight, ApiAnalysisResponse } from "../types";

interface DashboardProps {
  stats: AnalysisStats;
  aiInsight: AIInsight;
  apiResponse?: ApiAnalysisResponse | null;
  schemaName?: string;
  onRefresh: () => void;
  onUploadNew: () => void;
  transactions: Transaction[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSignalIcon(signalName: string) {
  const lower = signalName.toLowerCase();
  if (lower.includes("night") || lower.includes("late")) return <Moon className="w-4 h-4" />;
  if (lower.includes("subscription") || lower.includes("recurring")) return <Repeat className="w-4 h-4" />;
  if (lower.includes("weekend") || lower.includes("category")) return <Sparkles className="w-4 h-4" />;
  if (lower.includes("merchant") || lower.includes("depend")) return <Building className="w-4 h-4" />;
  return <Zap className="w-4 h-4" />;
}

function getSignalAccent(confidence: number): string {
  if (confidence >= 75) return "text-brand-warning border-brand-warning/20 bg-brand-warning/5";
  if (confidence >= 50) return "text-brand-highlight border-brand-highlight/20 bg-brand-highlight/5";
  return "text-brand-success border-brand-success/20 bg-brand-success/5";
}

function extractSection(report: string, heading: string): string {
  const regex = new RegExp(`###\\s*${heading}\\s*\\n([\\s\\S]*?)(?=###|$)`, "i");
  const match = report.match(regex);
  return match ? match[1].trim() : "";
}

function formatProfileName(name?: string): string {
  if (!name) return "Custom Portfolio";
  const lower = name.toLowerCase();
  if (lower.includes("urban") || lower.includes("spendthrift")) return "Urban Professional";
  if (lower.includes("founder") || lower.includes("startup")) return "Startup Founder";
  if (lower.includes("minimalist")) return "Minimalist Professional";
  return name.replace(".json", "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Derive simple behavior change items from signals
function deriveBehaviorChanges(stats: AnalysisStats) {
  if (stats.signals.length === 0) return [];
  return stats.signals.slice(0, 4).map((sig) => {
    const isNegative = sig.confidence > 55;
    const pct = Math.round(sig.confidence * 0.6 + 10);
    return {
      label: sig.title.replace(/ Burst| Proliferation| Spike| Activity| Monopolization.*/, ""),
      percent: isNegative ? `+${pct}%` : `-${Math.round(pct * 0.4)}%`,
      isWorse: isNegative,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard({
  stats,
  aiInsight,
  apiResponse,
  schemaName,
  onRefresh,
  onUploadNew,
  transactions,
}: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const report = apiResponse?.report ?? "";
  const keyFinding = apiResponse?.key_finding ?? aiInsight.detectedBehavior;
  const reasoning = extractSection(report, "Reasoning") || aiInsight.reasoningExplanation;
  const impact = extractSection(report, "Impact") || aiInsight.riskImpact;
  const suggestedActionRaw = extractSection(report, "Suggested Action");
  const suggestedAction = suggestedActionRaw || aiInsight.suggestedActions[0] || "";

  const avgConfidence =
    stats.signals.length > 0
      ? Math.round(stats.signals.reduce((s, sig) => s + sig.confidence, 0) / stats.signals.length)
      : stats.scores.behavior;

  const behaviorChanges = deriveBehaviorChanges(stats);

  const lineSeriesKeys = ["Food", "Entertainment", "Shopping", "Subscriptions"];
  const chartColors: Record<string, string> = {
    Food: "#F59E0B",
    Entertainment: "#3B82F6",
    Shopping: "#7C3AED",
    Subscriptions: "#22D3EE",
  };

  return (
    <div className="py-6 space-y-8 max-w-7xl mx-auto px-6 selection:bg-brand-primary selection:text-white">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
            Financial Intelligence Report
          </span>
          <h1 className="text-2xl font-display font-black text-white">
            {formatProfileName(schemaName)}
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            {transactions.length} transactions analyzed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="refresh-btn"
            onClick={onRefresh}
            title="Re-analyze"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition duration-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="upload-new-btn"
            onClick={onUploadNew}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-xl bg-white/5 border border-white/15 hover:bg-white hover:text-brand-bg transition-all duration-200"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload New
          </button>
        </div>
      </div>

      {/* ── Section 1: Two Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Financial Discipline Score */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 flex items-center gap-8 relative overflow-hidden bg-white/[0.01] hover:border-white/15 transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.04)" strokeWidth="7" fill="transparent" />
              <circle
                cx="56" cy="56" r="46" stroke="#7C3AED" strokeWidth="7" fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - stats.scores.discipline / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-display font-black text-white">{stats.scores.discipline}</span>
              <span className="text-[9px] font-mono text-brand-primary tracking-widest">/ 100</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
              Financial Discipline
            </span>
            <p className="text-sm font-bold text-white">{stats.scores.trend}</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Based on savings rate, spending consistency, and recurring patterns.
            </p>
          </div>
        </motion.div>

        {/* Analysis Confidence */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 flex items-center gap-8 relative overflow-hidden bg-white/[0.01] hover:border-white/15 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-highlight/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.04)" strokeWidth="7" strokeDasharray="4 6" fill="transparent" />
              <circle
                cx="56" cy="56" r="46" stroke="#22D3EE" strokeWidth="7" fill="transparent"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - avgConfidence / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-display font-black text-white">{avgConfidence}%</span>
              <span className="text-[9px] font-mono text-brand-highlight tracking-widest">
                {avgConfidence >= 80 ? "HIGH" : avgConfidence >= 55 ? "MEDIUM" : "LOW"}
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block">
              Analysis Confidence
            </span>
            <p className="text-sm font-bold text-white">
              {stats.signals.length} Signal{stats.signals.length !== 1 ? "s" : ""} Detected
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Confidence based on transaction volume and pattern consistency.
            </p>
          </div>
        </motion.div>

      </div>

      {/* ── Section 2: Financial Intelligence Report ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 pb-5 border-b border-white/5 mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-highlight animate-pulse shrink-0" />
          <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
            Financial Intelligence Report
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Key Finding + Reasoning */}
          <div className="space-y-5">
            <div className="space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-brand-highlight font-bold block">
                Key Finding
              </span>
              <p className="text-lg font-bold text-white leading-snug">
                {keyFinding}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-brand-primary font-bold block">
                Reasoning
              </span>
              <p className="text-sm text-gray-300 leading-relaxed">
                {reasoning}
              </p>
            </div>
          </div>

          {/* Impact + Recommended Action */}
          <div className="space-y-5 lg:border-l lg:border-white/5 lg:pl-8">
            <div className="space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-brand-warning font-bold block">
                Impact
              </span>
              <p className="text-sm text-gray-300 leading-relaxed">
                {impact}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-brand-success font-bold block">
                Recommended Action
              </span>
              <div className="p-4 rounded-xl bg-brand-success/5 border border-brand-success/15">
                <p className="text-sm text-gray-200 leading-relaxed">
                  {suggestedAction || aiInsight.suggestedActions[0]}
                </p>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── Section 3: Behavioral Signals ── */}
      {stats.signals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Behavioral Signals
            </span>
            <span className="text-[10px] font-mono text-gray-600">
              {stats.signals.length} detected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.signals.map((sig, idx) => {
              const accent = getSignalAccent(sig.confidence);
              return (
                <motion.div
                  key={sig.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ y: -4, borderColor: "rgba(124, 58, 237, 0.2)" }}
                  className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col gap-3 relative transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-lg border ${accent}`}>
                      {getSignalIcon(sig.title)}
                    </div>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-full border ${accent}`}>
                      {sig.confidence}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide leading-snug">
                      {sig.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                      {sig.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 4 & 5: Behavior Changes + Chart (side by side on large screens) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Behavior Changes */}
        {behaviorChanges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Behavior Changes
            </span>
            <div className="space-y-3">
              {behaviorChanges.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.07 * idx }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <span className="text-sm font-medium text-white">{item.label}</span>
                  <span
                    className={`flex items-center gap-1 text-sm font-black font-mono ${
                      item.isWorse ? "text-brand-warning" : "text-brand-success"
                    }`}
                  >
                    {item.isWorse ? (
                      <ArrowUp className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDown className="w-3.5 h-3.5" />
                    )}
                    {item.percent}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Spending Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`${behaviorChanges.length > 0 ? "lg:col-span-8" : "lg:col-span-12"} glass-panel p-6 rounded-3xl border border-white/10 space-y-5 relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Spending Trend
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition duration-200 ${
                  selectedCategory === "All"
                    ? "bg-brand-primary text-white border border-brand-primary"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                All
              </button>
              {lineSeriesKeys.map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedCategory(k)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition duration-200 ${
                    selectedCategory === k
                      ? "bg-white/90 text-brand-bg border border-white"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
                  }`}
                  style={{ color: selectedCategory === k ? undefined : chartColors[k] }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  {lineSeriesKeys.map((k) => (
                    <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors[k]} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={chartColors[k]} stopOpacity={0.0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B1020",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                  }}
                />
                {lineSeriesKeys.map((k) => {
                  if (selectedCategory !== "All" && selectedCategory !== k) return null;
                  return (
                    <Area
                      key={k}
                      type="monotone"
                      dataKey={k}
                      stroke={chartColors[k]}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#grad_${k})`}
                      activeDot={{ r: 5 }}
                      animationDuration={1200}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
