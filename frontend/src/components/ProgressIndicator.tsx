import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Compass, Cpu, Layers, Activity, Sparkles } from "lucide-react";

interface ProgressIndicatorProps {
  onComplete: () => void;
  schemaName?: string;
}

export default function ProgressIndicator({ onComplete, schemaName }: ProgressIndicatorProps) {
  const [step, setStep] = useState(0);
  const [percent, setPercent] = useState(0);

  const stepsList = [
    { title: "Importing Transactions", icon: Compass, desc: "Reading and structuring secure ledger flows..." },
    { title: "Categorizing Spending Activity", icon: Layers, desc: "Structuring transactions into essential and discretionary buckets..." },
    { title: "Detecting Financial Patterns", icon: Cpu, desc: "Identifying recurring outlets, timing clumps, and comfort leaks..." },
    { title: "Computing Behavioral Signals", icon: Activity, desc: "Calculating temporal consistency and confidence scores..." },
    { title: "Generating Intelligence Report", icon: Sparkles, desc: "Formatting the final interactive diagnostic dashboard..." }
  ];

  useEffect(() => {
    // Elegant progression timeline simulation to build authentic excitement
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 100;
        }
        
        const next = prev + Math.floor(Math.random() * 8) + 3;
        const bounded = Math.min(next, 100);

        // Adjust step according to percentage
        if (bounded >= 80) {
          setStep(4);
        } else if (bounded >= 60) {
          setStep(3);
        } else if (bounded >= 40) {
          setStep(2);
        } else if (bounded >= 20) {
          setStep(1);
        } else {
          setStep(0);
        }

        return bounsc(bounded);
      });
    }, 150);

    const bounsc = (p: number) => p;

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="relative min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6 text-gray-100">
      {/* Dynamic glow rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-brand-primary/10 animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-brand-secondary/5 animate-reverse-pulse pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl p-8 rounded-3xl border border-white/5 bg-[#0b1020]/80 backdrop-blur-2xl shadow-2xl relative text-left overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-highlight" style={{ width: `${percent}%` }} />

        <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a3a3a3]">Analysis Status: Running</span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{schemaName || "DEMO_LEDGER_TRANSCRIPT"}</h2>
          </div>
          <div className="text-right text-3xl font-display font-black text-brand-highlight select-none">
            {percent}%
          </div>
        </div>

        {/* Steps Pipeline */}
        <div className="space-y-6">
          {stepsList.map((st, idx) => {
            const Icon = st.icon;
            const isCompleted = step > idx || percent === 100;
            const isActive = step === idx && percent < 100;
            
            return (
              <div 
                key={idx}
                className={`flex items-start gap-4 transition-all duration-300 ${
                  isCompleted 
                    ? "opacity-100 text-brand-success" 
                    : isActive 
                      ? "opacity-100 text-brand-highlight" 
                      : "opacity-45 text-gray-500"
                }`}
              >
                <div className="pt-0.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isCompleted 
                      ? "bg-brand-success/15 border border-brand-success/30 text-brand-success" 
                      : isActive 
                        ? "bg-brand-highlight/10 border border-brand-highlight/30 text-brand-highlight animate-pulse" 
                        : "bg-white/5 border border-white/10 text-gray-600"
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? "anim-spin" : ""}`} />
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      {st.title}
                    </h4>
                    {isActive && (
                      <span className="text-[9px] font-mono text-brand-highlight animate-pulse font-bold tracking-widest">In Progress</span>
                    )}
                    {isCompleted && (
                      <span className="text-[9px] font-mono text-brand-success font-bold tracking-widest">Complete</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal line at bottom */}
        <div className="mt-8 pt-5 border-t border-white/5 flex items-center gap-3 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-1 text-brand-success animate-pulse">
            <span>●</span>
            <span className="text-[9px] uppercase font-bold tracking-widest">SYSTEM ONLINE</span>
          </div>
          <span className="text-[9px] truncate">Processing ledger data safely: {percent}%</span>
        </div>
      </motion.div>
    </div>
  );
}
