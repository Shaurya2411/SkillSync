
import React, { useState } from 'react';
import { CareerOpportunity, UserData } from '../types';
import { generateJobPitch, generateInterviewPrep } from '../services/gemini';

interface SavedApplicationsProps {
  savedJobs: CareerOpportunity[];
  appliedJobs: CareerOpportunity[];
  onApply: (opp: CareerOpportunity) => void;
  onRemove: (oppId: number) => void;
  onGoMatch: () => void;
  onBack: () => void;
  userData: UserData | null;
  analysis: any;
}

const SavedApplications: React.FC<SavedApplicationsProps> = ({ 
  savedJobs, 
  appliedJobs, 
  onApply, 
  onRemove, 
  onGoMatch, 
  onBack,
  userData,
  analysis
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'applied'>('saved');
  const [modalType, setModalType] = useState<'pitch' | 'prep' | null>(null);
  const [activeJob, setActiveJob] = useState<CareerOpportunity | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleApplyClick = async (job: CareerOpportunity) => {
    setActiveJob(job);
    setModalType('pitch');
    setIsGenerating(true);
    const pitch = await generateJobPitch(job, userData, analysis);
    setGeneratedContent(pitch);
    setIsGenerating(false);
  };

  const handlePrepClick = async (job: CareerOpportunity) => {
    setActiveJob(job);
    setModalType('prep');
    setIsGenerating(true);
    const prep = await generateInterviewPrep(job, userData!);
    setGeneratedContent(prep);
    setIsGenerating(false);
  };

  const confirmApplication = () => {
    if (activeJob) {
      onApply(activeJob);
      window.open(activeJob.sourceUrl, '_blank');
      setModalType(null);
      setActiveJob(null);
      setGeneratedContent('');
    }
  };

  const displayedJobs = activeTab === 'saved' 
    ? savedJobs.filter(s => !appliedJobs.find(a => a.id === s.id))
    : appliedJobs;

  return (
    <div className="animate-in fade-in duration-500 slide-in-from-bottom-4 space-y-8">
      {/* Modal Hub */}
      {modalType && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#102216]/95 backdrop-blur-md">
          <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl animate-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white">
                  {modalType === 'pitch' ? 'Application Pitch' : 'Interview Prep Module'}
                </h3>
                <button onClick={() => setModalType(null)} className="text-[#9cbaa6] hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             <div className="bg-[#102216] p-6 rounded-3xl border border-[#3b5443] mb-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 py-10">
                     <div className="size-10 border-4 border-[#0df259] border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-widest">AI Market Engine Synced...</p>
                  </div>
                ) : (
                  <div className="text-white text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {generatedContent}
                  </div>
                )}
             </div>
             {modalType === 'pitch' ? (
                <button onClick={confirmApplication} disabled={isGenerating} className="w-full py-5 bg-[#0df259] text-[#102216] font-black rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                  COMPLETE ON EXTERNAL SITE <span className="material-symbols-outlined">open_in_new</span>
                </button>
             ) : (
                <button onClick={() => setModalType(null)} className="w-full py-5 bg-[#28392e] text-[#0df259] font-black rounded-2xl hover:bg-[#3b5443] transition-all">
                  GOT IT, LETS GO
                </button>
             )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <button onClick={onBack} className="flex items-center gap-2 text-[#9cbaa6] hover:text-white text-xs font-black uppercase tracking-widest mb-4 transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Return to Dashboard
           </button>
           <h1 className="text-6xl font-black text-white tracking-tighter">Application <span className="text-[#0df259]">Hub</span>.</h1>
           <p className="text-[#9cbaa6] text-lg font-medium mt-2">Centralized command for your global career pipeline.</p>
        </div>
        <button onClick={onGoMatch} className="px-8 py-5 bg-[#0df259] text-[#102216] font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3">
           <span className="material-symbols-outlined">search</span> DISCOVER MORE
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[2rem] p-8 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-[0.2em] mb-1">Queue Pipeline</p>
               <h3 className="text-4xl font-black text-white">{savedJobs.length - appliedJobs.length} <span className="text-sm font-medium text-[#9cbaa6]">SAVED</span></h3>
            </div>
            <div className="size-14 bg-[#0df259]/10 rounded-2xl flex items-center justify-center text-[#0df259] border border-[#0df259]/20">
               <span className="material-symbols-outlined text-3xl">favorite</span>
            </div>
         </div>
         <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[2rem] p-8 flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-[0.2em] mb-1">Market Reach</p>
               <h3 className="text-4xl font-black text-[#0df259]">{appliedJobs.length} <span className="text-sm font-medium text-[#9cbaa6]">APPLIED</span></h3>
            </div>
            <div className="size-14 bg-[#0df259]/20 rounded-2xl flex items-center justify-center text-[#0df259] border border-[#0df259]/40">
               <span className="material-symbols-outlined text-3xl">verified</span>
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#28392e]">
         <button 
           onClick={() => setActiveTab('saved')}
           className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'saved' ? 'text-[#0df259]' : 'text-[#9cbaa6] hover:text-white'}`}
         >
           Saved for Later
           {activeTab === 'saved' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0df259] rounded-t-full"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('applied')}
           className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'applied' ? 'text-[#0df259]' : 'text-[#9cbaa6] hover:text-white'}`}
         >
           Applied History
           {activeTab === 'applied' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0df259] rounded-t-full"></div>}
         </button>
      </div>

      {/* Opportunity Grid */}
      {displayedJobs.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
           <div className="size-20 bg-[#102216] border border-[#3b5443] rounded-3xl flex items-center justify-center text-[#9cbaa6] mb-6">
              <span className="material-symbols-outlined text-4xl">folder_off</span>
           </div>
           <h3 className="text-xl font-bold text-white mb-2">No opportunities here yet.</h3>
           <p className="text-[#9cbaa6] text-sm mb-8">Head back to the Matcher to find your next career leap.</p>
           <button onClick={onGoMatch} className="text-[#0df259] font-black text-xs uppercase tracking-[0.2em] hover:underline">Start Matching Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedJobs.map(job => (
            <div key={job.id} className={`group bg-[#1a2e20] border rounded-[2rem] p-8 flex flex-col justify-between gap-6 transition-all hover:border-[#0df259]/40 ${activeTab === 'applied' ? 'border-[#0df259]/20' : 'border-[#3b5443]'}`}>
               <div>
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex flex-col gap-1">
                        <span className="px-3 py-1 bg-[#102216] text-[#0df259] text-[9px] font-black border border-[#3b5443] rounded-lg uppercase tracking-widest w-fit">{job.type}</span>
                        {job.locationInfo && (
                          <span className="text-[8px] font-black text-[#9cbaa6] uppercase tracking-widest flex items-center gap-1">
                             <span className="material-symbols-outlined text-[10px] text-[#0df259]">location_on</span> {job.locationInfo}
                          </span>
                        )}
                     </div>
                     {activeTab === 'applied' ? (
                        <div className="flex items-center gap-1 text-[10px] font-black text-[#0df259] uppercase">
                           <span className="material-symbols-outlined text-sm">check_circle</span> Applied
                        </div>
                     ) : (
                        <button onClick={() => onRemove(job.id)} className="text-[#9cbaa6] hover:text-red-400 transition-colors">
                           <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                     )}
                  </div>
                  <h4 className="text-2xl font-black text-white leading-tight mb-1">{job.role}</h4>
                  <p className="text-[#9cbaa6] font-bold text-sm mb-4">{job.company}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.skillsReq.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-[#102216] text-[#9cbaa6] text-[8px] font-black rounded border border-[#3b5443] uppercase">{skill}</span>
                    ))}
                  </div>

                  <p className="text-[#9cbaa6] text-xs leading-relaxed italic line-clamp-3">
                    "{job.description}"
                  </p>
               </div>

               <div className="pt-6 border-t border-[#28392e] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                       <p className="text-[9px] font-black text-[#9cbaa6] uppercase tracking-widest">Readiness</p>
                       <p className="text-xl font-black text-white">{job.minScoreReq}<span className="text-[10px] text-[#9cbaa6]">/100</span></p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handlePrepClick(job)}
                         className="px-4 py-2 bg-[#102216] border border-[#3b5443] text-[#0df259] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#28392e] transition-all flex items-center gap-2"
                         title="AI Interview Prep"
                       >
                         <span className="material-symbols-outlined text-sm">psychology</span> PREP
                       </button>
                       <button 
                         onClick={() => job.sourceUrl && window.open(job.sourceUrl, '_blank')}
                         className="size-10 rounded-xl bg-[#28392e] text-[#0df259] flex items-center justify-center hover:bg-[#0df259] hover:text-[#102216] transition-all"
                         title="View Original Posting"
                       >
                         <span className="material-symbols-outlined text-xl">open_in_new</span>
                       </button>
                    </div>
                  </div>
                  {activeTab === 'saved' && (
                    <button 
                      onClick={() => handleApplyClick(job)}
                      className="w-full py-4 bg-[#0df259] text-[#102216] font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      GENERATE PITCH & APPLY
                    </button>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedApplications;
