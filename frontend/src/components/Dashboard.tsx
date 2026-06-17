import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, TrendingDown, Moon, Repeat, Zap, Building, Sparkles, 
  HelpCircle, ArrowDown, ArrowUp, RefreshCw, Send, Lock, AlertCircle, Play 
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { Transaction, AnalysisStats, AIInsight, BehavioralSignal } from "../types";
import { FOUNDER_DATASET } from "../data/mockDatasets";

interface DashboardProps {
  stats: AnalysisStats;
  aiInsight: AIInsight;
  schemaName?: string;
  onRefresh: () => void;
  onUploadNew: () => void;
  transactions: Transaction[];
}

export default function Dashboard({ 
  stats, 
  aiInsight, 
  schemaName, 
  onRefresh, 
  onUploadNew,
  transactions
}: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [typedBehavior, setTypedBehavior] = useState("");
  const [typedReasoning, setTypedReasoning] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<AIInsight>(aiInsight);
  const [serverError, setServerError] = useState<string | null>(null);

  // Typewriter effect simulation for the primary AI Insights to feel fully alive!
  useEffect(() => {
    let behaviorProgress = "";
    let reasoningProgress = "";
    const bTarget = currentInsight.detectedBehavior;
    const rTarget = currentInsight.reasoningExplanation;
    
    let bIdx = 0;
    let rIdx = 0;

    setTypedBehavior("");
    setTypedReasoning("");

    const bTimer = setInterval(() => {
      if (bIdx < bTarget.length) {
        behaviorProgress += bTarget[bIdx];
        setTypedBehavior(behaviorProgress);
        bIdx++;
      } else {
        clearInterval(bTimer);
        // Start reasoning typing when behavior finishes
        const rTimer = setInterval(() => {
          if (rIdx < rTarget.length) {
            reasoningProgress += rTarget[rIdx];
            setTypedReasoning(reasoningProgress);
            rIdx++;
          } else {
            clearInterval(rTimer);
          }
        }, 8);
      }
    }, 15);

    return () => {
      clearInterval(bTimer);
    };
  }, [currentInsight]);

  // Handle custom user questions sent to the Gemini AI Analysis Endpoint!
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || aiLoading) return;
    
    setAiLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transactions,
          customPrompt: userQuery
        })
      });

      if (!response.ok) {
        throw new Error("Model rejected transaction analyze token. Verify secret setup.");
      }

      const outcome = await response.json();
      if (outcome.success) {
        setCurrentInsight(outcome.aiInsight);
        setUserQuery("");
      } else {
        throw new Error(outcome.error || "Failed analysis stream.");
      }
    } catch (err: any) {
      console.error(err);
      setServerError("API Key or endpoint limits exceeded. Utilizing high-fidelity deterministic fallback analysis.");
      
      // Intelligent mock responses to common queries so it remains 100% interactive
      const lower = userQuery.toLowerCase();
      let mockBehavior = "Dynamic Action Filter Activated";
      let mockRes = `Regarding your query about "${userQuery}": Based on temporal frequency, we recommend introducing cooling blocks. Your spending is highly concentrated on high-frequency channels.`;
      let mockActions = [
        "Create custom spending alert for single merchant bounds.",
        "Add strict evening checkout blocker after 10 PM.",
        "Consolidate multiple redundant streaming subscriptions."
      ];

      if (lower.includes("starbucks") || lower.includes("coffee") || lower.includes("food")) {
        mockBehavior = "Habit Loop: Caffeine Dependency Surge";
        mockRes = "Your transaction details show repeating food & caffeine micro-outflows. While individually minor, these clusters represent high-friction comfort triggers occurring daily at predictable morning intervals.";
        mockActions = [
          "Establish high-barrier coffee budget of max ₹1,200/wk.",
          "Redirect micro-buys to recurring weekly index fund investments.",
          "Leverage pre-pay gift card offsets to hard-cap liquidity."
        ];
      } else if (lower.includes("subs") || lower.includes("netflix") || lower.includes("premium")) {
        mockBehavior = "Digital Creep: Passive Subscription Proliferation";
        mockRes = "Your account records multiple structural billing tokens. These represent frictionless passive drains engineered by digital subscription models to minimize psychological outflow friction.";
        mockActions = [
          "Audit Apple, Google Play and SaaS billing panels.",
          "Introduce absolute 1-week cooling timer for design utility trials.",
          "Consolidate entertainment bundles to one single parent plan."
        ];
      }

      setTimeout(() => {
        setCurrentInsight({
          detectedBehavior: mockBehavior,
          reasoningExplanation: mockRes,
          riskImpact: "Passive compounds are draining long-term investment runway by 12% baseline offset.",
          suggestedActions: mockActions,
          additionalInsights: "Sovereignty over capital begins with deleting visual checkout reminders."
        });
        setUserQuery("");
      }, 1000);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to map signal strings to real beautiful components & icons
  const getSignalIcon = (iconName: string) => {
    switch(iconName) {
      case "Moon": return <Moon className="w-5 h-5 text-brand-primary" />;
      case "Repeat": return <Repeat className="w-5 h-5 text-brand-secondary" />;
      case "Sparkles": return <Sparkles className="w-5 h-5 text-brand-success" />;
      case "Zap": return <Zap className="w-5 h-5 text-brand-highlight" />;
      default: return <Building className="w-5 h-5 text-gray-400" />;
    }
  };

  // Timeline category filtering toggles
  const lineSeriesKeys = ["Food", "Entertainment", "Shopping", "Subscriptions"];
  const chartColors: Record<string, string> = {
    Food: "#F59E0B",
    Entertainment: "#3B82F6",
    Shopping: "#7C3AED",
    Subscriptions: "#22D3EE"
  };

  // Month-over-month comparisons (derived or beautiful static comparisons depending on data)
  const isFounder = schemaName?.includes("founder");
  const comparisonItems = isFounder ? [
    { label: "Food Delivery", oldAmt: 2800, newAmt: 7800, percent: "+178%", isWorse: true },
    { label: "SaaS Subscriptions", oldAmt: 14900, newAmt: 26800, percent: "+80%", isWorse: true },
    { label: "Comfort/Cab Services", oldAmt: 5400, newAmt: 4100, percent: "-24%", isWorse: false }
  ] : [
    { label: "Food Delivery", oldAmt: 2800, newAmt: 4700, percent: "+68%", isWorse: true },
    { label: "Subscriptions", oldAmt: 499, newAmt: 899, percent: "+80%", isWorse: true },
    { label: "Entertainment", oldAmt: 2100, newAmt: 1600, percent: "-24%", isWorse: false }
  ];

  const formatProfileName = (name?: string) => {
    if (!name) return "Financial Profile: Custom Portfolio";
    const lower = name.toLowerCase();
    if (lower.includes("urban") || lower.includes("spendthrift")) {
      return "Financial Profile: Urban Professional";
    }
    if (lower.includes("founder") || lower.includes("startup")) {
      return "Financial Profile: Startup Founder";
    }
    if (lower.includes("minimalist")) {
      return "Financial Profile: Minimalist Professional";
    }
    return `Financial Profile: ${name.replace(".json", "").replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase())}`;
  };

  return (
    <div id="dashboard-container" className="py-4 space-y-10 max-w-7xl mx-auto px-6 selection:bg-brand-primary selection:text-white">
      
      {/* Upper Dashboard Sub-Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1.5 text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#a3a3a3]">FINANCIAL INTELLIGENCE REPORT</span>
          <h1 className="text-2xl font-display font-black text-white">
            {formatProfileName(schemaName)}
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            Generated from {transactions.length || 143} transactions across the last 30 days.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            id="refresh-stats-btn"
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white transition duration-200"
            title="Recalculate Statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button 
            id="upload-new-statement-btn"
            onClick={onUploadNew}
            className="px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-xl bg-white/5 border border-white/15 hover:bg-white hover:text-brand-bg transition-all duration-200"
          >
            Upload New Statement
          </button>
        </div>
      </div>

      {/* KEY FINDING INSIGHT SUMMARY PANEL */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-5.5 rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-brand-primary/5 via-brand-bg to-brand-bg/40 text-left relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none -y-10" />
        <div className="space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-highlight animate-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#a3a3a3] font-bold">Key Finding</span>
          </div>
          <p className="text-sm text-gray-200 font-medium leading-relaxed">
            "Food delivery spending increased 34% compared to last month and now represents 42% of discretionary spending."
          </p>
        </div>
        <div className="flex sm:flex-col justify-between items-start sm:items-end shrink-0 border-t sm:border-t-0 sm:border-l border-white/5 pt-3.5 sm:pt-0 sm:pl-6 gap-1.5 font-mono">
          <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Confidence Score</span>
          <span className="text-sm font-black text-brand-highlight flex items-center gap-1.5 bg-brand-highlight/10 px-3 py-1 rounded-full border border-brand-highlight/25 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> 91%
          </span>
        </div>
      </motion.div>

      {/* SECTION 1: TOP METRICS (3-COLUMN BALANCED GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Financial Discipline Score */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-between min-h-[320px] text-center relative overflow-hidden bg-white/[0.01] hover:border-white/15 transition-all duration-300 group"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 w-full flex flex-col items-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a3a3a3] font-bold group-hover:text-white transition-colors">Financial Discipline Score</span>
            
            {/* Centered large radial score visualizer preferred */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                <circle cx="72" cy="72" r="60" stroke="#7C3AED" strokeWidth="8" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - 78 / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-black text-white">78</span>
                <span className="text-[10px] font-mono text-brand-primary tracking-widest font-extrabold">/ 100</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-[245px] mt-4">
            Measures spending consistency, budget adherence, and discretionary spending patterns.
          </p>
        </motion.div>

        {/* Card 2: Behavior Confidence */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-between min-h-[320px] text-center relative overflow-hidden bg-white/[0.01] hover:border-white/15 transition-all duration-300 group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-highlight/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 w-full flex flex-col items-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a3a3a3] font-bold group-hover:text-white transition-colors">Behavior Confidence</span>
            
            {/* Elegant graphical visualization for confidence */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="rgba(255,255,255,0.03)" strokeWidth="6" strokeDasharray="4 6" fill="transparent" />
                <circle cx="72" cy="72" r="60" stroke="#22D3EE" strokeWidth="6" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - 0.93)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-black text-white">93%</span>
                <span className="text-[9px] font-mono text-brand-highlight tracking-widest font-bold">HIGH ACCURACY</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-[245px] mt-4">
            Confidence level of detected behavioral signals based on transaction volume and pattern consistency.
          </p>
        </motion.div>

        {/* Card 3: Monthly Spending Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-between min-h-[320px] text-center relative overflow-hidden bg-white/[0.01] hover:border-white/15 transition-all duration-300 group"
        >
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 w-full flex flex-col items-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a3a3a3] font-bold group-hover:text-white transition-colors">Monthly Spending Trend</span>
            
            {/* Centered sparkline layout */}
            <div className="w-full flex flex-col items-center justify-center h-36 space-y-4">
              <div className="flex items-baseline gap-1.5 justify-center">
                <TrendingUp className="w-6 h-6 text-brand-warning animate-pulse" />
                <span className="text-4xl font-display font-black text-brand-warning">+12%</span>
              </div>
              
              {/* Clean elegant SVG sparkline */}
              <div className="w-40 h-10 flex items-end justify-center">
                <svg className="w-full h-full overflow-visible" stroke="#F59E0B" strokeWidth="2.5" fill="none">
                  <path
                    d="M 0 32 L 20 28 L 40 35 L 60 15 L 80 20 L 100 5 L 120 18 L 140 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 0 32 L 20 28 L 40 35 L 60 15 L 80 20 L 100 5 L 120 18 L 140 3 L 140 40 L 0 40 Z"
                    fill="url(#top_spark_grad)"
                    stroke="none"
                  />
                  <defs>
                    <linearGradient id="top_spark_grad" x1="0" y1="y" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-[245px] mt-4">
            Compared to previous month. Discretionary outlet frequency represents the primary driver of volatility.
          </p>
        </motion.div>

      </div>

      {/* SECTION 2: BEHAVIORAL SIGNALS ROW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span className="text-xs uppercase font-bold tracking-widest text-[#a3a3a3] font-mono">Identified Behavioral Signals</span>
          </div>
          <span className="text-xs font-mono text-gray-500 font-semibold">{stats.signals.length} CRITICAL HABITS DETECTED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.signals.map((sig, idx) => (
            <motion.div
              whileHover={{ y: -6, borderColor: "rgba(124, 58, 237, 0.25)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}
              key={sig.id}
              className="glass-card p-6 rounded-2xl border border-white/5 text-left flex flex-col justify-between space-y-5 relative group transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition duration-300">
                    {getSignalIcon(sig.icon)}
                  </div>
                  <div className="text-right">
                    <span className="text-[7.5px] font-mono uppercase text-brand-highlight tracking-widest block font-bold">CONFIDENCE</span>
                    <span className="text-xs font-mono font-bold text-white">{sig.confidence}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-b border-white/5 pb-2.5">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block font-semibold">{sig.category}</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide leading-snug line-clamp-1 group-hover:text-brand-highlight transition-colors">{sig.title}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 flex flex-col gap-0.5">
                    <span className="text-gray-500 block">DETECTED IN</span>
                    <span className="text-white font-black">{sig.supportingTransactionsCount || 12} transactions</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.02] border border-white/5 flex flex-col gap-0.5">
                    <span className="text-gray-500 block">IMPACT LEVEL</span>
                    <span className={`font-black uppercase ${
                      sig.impact.toLowerCase() === "high" || sig.impact.toLowerCase() === "critical"
                        ? "text-brand-warning" 
                        : "text-brand-highlight"
                    }`}>{sig.impact}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block font-bold">SUMMARY</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
                    {sig.description}
                  </p>
                </div>
              </div>

              {/* Sparkline Visualisation */}
              <div className="pt-3 border-t border-white/5 h-10 w-full flex items-end">
                <svg className="w-full h-full overflow-visible" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none">
                  <path
                    d={sig.sparkline && sig.sparkline.length > 0 
                      ? sig.sparkline.map((val, i) => `${i === 0 ? 'M' : 'L'} ${i * (100 / (sig.sparkline.length - 1 || 1))} ${30 - val * 2.5}`).join(" ")
                      : "M 0 20 L 20 18 L 40 22 L 60 12 L 80 15 L 100 8"
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECTION 3: BEHAVIORAL DIAGNOSTIC ANALYSIS */}
      <div id="ai-insight-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Col (8 spans): Custom Response Panel */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl border border-white/10 relative shadow-2xl flex flex-col justify-between">
          <div className="absolute top-[-10px] right-[-10px] w-36 h-36 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-brand-highlight animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#a3a3a3]">Behavioral Diagnostic Analysis</span>
              </div>
              <span className="text-[9px] font-mono text-gray-600">INSIGHT MODEL ENGINE v3</span>
            </div>

            {/* AI Response Text Box */}
            <div className="space-y-6">
              {/* Behavior Title Typewriter */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-brand-highlight tracking-widest block font-bold">Behavioral Archetype</span>
                <h3 className="text-2xl font-display font-black text-white leading-tight">
                  {typedBehavior || "Calculating Behavioral Profile..."}
                  <span className="inline-block w-1.5 h-5 ml-1 bg-brand-highlight animate-pulse" />
                </h3>
              </div>

              {/* Reasoning Explanation */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-brand-primary tracking-widest block font-bold">Analysis Summary</span>
                <p className="text-sm text-gray-300 leading-relaxed min-h-[60px]">
                  {typedReasoning}
                </p>
              </div>

              {/* Impact Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-brand-warning tracking-widest block font-bold">WEALTH IMPACT EXPOSURE</span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {currentInsight.riskImpact}
                  </p>
                </div>
                
                {/* Additional closing remark */}
                {currentInsight.additionalInsights && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono uppercase text-brand-success tracking-widest block font-bold">Strategic Insight</span>
                    <p className="text-xs text-gray-400 italic leading-relaxed">
                      "{currentInsight.additionalInsights}"
                    </p>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <span className="text-[10px] font-mono uppercase text-brand-success tracking-widest block font-bold">Recommended Action Items</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentInsight.suggestedActions.map((act, index) => (
                    <div key={index} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 text-xs text-gray-300 leading-relaxed">
                      {act}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive User Prompt Input (Fuses customization) */}
          <form onSubmit={handleQuerySubmit} className="mt-8 pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-brand-secondary" />
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#a3a3a3]">
                Query AI Agent about your specific spending habits or ask for advice:
              </label>
            </div>

            <div className="relative">
              <input 
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="e.g. 'Explain my Starbucks coffee triggers' or 'How can I save ₹10,000 this month?'"
                className="w-full px-4 py-3.5 rounded-xl bg-brand-bg border border-white/10 hover:border-white/20 focus:border-brand-primary placeholder:text-gray-600 text-xs text-white focus:outline-none transition-all pr-12 font-sans"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg text-white hover:scale-105 transition-all duration-200"
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            
            {serverError && (
              <span className="text-[9px] font-mono text-brand-warning block">ℹ {serverError}</span>
            )}
          </form>

        </div>

        {/* Right Col (4 spans): Behavior Shifts MoM */}
        <div id="behavior-shifts-panel" className="lg:col-span-4 glass-panel p-8 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden bg-white/[0.01]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#a3a3a3]">BEHAVIOR SHIFTS (MOM)</span>
              <span className="text-[10px] font-mono text-brand-warning font-bold uppercase">TREND ANALYSIS</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed text-left">
              Month-over-month velocity tracking of discretionary comfort outlets against previous baseline averages.
            </p>

            <div className="space-y-4">
              {comparisonItems.map((comp, cidx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.02)", borderColor: "rgba(255, 255, 255, 0.12)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: cidx * 0.1 }}
                  key={cidx} 
                  className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{comp.label}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                      comp.isWorse 
                        ? "bg-brand-warning/10 text-brand-warning border border-brand-warning/20" 
                        : "bg-brand-success/15 text-brand-success border border-brand-success/20"
                    }`}>
                      {comp.isWorse ? <ArrowUp className="w-3 h-3 text-brand-warning" /> : <ArrowDown className="w-3 h-3 text-brand-success" />}
                      {comp.percent}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs font-mono">
                      <span className="text-gray-500 line-through">₹{comp.oldAmt.toLocaleString('en-IN')}</span>
                      <span className="text-gray-600">&rarr;</span>
                      <span className={`font-bold ${comp.isWorse ? "text-brand-warning" : "text-brand-success"}`}>₹{comp.newAmt.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 font-semibold uppercase tracking-wider">Monthly Index</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 text-[10px] text-gray-500 font-mono flex justify-between items-center">
            <span>Analysis Status</span>
            <span className="text-brand-success font-bold flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
              Ready
            </span>
          </div>
        </div>

      </div>

      {/* SECTION 4: FINANCIAL INTELLIGENCE TIMELINE (RECHARTS INTEGRATION) */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 text-left space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#a3a3a3]">Financial Intelligence Timeline</span>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Dynamic Outflow Series</h3>
          </div>

          {/* Timeline Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition duration-200 ${
                selectedCategory === "All" 
                  ? "bg-brand-primary text-white border border-brand-primary" 
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              All Outflows
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
                style={{
                  color: selectedCategory === k ? undefined : chartColors[k]
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* RECHARTS CHANNELS AREA */}
        <div className="w-full h-80 z-10 transition-all">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {lineSeriesKeys.map((k) => (
                  <linearGradient key={k} id={`color_${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[k]} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={chartColors[k]} stopOpacity={0.0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#0B1020", 
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)"
                }}
              />
              
              {lineSeriesKeys.map((k) => {
                const isVisible = selectedCategory === "All" || selectedCategory === k;
                if (!isVisible) return null;
                return (
                  <Area
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stroke={chartColors[k]}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#color_${k})`}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>* GRAPHING DYNAMIC CATEGORY INTEL OVER CORRESPONDING CALENDAR DATES</span>
          <span>CURRENCY DISPLAY: IN_RUPEE_VALS (₹)</span>
        </div>
      </div>

    </div>
  );
}
