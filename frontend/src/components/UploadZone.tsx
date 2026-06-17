import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, Sparkles, Check, ChevronRight, HelpCircle, Terminal } from "lucide-react";
import { Transaction } from "../types";
import { FOUNDER_DATASET, URBAN_HIGH_EARNER, MINIMALIST_DATASET } from "../data/mockDatasets";

interface UploadZoneProps {
  onDataLoaded: (txs: Transaction[], schemaName: string) => void;
  onViewDemo: () => void;
  onBackToLanding: () => void;
}

export default function UploadZone({ onDataLoaded, onViewDemo, onBackToLanding }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV/JSON transaction lines
  const parseFileContent = (content: string, fileName: string) => {
    try {
      if (fileName.endsWith(".json")) {
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : (parsed.transactions || []);
        if (list.length === 0) throw new Error("JSON file is empty or missing a list array.");
        
        // Validate required fields
        const cleaned: Transaction[] = list.map((item: any, idx: number) => ({
          id: item.id || `uploaded_tx_${idx}`,
          date: item.date || new Date().toISOString().split("T")[0],
          time: item.time || "12:00",
          description: item.description || item.payee || "Unlabeled Transaction",
          amount: parseFloat(item.amount) || 0,
          category: item.category || "Other",
          merchant: item.merchant || item.description || "Merchant"
        }));
        
        onDataLoaded(cleaned, fileName);
      } else if (fileName.endsWith(".csv")) {
        // Parse simple CSV (assuming columns: date, time, description, amount, category, merchant)
        // Let's split on newline
        const lines = content.split(/\r?\n/);
        if (lines.length < 2) throw new Error("CSV has insufficient rows.");
        
        const headers = lines[0].toLowerCase().split(",");
        const cleaned: Transaction[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].trim();
          if (!row) continue;
          
          // Simple split by comma ignoring inside quotes for robust parsing
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          
          const getVal = (colNames: string[]): string => {
            const idx = headers.findIndex(h => colNames.some(c => h.includes(c)));
            return idx !== -1 ? cols[idx]?.replace(/^"|"$/g, '').trim() : "";
          };

          const amountVal = parseFloat(getVal(["amount", "value", "spent"])) || 0;
          if (amountVal === 0) continue;

          cleaned.push({
            id: `uploaded_csv_${i}`,
            date: getVal(["date", "time"]) || new Date().toISOString().split("T")[0],
            time: getVal(["time", "hour"]) || "12:00",
            description: getVal(["desc", "payee", "title", "merchant"]) || "Transaction",
            amount: amountVal,
            category: (getVal(["cat", "tag"]) as any) || "Other",
            merchant: getVal(["merchant", "vendor", "payee"]) || "Merchant"
          });
        }

        if (cleaned.length === 0) throw new Error("Could not parse any valid row with amounts in CSV.");
        onDataLoaded(cleaned, fileName);
      } else {
        throw new Error("Unsupported format. Please supply a .json or .csv statement.");
      }
    } catch (err: any) {
      setError(err?.message || "Parsing error. Verify format looks correct.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseFileContent(event.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseFileContent(event.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6 text-gray-100 selection:bg-brand-primary">
      {/* Background orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-8 relative z-10"
      >
        <div className="flex items-center justify-between">
          <button 
            onClick={onBackToLanding}
            className="text-xs font-mono text-gray-500 hover:text-white pb-1 border-b border-transparent hover:border-white transition-all duration-200"
          >
            ← RETREAT TO HUB
          </button>
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-highlight font-bold">STAGE_ONBOARD_TRANSACTIONS</span>
        </div>

        <div className="space-y-3 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-white">
            Upload transaction statements.
          </h2>
          <p className="text-sm text-gray-400 max-w-lg">
            Drag-and-drop secure raw exports from Mercury, Ramp, Stripe, or standard bank exports. Signal compiles the behavior directly.
          </p>
        </div>

        {/* Drag and Drop Zone */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative ${
            isDragActive 
              ? "border-brand-primary bg-brand-primary/10 shadow-[0_0_40px_rgba(124,58,237,0.2)]" 
              : "border-white/10 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/20"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json,.csv" 
            className="hidden" 
          />

          <motion.div 
            whileHover={{ scale: 1.1 }}
            className={`p-4 rounded-full mb-4 transition duration-300 ${
              isDragActive ? "bg-brand-primary/20 text-brand-primary" : "bg-white/5 text-gray-400 group-hover:text-white"
            }`}
          >
            <Upload className="w-8 h-8" />
          </motion.div>

          <h3 className="text-sm font-bold tracking-wider uppercase text-white mb-1">
            {isDragActive ? "RELEASE STATEMENT FILE" : "DRAG & DROP SECURE FILES"}
          </h3>
          <p className="text-[11px] font-mono text-gray-500">
            SUPPORTED EXPORTS: JSON, CSV FORMATS UP TO 10MB
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 tracking-wide font-mono"
            >
              ⚠ {error}
            </motion.div>
          )}
        </div>

        {/* Bento Grid: Try Sample Datasets */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-highlight" />
            <h3 className="text-xs uppercase font-bold tracking-widest text-brand-highlight font-mono">
              OR INSTANTLY COMPILE PRE-BUILT SAMPLES
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Minimalist Dataset */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(16, 185, 129, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.03)" }}
              onClick={() => onDataLoaded(MINIMALIST_DATASET, "minimalist_optimized.json")}
              className="p-5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/15 cursor-pointer text-left transition-all duration-300 flex flex-col justify-between h-40"
            >
              <div>
                <span className="text-[9px] font-mono text-brand-success font-bold tracking-widest uppercase">STABLE PROFILE</span>
                <h4 className="text-xs font-bold text-white mt-1 uppercase">Optimized Minimalist</h4>
                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">
                  High savings rate, very low impulse factors, minimal media creep.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-[#a3a3a3]">10 Tx Logged</span>
                <ChevronRight className="w-3.5 h-3.5 text-brand-success" />
              </div>
            </motion.div>

            {/* Urban Spendthrift Dataset */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(59, 130, 246, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.03)" }}
              onClick={() => onDataLoaded(URBAN_HIGH_EARNER, "urban_high_earner.json")}
              className="p-5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/15 cursor-pointer text-left transition-all duration-300 flex flex-col justify-between h-40"
            >
              <div>
                <span className="text-[9px] font-mono text-brand-secondary font-bold tracking-widest uppercase">HIGH CARD ACTIVITY</span>
                <h4 className="text-xs font-bold text-white mt-1 uppercase">Urban Spendthrift</h4>
                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">
                  Outflows marked by food delivery platforms, caffeine merchants, and ride hailing.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-[#a3a3a3]">23 Tx Logged</span>
                <ChevronRight className="w-3.5 h-3.5 text-brand-secondary" />
              </div>
            </motion.div>

            {/* Startup Founder Dataset */}
            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(124, 58, 237, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.03)" }}
              onClick={() => onDataLoaded(FOUNDER_DATASET, "startup_founder_vault.json")}
              className="p-5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/15 cursor-pointer text-left transition-all duration-300 flex flex-col justify-between h-40"
            >
              <div>
                <span className="text-[9px] font-mono text-brand-primary font-bold tracking-widest uppercase">ENTERPRISE SCALE</span>
                <h4 className="text-xs font-bold text-white mt-1 uppercase">Startup Founder</h4>
                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">
                  Active SaaS spend, team dinners, business commuting, and software renewals.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[10px] font-mono text-[#a3a3a3]">23 Tx Logged</span>
                <ChevronRight className="w-3.5 h-3.5 text-brand-primary" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dynamic preview block */}
        <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-brand-highlight" />
            <span className="font-mono text-[10px]">PROTOCOL: LOCAL BROWSER-SIDE SANITIZATION</span>
          </div>
          <button 
            onClick={onViewDemo}
            className="text-[10px] hover:text-white transition font-mono border-b border-white/20 uppercase"
          >
            Load Large Sandbox Demo &rarr;
          </button>
        </div>
      </motion.div>
    </div>
  );
}
