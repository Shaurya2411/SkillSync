
import React, { useState, useEffect } from 'react';

const LOG_MESSAGES = [
  "Initializing SkillSync AI Audit Engine...",
  "Requesting secure environment access...",
  "Establishing neural link with Global Career Database...",
  "Scraping GitHub technical density...",
  "Analyzing LinkedIn semantic branding...",
  "Parsing Resume ATS compliance...",
  "Detecting local market proximity...",
  "Optimizing strategy for target role...",
  "Calculating five-point readiness radar...",
  "Finalizing executive audit report...",
  "Syncing career roadmap milestones..."
];

const AuditConsole: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (currentIdx < LOG_MESSAGES.length) {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, LOG_MESSAGES[currentIdx]]);
        setCurrentIdx(prev => prev + 1);
      }, 800 + Math.random() * 1200);
      return () => clearTimeout(timeout);
    }
  }, [currentIdx]);

  return (
    <div className="fixed inset-0 z-[2000] bg-[#102216] flex items-center justify-center p-6 backdrop-blur-3xl">
      <div className="w-full max-w-2xl bg-[#1a2e20] border border-[#3b5443] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(13,242,89,0.1)] flex flex-col h-[500px]">
        <div className="bg-[#28392e] p-4 flex items-center justify-between border-b border-[#3b5443]">
          <div className="flex gap-2">
            <div className="size-3 rounded-full bg-red-500/50"></div>
            <div className="size-3 rounded-full bg-yellow-500/50"></div>
            <div className="size-3 rounded-full bg-[#0df259]/50"></div>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-[#0df259] uppercase tracking-widest animate-pulse">Audit in Progress</span>
             <div className="size-2 bg-[#0df259] rounded-full"></div>
          </div>
        </div>
        <div className="flex-1 p-8 font-mono text-[11px] text-[#9cbaa6] overflow-y-auto space-y-3 custom-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 animate-in slide-in-from-left-2 duration-300">
              <span className="text-[#0df259]/40 select-none">[{new Date().toLocaleTimeString()}]</span>
              <span className={i === logs.length - 1 ? "text-white font-bold" : ""}>
                {log}
                {i === logs.length - 1 && <span className="inline-block w-2 h-4 bg-[#0df259] ml-2 animate-blink"></span>}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-white">Awaiting system initialization...</div>
          )}
        </div>
        <div className="p-4 bg-[#102216]/50 border-t border-[#3b5443] flex items-center justify-center gap-4">
           <div className="h-1 flex-1 bg-[#28392e] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0df259] transition-all duration-500" 
                style={{ width: `${(currentIdx / LOG_MESSAGES.length) * 100}%` }}
              ></div>
           </div>
           <span className="text-[10px] font-black text-white w-8">{Math.round((currentIdx / LOG_MESSAGES.length) * 100)}%</span>
        </div>
      </div>
      
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .animate-blink { animation: blink 1s step-end infinite; }
      `}</style>
    </div>
  );
};

export default AuditConsole;
