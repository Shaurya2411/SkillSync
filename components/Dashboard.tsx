
import React, { useState } from 'react';
import { AnalysisResult, CareerOpportunity } from '../types';
import { playVerdictAudio } from '../services/gemini';
import RadarChart from './RadarChart';

interface DashboardProps {
  analysis: AnalysisResult;
  onFindJobs: () => void;
  onRecalculate: () => void;
  onViewApplications: () => void;
  savedJobs: CareerOpportunity[];
  appliedJobs: CareerOpportunity[];
  onApply: (opp: CareerOpportunity) => void;
  userData: any;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, onFindJobs, onRecalculate, onViewApplications, savedJobs, appliedJobs, onApply, userData }) => {
  const { score, verdict, linkedinInsight, githubInsight, resumeInsight, missingSkills, salaryRange, roadmap, recommendedCourses, linkedinVerified, githubVerified, linkedinBioEdit, resumeEdits, radarData, groundingLinks } = analysis;
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<{ label: string, text: string, icon: string } | null>(null);
  
  const handlePlayVoice = async () => {
    setIsPlaying(true);
    await playVerdictAudio(verdict);
    setIsPlaying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Ensure salary is formatted with Rupee symbol as per request
  const formattedSalary = salaryRange.includes('₹') ? salaryRange : `₹${salaryRange}`;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-8">
      {/* Insight Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-[#102216]/90 backdrop-blur-xl">
          <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="size-14 bg-[#0df259]/10 rounded-2xl flex items-center justify-center text-[#0df259] border border-[#0df259]/20">
                  <span className="material-symbols-outlined text-3xl">{selectedInsight.icon}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{selectedInsight.label}</h3>
                  <p className="text-[#0df259] text-[10px] font-black tracking-[0.3em]">DEEP ANALYSIS ACTIVE</p>
                </div>
              </div>
              <button onClick={() => setSelectedInsight(null)} className="size-10 rounded-full bg-[#28392e] text-[#9cbaa6] flex items-center justify-center hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-[#102216] p-8 rounded-[2.5rem] border border-[#3b5443] mb-8 shadow-inner">
              <p className="text-white text-lg leading-relaxed font-medium italic">
                {selectedInsight.text}
              </p>
            </div>
            <button 
              onClick={() => setSelectedInsight(null)}
              className="w-full py-5 bg-[#0df259] text-[#102216] font-black rounded-2xl hover:scale-[1.02] transition-all shadow-lg"
            >
              ACKNOWLEDGE INSIGHT
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-[#0df259] text-[#102216] text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-[0_0_20px_rgba(13,242,89,0.3)]">
                Audit Finalized
             </div>
             <div className="h-px w-12 bg-[#28392e]"></div>
             <span className="text-[#9cbaa6] text-[10px] font-black uppercase tracking-widest">ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
          </div>
          <h1 className="text-8xl font-black text-white tracking-tighter leading-none">Readiness <span className="text-[#0df259]">Sync</span>.</h1>
          <p className="text-[#9cbaa6] text-2xl font-medium tracking-tight">Executive analysis for <span className="text-white border-b-2 border-[#0df259]">{formattedSalary}</span> market positions.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onRecalculate}
            className="px-6 py-5 rounded-2xl bg-[#1a2e20] text-[#9cbaa6] border border-[#3b5443] font-black text-xs hover:text-[#0df259] hover:border-[#0df259]/50 transition-all flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-lg">settings_backup_restore</span> RESET DATA
          </button>
          <button 
            onClick={onFindJobs}
            className="px-10 py-5 rounded-2xl bg-[#0df259] text-[#102216] font-black text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-[0_15px_40px_rgba(13,242,89,0.3)] flex items-center gap-3"
          >
            DISCOVER OPPORTUNITIES <span className="material-symbols-outlined">rocket_launch</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[4rem] p-12 flex flex-col md:row items-center gap-16 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#0df259] to-transparent opacity-50"></div>
            
            <div className="relative size-80 flex-shrink-0 flex items-center justify-center">
              <div className="absolute inset-[-20px] rounded-full border border-[#0df259]/5 animate-pulse"></div>
              <RadarChart data={radarData} size={300} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="bg-[#102216] size-20 rounded-full border-2 border-[#3b5443] flex flex-col items-center justify-center shadow-2xl backdrop-blur-md">
                    <span className="text-[#0df259] text-3xl font-black tracking-tighter leading-none">{Math.round(score.total)}</span>
                    <span className="text-[#9cbaa6] text-[8px] font-black uppercase tracking-tighter">Sync %</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 space-y-8 w-full">
               <div className="bg-[#102216] p-8 rounded-[3rem] border border-[#3b5443] relative shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[#0df259] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm animate-pulse text-[#0df259]">psychology</span>
                      AI Coach Verdict
                    </p>
                    <button 
                      onClick={handlePlayVoice} 
                      disabled={isPlaying} 
                      className={`size-10 rounded-xl flex items-center justify-center transition-all ${isPlaying ? 'bg-[#0df259] text-[#102216]' : 'bg-[#28392e] text-[#0df259] hover:bg-[#0df259] hover:text-[#102216]'}`}
                    >
                      <span className="material-symbols-outlined text-xl">{isPlaying ? 'graphic_eq' : 'play_arrow'}</span>
                    </button>
                  </div>
                  <p className="text-white text-xl leading-relaxed italic font-medium">"{verdict}"</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InsightRow 
                    icon="terminal" 
                    label="GITHUB HEALTH" 
                    text={githubInsight} 
                    verified={githubVerified}
                    onClick={() => setSelectedInsight({ label: "GITHUB HEALTH", text: githubInsight, icon: "terminal" })}
                  />
                  <InsightRow 
                    icon="description" 
                    label="ATS COMPLIANCE" 
                    text={resumeInsight} 
                    verified={true}
                    onClick={() => setSelectedInsight({ label: "ATS COMPLIANCE", text: resumeInsight, icon: "description" })}
                  />
                  <InsightRow 
                    icon="account_tree" 
                    label="BRAND SIGNAL" 
                    text={linkedinInsight} 
                    verified={linkedinVerified}
                    onClick={() => setSelectedInsight({ label: "BRAND SIGNAL", text: linkedinInsight, icon: "account_tree" })}
                  />
                  <InsightRow 
                    icon="trending_up" 
                    label="MARKET VALUE" 
                    text={`Est. ${formattedSalary} (Fresh Graduate Level)`} 
                    verified={true}
                    onClick={() => setSelectedInsight({ label: "MARKET VALUE", text: `Your estimated annual market value is ${formattedSalary} based on current target role requirements and elite competitive coding profile.`, icon: "trending_up" })}
                  />
               </div>
            </div>
          </div>

          <div 
            onClick={onViewApplications}
            className="bg-[#102216] border border-[#3b5443] rounded-[3rem] p-10 flex flex-col md:row items-center justify-between gap-8 group hover:border-[#0df259] transition-all cursor-pointer shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#0df259]/5 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-8 relative z-10">
               <div className="size-20 bg-[#0df259]/10 rounded-[2rem] flex items-center justify-center text-[#0df259] border border-[#0df259]/20 group-hover:bg-[#0df259] group-hover:text-[#102216] transition-all duration-500">
                  <span className="material-symbols-outlined text-4xl">folder_special</span>
               </div>
               <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">Application Command Center</h3>
                  <p className="text-[#9cbaa6] text-base font-medium">Manage {savedJobs.length} potential leads and {appliedJobs.length} active applications.</p>
               </div>
            </div>
            <button className="px-8 py-4 bg-[#28392e] text-[#0df259] font-black rounded-2xl hover:bg-[#0df259] hover:text-[#102216] transition-all relative z-10">
              GO TO HUB
            </button>
          </div>

          {groundingLinks && groundingLinks.length > 0 && (
            <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[3rem] p-8 shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                 <span className="material-symbols-outlined text-[#0df259] text-xl">travel_explore</span>
                 <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Live Intelligence Sources</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groundingLinks.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-[#102216] rounded-2xl border border-[#3b5443] hover:border-[#0df259]/50 transition-all group"
                    >
                      <span className="text-[#9cbaa6] text-[10px] font-black uppercase tracking-widest truncate max-w-[80%]">{link.title}</span>
                      <span className="material-symbols-outlined text-sm text-[#0df259] group-hover:translate-x-1 transition-transform">arrow_outward</span>
                    </a>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Sidebar with Recommended Courses */}
        <div className="lg:col-span-4 space-y-10">
           <div className="bg-[#102216] border border-[#3b5443] rounded-[3rem] p-8 shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4">
                <span className="material-symbols-outlined text-[#0df259]/20 text-4xl group-hover:scale-110 transition-transform">school</span>
             </div>
             <p className="text-[#0df259] text-[11px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">auto_awesome</span> Curated Upskilling
             </p>
             <div className="space-y-4">
                {recommendedCourses && recommendedCourses.length > 0 ? recommendedCourses.map((course, idx) => (
                  <a 
                    key={idx} 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-5 bg-[#1a2e20] border border-[#3b5443] rounded-2xl hover:border-[#0df259] transition-all group/card shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[9px] font-black text-[#0df259] uppercase tracking-[0.1em] px-2 py-0.5 bg-[#0df259]/10 rounded border border-[#0df259]/20">
                         {course.platform}
                       </span>
                       <span className="material-symbols-outlined text-sm text-[#9cbaa6] group-hover/card:text-[#0df259] group-hover/card:translate-x-1 transition-all">arrow_forward</span>
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1 line-clamp-2 leading-tight">{course.title}</h4>
                    <p className="text-[#9cbaa6] text-[10px] italic leading-relaxed">{course.reason}</p>
                  </a>
                )) : (
                  <p className="text-[#9cbaa6] text-[10px] font-bold text-center py-4">No specific skill gaps detected.</p>
                )}
             </div>
          </div>

          <div className="bg-[#102216] border border-[#3b5443] rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] font-black text-[#0df259]/20 uppercase tracking-[0.5em] rotate-90 origin-right">ROADMAP</span>
             </div>
             <h3 className="text-white font-black text-3xl tracking-tighter mb-10">Sync Timeline</h3>
             <div className="space-y-10 relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#0df259] to-[#28392e]"></div>
                {roadmap.map((item, idx) => (
                  <div key={idx} className="relative pl-12 group">
                     <div className="absolute left-0 top-1 size-8 rounded-xl bg-[#1a2e20] border-2 border-[#3b5443] flex items-center justify-center text-[#0df259] font-black text-xs z-10 group-hover:border-[#0df259] transition-all">
                        {idx + 1}
                     </div>
                     <p className="text-[10px] font-black text-[#0df259] uppercase tracking-[0.2em] mb-1.5">{item.month}</p>
                     <p className="text-white font-black text-lg mb-1 leading-none tracking-tight">{item.task}</p>
                     <p className="text-[#9cbaa6] text-sm italic font-medium">{item.impact}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightRow: React.FC<{ icon: string; label: string; text: string; verified?: boolean; onClick?: () => void }> = ({ icon, label, text, verified, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-[#102216] p-4 rounded-[2rem] border border-[#3b5443]/50 flex items-center gap-4 transition-all hover:border-[#0df259] shadow-sm relative overflow-hidden group cursor-pointer active:scale-95"
  >
    {verified && (
      <div className="absolute top-4 right-4 flex items-center justify-center">
         <div className="size-1.5 bg-[#0df259] rounded-full shadow-[0_0_8px_rgba(13,242,89,0.8)]"></div>
      </div>
    )}

    <div className="size-11 bg-[#1a2e20] border border-[#3b5443]/60 rounded-xl flex items-center justify-center text-[#0df259] shrink-0 group-hover:scale-105 transition-transform">
       <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>

    <div className="flex-1 min-w-0 pr-4">
      <p className="text-[#9cbaa6] text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-1.5">{label}</p>
      <p className="text-white text-[12px] font-bold leading-tight line-clamp-2 overflow-hidden text-ellipsis">
        {text}
      </p>
    </div>
  </div>
);

export default Dashboard;
