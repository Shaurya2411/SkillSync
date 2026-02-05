
import React, { useState, useMemo } from 'react';
import { CareerOpportunity, UserData } from '../types';
import { generateJobPitch } from '../services/gemini';

interface SwipeInterfaceProps {
  opportunities: CareerOpportunity[];
  onBack: () => void;
  onFinish: () => void;
  userData: UserData | null;
  analysis: any;
  onSave: (opp: CareerOpportunity) => void;
  onApply: (opp: CareerOpportunity) => void;
  appliedIds: Set<number>;
}

const SwipeInterface: React.FC<SwipeInterfaceProps> = ({ opportunities, onBack, onFinish, userData, analysis, onSave, onApply, appliedIds }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [applyingJob, setApplyingJob] = useState<CareerOpportunity | null>(null);
  const [generatedPitch, setGeneratedPitch] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= opportunities.length) return;
    setExitDirection(direction);
    if (direction === 'right') {
      onSave(opportunities[currentIndex]);
    }
    setTimeout(() => {
      setExitDirection(null);
      setCurrentIndex(prev => prev + 1);
    }, 400);
  };

  const handleApplyClick = async (job: CareerOpportunity) => {
    setApplyingJob(job);
    setIsGenerating(true);
    const pitch = await generateJobPitch(job, userData, analysis);
    setGeneratedPitch(pitch);
    setIsGenerating(false);
  };

  const confirmApplication = () => {
    if (applyingJob) {
      onApply(applyingJob);
      window.open(applyingJob.sourceUrl, '_blank');
      setApplyingJob(null);
      setGeneratedPitch('');
      handleSwipe('right');
    }
  };

  const calculateMatchScore = (job: CareerOpportunity) => {
    if (!userData) return 0;
    const userSkills = new Set(userData.skills.map(s => s.toLowerCase()));
    const matchingSkills = job.skillsReq.filter(s => userSkills.has(s.toLowerCase())).length;
    const skillBonus = (matchingSkills / job.skillsReq.length) * 50;
    const readinessBonus = (analysis.score.total / 100) * 50;
    return Math.round(skillBonus + readinessBonus);
  };

  if (currentIndex >= opportunities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in zoom-in duration-500 relative">
        <div className="size-32 bg-[#0df259]/10 rounded-full flex items-center justify-center mb-8 text-[#0df259] border border-[#0df259]/20 shadow-[0_0_50px_rgba(13,242,89,0.1)]">
          <span className="material-symbols-outlined text-6xl">radar</span>
        </div>
        <h2 className="text-4xl font-black mb-4 tracking-tighter">Market Sweep Complete</h2>
        <p className="text-[#9cbaa6] mb-10 max-w-md text-lg leading-relaxed">
          Our AI has indexed all active high-match opportunities for your profile. 
          Manage your pipeline in the Hub.
        </p>
        <button onClick={onFinish} className="px-10 py-4 bg-[#0df259] text-[#102216] font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2">
          VIEW SAVED APPLICATIONS <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    );
  }

  const currentJob = opportunities[currentIndex];
  const matchScore = calculateMatchScore(currentJob);

  return (
    <div className="flex flex-col items-center py-6 min-h-[700px]">
      {/* Pitch Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#102216]/95 backdrop-blur-md">
          <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[3rem] p-10 max-w-xl w-full shadow-2xl animate-in fade-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-3xl font-black text-white tracking-tighter">AI Market Pitch</h3>
                   <p className="text-[#9cbaa6] text-sm">Tailored for {applyingJob.company}</p>
                </div>
                <button onClick={() => setApplyingJob(null)} className="size-10 rounded-full bg-[#28392e] text-[#9cbaa6] flex items-center justify-center hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             <div className="bg-[#102216] p-8 rounded-[2rem] border border-[#3b5443] mb-10 min-h-[220px] relative">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center gap-6 py-10">
                     <div className="size-12 border-4 border-[#0df259] border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-[#0df259] font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Qualifications...</p>
                  </div>
                ) : (
                  <p className="text-white leading-relaxed text-sm whitespace-pre-wrap italic">"{generatedPitch}"</p>
                )}
                <div className="absolute -bottom-3 -right-3 bg-[#0df259] text-[#102216] px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Verified Pitch</div>
             </div>
             <button onClick={confirmApplication} disabled={isGenerating} className="w-full py-5 bg-[#0df259] text-[#102216] font-black rounded-2xl shadow-[0_15px_40px_rgba(13,242,89,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                OPEN PORTAL <span className="material-symbols-outlined">open_in_new</span>
             </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg flex justify-between items-center mb-10 px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-[#9cbaa6] hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Dashboard
        </button>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-2">
             <div className="size-2 bg-red-500 rounded-full animate-pulse"></div>
             <span className="text-[#9cbaa6] font-black text-[9px] uppercase tracking-[0.2em]">LIVE MARKET FEED</span>
          </div>
          <div className="flex gap-1">
             {opportunities.map((_, i) => (
               <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-[#0df259]' : i < currentIndex ? 'w-2 bg-[#0df259]/40' : 'w-2 bg-[#28392e]'}`}></div>
             ))}
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-lg h-[620px] px-4">
        {/* Card Stacks Visual */}
        {currentIndex + 1 < opportunities.length && (
          <div className="absolute inset-x-8 top-6 h-full bg-[#1a2e20]/40 border border-[#3b5443]/50 rounded-[3.5rem] -z-10 scale-95 translate-y-4"></div>
        )}

        <div className={`h-full bg-[#1a2e20] border-2 border-[#3b5443] rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-10 flex flex-col swipe-card ${exitDirection === 'left' ? 'exit-left' : exitDirection === 'right' ? 'exit-right' : ''}`}>
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
               <div className="px-3 py-1 bg-[#0df259]/10 border border-[#0df259]/30 text-[#0df259] text-[9px] font-black uppercase tracking-widest rounded-lg w-fit">
                  {currentJob.type}
               </div>
               {currentJob.locationInfo && (
                  <div className="flex items-center gap-1 text-[10px] text-[#9cbaa6] font-bold">
                     <span className="material-symbols-outlined text-xs text-[#0df259]">location_on</span>
                     {currentJob.locationInfo}
                  </div>
               )}
            </div>
            
            <div className="relative size-20">
               <svg className="size-full" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#28392e" strokeWidth="3"></circle>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#0df259" strokeWidth="3" 
                    strokeDasharray={`${matchScore}, 100`} 
                    strokeLinecap="round" 
                    transform="rotate(-90 18 18)"
                    className="transition-all duration-1000 ease-out"
                  ></circle>
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-lg leading-none">{matchScore}%</span>
                  <span className="text-[6px] font-black text-[#9cbaa6] uppercase tracking-tighter">Match</span>
               </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-4xl font-black text-white mt-2 leading-none tracking-tighter">{currentJob.role}</h3>
              <p className="text-xl text-[#0df259] font-black mt-2 tracking-tight opacity-90">{currentJob.company}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {currentJob.skillsReq.slice(0, 5).map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-[#102216] border border-[#3b5443] rounded-xl text-[10px] font-black uppercase text-white hover:border-[#0df259]/40 transition-colors">
                  {skill}
                </span>
              ))}
            </div>

            <div className="relative">
               <span className="material-symbols-outlined absolute -top-4 -left-4 text-3xl text-[#28392e] opacity-50 select-none">format_quote</span>
               <p className="text-[#9cbaa6] text-base leading-relaxed line-clamp-4 italic relative z-10 pl-2">
                 {currentJob.description}
               </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-6">
            <button 
              onClick={() => handleApplyClick(currentJob)}
              className="w-full py-5 bg-[#0df259] text-[#102216] font-black rounded-2xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(13,242,89,0.3)] hover:scale-[1.03] active:scale-95 transition-all text-lg"
            >
              <span className="material-symbols-outlined text-2xl">bolt</span> APPLY INSTANTLY
            </button>
            <div className="flex justify-around items-center px-4">
              <button 
                onClick={() => handleSwipe('left')} 
                className="size-16 rounded-full border-2 border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white hover:scale-110 hover:border-red-500 transition-all shadow-xl active:scale-90"
                title="Pass"
              >
                <span className="material-symbols-outlined text-4xl font-black">close</span>
              </button>
              <button 
                onClick={() => handleSwipe('right')} 
                className="size-16 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[#102216] hover:scale-110 hover:border-white transition-all shadow-xl active:scale-90"
                title="Save"
              >
                <span className="material-symbols-outlined text-4xl font-black">favorite</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 flex items-center gap-10">
         <div className="flex flex-col items-center gap-1 opacity-50">
            <span className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-widest">Swipe Left</span>
            <span className="material-symbols-outlined text-white">keyboard_arrow_left</span>
         </div>
         <p className="text-[#9cbaa6] text-[10px] font-black uppercase tracking-[0.4em] px-6 border-x border-[#28392e]">
           MATCHING ENGINE ACTIVE
         </p>
         <div className="flex flex-col items-center gap-1 opacity-50">
            <span className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-widest">Swipe Right</span>
            <span className="material-symbols-outlined text-white">keyboard_arrow_right</span>
         </div>
      </div>
    </div>
  );
};

export default SwipeInterface;
