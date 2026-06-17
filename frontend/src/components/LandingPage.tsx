import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Moon, Repeat, Zap, Building, ChevronRight, Play, FileCheck } from "lucide-react";
import SignalLogo from "./SignalLogo";

interface LandingPageProps {
  onStartAnalysis: () => void;
  onViewDemo: () => void;
}

export default function LandingPage({ onStartAnalysis, onViewDemo }: LandingPageProps) {
  return (
    <div id="landing-container" className="relative min-h-screen bg-brand-bg text-gray-100 overflow-hidden flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* Absolute Decorative Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-primary/10 blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-secondary/10 blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-brand-highlight/5 blur-[120px] -z-10 pointer-events-none" />

      {/* Modern High-End Premium Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 bg-brand-bg/65 z-50">
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-3 select-none pointer-events-none"
        >
          <SignalLogo className="w-8 h-8" />
          <span className="font-display text-xl font-bold tracking-[0.2em] text-white">SIGNAL</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-6"
        >
          <button 
            id="view-demo-header-btn"
            onClick={onViewDemo} 
            className="text-xs font-semibold tracking-wider text-gray-400 hover:text-white transition duration-200"
          >
            VIEW DEMO
          </button>
          <button 
            id="get-started-header-btn"
            onClick={onStartAnalysis} 
            className="relative group px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold tracking-wider text-white hover:bg-white hover:text-brand-bg hover:border-white transition-all duration-300"
          >
            LAUNCH APP
          </button>
        </motion.div>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-1">
        {/* Left Side: Headline & Copy */}
        <div className="lg:col-span-6 space-y-8 text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-highlight" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-highlight font-mono">FINANCIAL BEHAVIOR INTELLIGENCE PLATFORM</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.1] text-white"
            >
              Your bank statement shows <span className="bg-gradient-to-r from-brand-secondary to-brand-highlight bg-clip-text text-transparent">transactions</span>. <br />
              Signal reveals <span className="bg-gradient-to-r from-brand-primary via-purple-400 to-brand-highlight bg-clip-text text-transparent relative">behavior.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg"
            >
              Transform raw financial activity into behavioral intelligence using pattern detection and AI-powered insights. See the patterns shaping your capital.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <button
              id="analyze-spending-hero-btn"
              onClick={onStartAnalysis}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-sm font-bold tracking-wider text-white flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 focus:ring-2 focus:ring-brand-primary hover:skew-x-1 hover:translate-y-[-2px] active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <span>Analyze Spending</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="view-demo-hero-btn"
              onClick={onViewDemo}
              className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold tracking-wider text-white flex items-center gap-2 transition-all duration-200 hover:translate-y-[-2px] cursor-pointer"
            >
              <span>View Demo Report</span>
              <Play className="w-3.5 h-3.5 text-brand-highlight" />
            </button>
          </motion.div>
        </div>

        {/* Right Side: Flowing Interactive Visualization */}
        <div className="lg:col-span-6 flex justify-center items-center w-full min-h-[400px] z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-sm p-6.5 rounded-2xl border border-white/5 bg-gradient-to-b from-[#0e1633]/50 to-[#070b1c]/80 backdrop-blur-xl relative shadow-2xl overflow-hidden aspect-square flex flex-col justify-between"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-highlight/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full flex items-center justify-between border-b border-white/5 pb-3.5 mb-2">
              <span className="text-[10px] font-mono tracking-widest text-[#a3a3a3] font-bold">PATTERN DETECTION WORKFLOW</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-ping" />
                <span className="text-[9px] font-mono text-gray-400 font-bold uppercase">SECURED</span>
              </div>
            </div>

            {/* Floating connecting particle system */}
            <div className="flex-1 relative flex flex-col justify-between py-1">
              {/* Connector line layers */}
              <div className="absolute inset-0 flex flex-col items-center justify-between py-10 -z-10">
                <div className="h-full w-0.5 bg-gradient-to-b from-brand-secondary/30 via-brand-primary/20 to-brand-highlight/30 relative">
                  {/* Streaming particles traveling down */}
                  <motion.div 
                    animate={{ y: ["0%", "50%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-secondary glow-blue"
                  />
                  <motion.div 
                    animate={{ y: ["0%", "50%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 1.5 }}
                    className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-primary glow-purple"
                  />
                  <motion.div 
                    animate={{ y: ["0%", "50%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "linear", delay: 0.8 }}
                    className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-highlight glow-cyan"
                  />
                </div>
              </div>

              {/* Step 1: Transaction Stream */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg relative z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-secondary/10 border border-brand-secondary/20">
                    <Building className="w-4 h-4 text-brand-secondary" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">Transaction Stream</h4>
                    <span className="text-[9px] font-mono text-gray-400">RAW PAYOUTS & CARD CHARGES</span>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-brand-secondary font-bold">
                  ₹24,850/mo
                </div>
              </motion.div>

              {/* Step 2: Pattern Detection */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg relative z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
                    <Repeat className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">Pattern Detection</h4>
                    <span className="text-[9px] font-mono text-gray-400">FREQUENCY & TIMING ANALYTICS</span>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-brand-primary font-bold">
                  98% CONF
                </div>
              </motion.div>

              {/* Step 3: Behavioral Signals */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 shadow-lg relative z-10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-highlight/10 border border-brand-highlight/20">
                    <Zap className="w-4 h-4 text-brand-highlight" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-gray-100 uppercase tracking-wide">Behavioral Signals</h4>
                    <span className="text-[9px] font-mono text-gray-400">CLOCK SURGES & DEPENDENCY TRiggers</span>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-brand-highlight font-bold">
                  5 ACTIVE
                  </div>
              </motion.div>

              {/* Step 4: Financial Intelligence Report */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-gradient-to-r from-brand-primary/25 to-brand-secondary/25 border border-brand-primary/35 shadow-xl relative z-10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                    <FileCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Financial Intelligence Report</h4>
                    <span className="text-[9px] font-mono text-purple-200">EXPLAINS THE WHY BEHIND OUTFLOW TRANSACTIONS</span>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-brand-highlight animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Side-by-Side Value Proposition Component */}
      <section className="w-full max-w-5xl mx-auto px-6 py-12 border-t border-white/5 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-display font-black text-white">
            Most finance apps tell you <span className="text-gray-500">where your money went</span>.<br className="hidden sm:inline" />
            Signal reveals <span className="bg-gradient-to-r from-brand-primary to-brand-highlight bg-clip-text text-transparent">why</span>.
          </h2>
          <p className="text-xs text-gray-400 font-mono tracking-wide uppercase">RE-ARCHITECTING DISCRETIONARY OVERVIEW</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Standard Budgeting Apps */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Traditional Budgeting App</span>
              <span className="text-xs text-red-400 font-mono font-semibold">Backward-Looking</span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">"Spent ₹4,700 on Food Delivery"</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Offers generic cuts and static backward charts after your capital has left. It categorizes transaction amounts without identifying underlying behavior.
            </p>
            <div className="h-10 w-full bg-white/5 rounded-lg flex items-center justify-between px-4 text-[11px] font-mono text-gray-500">
              <span>Food Delivery: 12% of Outflow</span>
              <span className="text-red-400 font-bold">+₹1,900 above cap</span>
            </div>
          </div>

          {/* Signal Platform */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-brand-primary/20 bg-brand-primary/[0.02]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between border-b border-brand-primary/10 pb-4 mb-4">
              <span className="text-[10px] font-mono uppercase text-brand-primary tracking-wider">Signal platform</span>
              <span className="text-xs text-brand-success font-mono font-bold tracking-wider">Predictive & Behavioral</span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">"Friday Evening Fatigue Peak"</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Pinpoints recurring comfort spikes occurring exactly between 6:00 PM and 8:00 PM on Friday workdays, triggered by work stress and decision exhaustion.
            </p>
            <div className="h-10 w-full bg-brand-primary/10 rounded-lg flex items-center justify-between px-4 text-[11px] font-mono text-brand-highlight font-bold">
              <span>✓ Identifies Fatigue Loop Trigger</span>
              <span className="text-brand-success">Suggests: 2h Post-Work Freeze &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Feature Cards Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -6, bg: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(124, 58, 237, 0.2)" }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-4 transition duration-300 group-hover:scale-110">
              <Zap className="w-5 h-5 text-brand-primary" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-2">Behavioral Signals</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Identifies cyclic weekend outflows and evening surges driven by high-convenience purchase triggers.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -6, bg: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(59, 130, 246, 0.2)" }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center mb-4 transition duration-300 group-hover:scale-110">
              <Moon className="w-5 h-5 text-brand-secondary" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-2">Habit Detection</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Deconstructs structural patterns, subscription creep rates, and merchant concentration risks.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -6, bg: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(34, 211, 238, 0.2)" }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-highlight/10 border border-brand-highlight/20 flex items-center justify-center mb-4 transition duration-300 group-hover:scale-110">
              <Building className="w-5 h-5 text-brand-highlight" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-2">Spending Intelligence</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Precise temporal and category metrics. Standard tools count numbers; we outline the underlying habit loop.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            whileHover={{ y: -6, bg: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(16, 185, 129, 0.2)" }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-success/10 border border-brand-success/20 flex items-center justify-center mb-4 transition duration-300 group-hover:scale-110">
              <Sparkles className="w-5 h-5 text-brand-success" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-2">AI Insights</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Advanced behavioral analysis briefings. Translates transaction sequences into actionable habit adjustments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[10px] font-mono text-gray-600 border-t border-white/5 max-w-7xl mx-auto">
        SIGNAL FINANCIAL INTELLIGENCE GROUP © 2026. SECURED BY server-side GEMINI ENGINE.
      </footer>
    </div>
  );
}
