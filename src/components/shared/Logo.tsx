import React from 'react';

export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-slate-900 ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="h-full w-auto" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Center Diamond */}
        <path d="M 50 35 L 65 50 L 50 65 L 35 50 Z" /> 
        
        {/* Upper petals */}
        <path d="M 35 50 L 15 35 L 30 15 L 50 25 L 70 15 L 85 35 L 65 50" /> 
        
        {/* Lower shield/petals */}
        <path d="M 15 35 L 15 50 C 15 75 35 90 50 95 C 65 90 85 75 85 50 L 85 35" />
        
        {/* Bottom teardrop/loop */}
        <path d="M 50 65 C 35 85 65 85 50 65" />
      </svg>
      <span className="font-sans text-xl tracking-tight flex items-center">
        <span className="font-bold">LUXE</span>
        <span className="font-medium text-slate-700">FLOWER</span>
      </span>
    </div>
  );
}
