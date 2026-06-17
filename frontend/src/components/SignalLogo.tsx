import React from "react";

interface SignalLogoProps {
  className?: string;
}

export default function SignalLogo({ className = "w-6 h-6" }: SignalLogoProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Radar concentric circular signal propagation waves */}
        <path 
          d="M3 13.5C7 8.5 11.5 7.5 16 11.5" 
          stroke="url(#sig-logo-grad-1)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M7 16.5C10 13 13.5 12 17 15" 
          stroke="url(#sig-logo-grad-2)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          opacity="0.85"
        />
        {/* Dynamic central pulse point representing detection */}
        <circle cx="12" cy="19.5" r="2" fill="#22D3EE" className="animate-pulse" />
        
        <defs>
          <linearGradient id="sig-logo-grad-1" x1="3" y1="13.5" x2="16" y2="11.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="sig-logo-grad-2" x1="7" y1="16.5" x2="17" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
