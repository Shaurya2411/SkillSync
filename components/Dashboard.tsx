
import React, { useState } from 'react';
import { AnalysisResult, Course, CareerOpportunity } from '../types';
import { playVerdictAudio, generateJobPitch } from '../services/gemini';
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
  const { score, verdict, linkedinInsight, githubInsight, resumeInsight, missingSkills, salaryRange, roadmap, recommendedCourses, linkedinVerified, githubVerified, linkedinBioEdit, resumeEdits, githubActionItems, radarData, groundingLinks } = analysis;
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlayVoice = async () => {
    setIsPlaying(true);
    await playVerdictAudio(verdict);
    setIsPlaying(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-8">
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
          <p className="text-[#9cbaa6] text-2xl font-medium tracking-tight">Executive analysis for <span className="text-white border-b-2 border-[#0df259]">{salaryRange}</span> market positions.</p>
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
        {/* Main Intelligence Block */}
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
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InsightRow icon="terminal" label="GitHub Health" text={githubInsight} verified={githubVerified} />
                  <InsightRow icon="description" label="ATS Compliance" text={resumeInsight} verified={true} />
                  <InsightRow icon="account_tree" label="Brand Signal" text={linkedinInsight} verified={linkedinVerified} />
                  <InsightRow icon="trending_up" label="Market Value" text={`Est. ${salaryRange}`} verified={true} />
               </div>
            </div>
          </div>

          {/* Quick Access to Hub */}
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
                  <h3 className="text-3xl font-black text-white tracking-tight">Application Command Center</h3>
                  <p className="text-[#9cbaa6] text-base font-medium">Manage {savedJobs.length} potential leads and {appliedJobs.length} active applications.</p>
               </div>
            </div>
            <button className="px-8 py-4 bg-[#28392e] text-[#0df259] font-black rounded-2xl hover:bg-[#0df259] hover:text-[#102216] transition-all relative z-10">
              GO TO HUB
            </button>
          </div>

          {/* Intelligence Sources (Compliance) */}
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

          {/* Strategy Section */}
          <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[4rem] p-12 space-y-10 shadow-2xl">
            <h2 className="text-4xl font-black text-white tracking-tighter">Strategic <span className="text-[#0df259]">Refinement</span>.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#0df259] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm">edit_square</span> BRAND POSITIONING
                  </h3>
                  <button onClick={() => copyToClipboard(linkedinBioEdit)} className="text-[10px] font-black text-[#9cbaa6] hover:text-[#0df259] transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">content_copy</span> COPY
                  </button>
                </div>
                <div className="bg-[#102216] p-8 rounded-[2.5rem] border border-[#3b5443] text-[#9cbaa6] text-sm leading-relaxed italic relative group shadow-inner">
                   "{linkedinBioEdit}"
                   <div className="absolute -bottom-4 -right-4 bg-[#0df259] text-[#102216] size-12 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                      <span className="material-symbols-outlined">draw</span>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-[#0df259] text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm">checklist_rtl</span> ACTION ITEMS
                 </h3>
                 <div className="space-y-4">
                    {resumeEdits.slice(0, 3).map((edit, idx) => (
                      <div key={idx} className="bg-[#102216] p-5 rounded-2xl border border-[#3b5443] text-white text-xs flex items-start gap-4 hover:border-[#0df259]/30 transition-all">
                        <span className="text-[#0df259] font-black text-sm">0{idx+1}</span>
                        <p className="font-medium">{edit}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-10">
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
          
          <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[3rem] p-8 shadow-xl">
             <p className="text-[#9cbaa6] text-[11px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">warning</span> Skill Gaps Detected
             </p>
             <div className="flex flex-wrap gap-2.5">
                {missingSkills.map(skill => (
                  <div key={skill} className="px-4 py-2 bg-[#102216] text-[#0df259] text-[10px] font-black border border-[#3b5443] rounded-xl hover:scale-105 transition-all">
                    {skill}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Pillar Performance */}
      <div className="bg-[#102216] p-12 rounded-[4rem] border border-[#3b5443] shadow-2xl">
        <div className="flex justify-between items-center mb-12">
           <h2 className="text-white text-3xl font-black tracking-tighter">Pillar Performance Metrics</h2>
           <span className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-[0.3em]">Aggregate Data V1.0</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <Metric label="Digital Branding" current={score.linkedin} max={15} color="#0df259" icon="share" />
          <Metric label="Technical Depth" current={score.github} max={15} color="#fff" icon="terminal" />
          <Metric label="Resume Power" current={score.resume} max={15} color="#0df259" icon="description" />
          <Metric label="Core Skills" current={score.skills} max={10} color="#0df259" icon="construction" />
          <Metric label="Experience History" current={score.internships} max={15} color="#0df259" icon="work_history" />
          <Metric label="Academic Merit" current={score.academics} max={10} color="#0df259" icon="school" />
          <Metric label="Project Scaling" current={score.projects} max={10} color="#0df259" icon="account_tree" />
          <Metric label="Certifications" current={score.coursera} max={10} color="#0056D2" icon="workspace_premium" />
        </div>
      </div>
    </div>
  );
};

const InsightRow: React.FC<{ icon: string; label: string; text: string; verified?: boolean }> = ({ icon, label, text, verified }) => (
  <div className={`bg-[#102216] p-5 rounded-[2rem] border ${verified ? 'border-[#0df259]/20' : 'border-[#3b5443]'} flex items-start gap-4 transition-all hover:scale-[1.02] shadow-sm`}>
    <div className="size-10 bg-[#28392e] rounded-xl flex items-center justify-center text-[#0df259] shrink-0">
       <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-white text-[10px] font-black uppercase tracking-widest leading-none opacity-60">{label}</p>
        {verified && (
          <div className="size-2 bg-[#0df259] rounded-full animate-pulse"></div>
        )}
      </div>
      <p className="text-white text-[11px] font-bold leading-tight truncate">{text}</p>
    </div>
  </div>
);

const Metric: React.FC<{ label: string; current: number; max: number; color: string; icon: string }> = ({ label, current, max, color, icon }) => {
  const percent = (current / max) * 100;
  return (
    <div className="space-y-4 group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <span className="material-symbols-outlined text-sm text-[#0df259] group-hover:scale-125 transition-transform">{icon}</span>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9cbaa6]">{label}</span>
        </div>
        <span className="text-white font-black text-xl tracking-tighter">{Math.round(current)}<span className="text-[10px] opacity-40">/{max}</span></span>
      </div>
      <div className="h-2 w-full bg-[#28392e] rounded-full overflow-hidden shadow-inner">
        <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(13,242,89,0.2)]" style={{ width: `${percent}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
}

export default Dashboard;
