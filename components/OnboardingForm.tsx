
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { UserData } from '../types';
import { CAREER_ROLES, MILESTONE_LIBRARY } from '../constants';
import AuditConsole from './AuditConsole';

interface OnboardingFormProps {
  onSubmit: (data: UserData) => void;
  loading: boolean;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<UserData>({
    skills: [],
    projectsCount: 0,
    internshipsCount: 0,
    certificationsCount: 0,
    courseraCourses: [],
    linkedinUrl: '',
    linkedinSummary: '',
    githubUrl: '',
    gpa: 8.5,
    leadershipTypes: [],
    experienceRoles: [],
    resumeUploaded: false,
    targetRole: CAREER_ROLES[0]
  });
  
  const [activeFilter, setActiveFilter] = useState<'All' | 'Professional' | 'Leadership' | 'Academic'>('All');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));
      }, (error) => console.log("Location denied"));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFormData(prev => ({
          ...prev,
          resumeUploaded: true,
          resumeBase64: base64,
          resumeMimeType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMilestone = (milestoneId: string, category: string, label: string) => {
    if (category === 'Leadership') {
      setFormData(prev => ({
        ...prev,
        leadershipTypes: prev.leadershipTypes.includes(label)
          ? prev.leadershipTypes.filter(t => t !== label)
          : [...prev.leadershipTypes, label]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        experienceRoles: prev.experienceRoles.includes(label)
          ? prev.experienceRoles.filter(t => t !== label)
          : [...prev.experienceRoles, label]
      }));
    }
  };

  const filteredMilestones = useMemo(() => {
    if (activeFilter === 'All') return MILESTONE_LIBRARY;
    return MILESTONE_LIBRARY.filter(m => m.category === activeFilter);
  }, [activeFilter]);

  const totalMilestones = formData.experienceRoles.length + formData.leadershipTypes.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-[#1a2e20] border border-[#3b5443] rounded-[2.5rem] p-8 md:p-12 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
      {loading && <AuditConsole />}
      
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#0df259]/5 blur-[120px] rounded-full -mr-40 -mt-40"></div>
      
      <div className="mb-12 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0df259]/10 border border-[#0df259]/20 text-[#0df259] text-[10px] font-black uppercase tracking-widest mb-6">
          <span className="material-symbols-outlined text-xs">analytics</span>
          Global Talent Benchmarking
        </div>
        <h2 className="text-5xl font-black mb-4 text-white tracking-tighter">
          Skill<span className="text-[#0df259]">Sync</span> Audit
        </h2>
        <p className="text-[#9cbaa6] text-lg font-medium max-w-lg mx-auto leading-relaxed">
          Initialize your profile audit. Our AI engine deep-scans your technical footprint across all roles.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-[#9cbaa6] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">target</span> Target Career Path
            </label>
            <div className="relative">
              <select 
                value={formData.targetRole}
                onChange={e => setFormData({...formData, targetRole: e.target.value})}
                className="w-full bg-[#102216] border border-[#3b5443] rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-[#0df259] outline-none transition-all appearance-none cursor-pointer"
              >
                {CAREER_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#0df259]">
                 <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <label className="block text-xs font-black uppercase tracking-[0.2em] text-[#9cbaa6] flex items-center gap-2">
               <span className="material-symbols-outlined text-sm text-[#0df259]">share</span> Professional Links
             </label>
             <input 
               type="url" 
               value={formData.linkedinUrl}
               onChange={e => setFormData({...formData, linkedinUrl: e.target.value})}
               className="w-full bg-[#102216] border border-[#3b5443] rounded-2xl p-4 text-white focus:ring-2 focus:ring-[#0df259] outline-none text-sm"
               placeholder="LinkedIn Profile URL"
             />
             <input 
               type="url" 
               value={formData.githubUrl}
               onChange={e => setFormData({...formData, githubUrl: e.target.value})}
               className="w-full bg-[#102216] border border-[#3b5443] rounded-2xl p-4 text-white focus:ring-2 focus:ring-[#0df259] outline-none text-sm"
               placeholder="GitHub Profile (AI Deep Scan Enabled)"
             />
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <label className="text-xs font-black uppercase tracking-[0.2em] text-[#9cbaa6] flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm text-[#0df259]">verified</span> AI Resume Screen
               </label>
               <span className="text-[9px] font-black text-[#0df259] bg-[#0df259]/10 px-2 py-0.5 rounded border border-[#0df259]/20 uppercase">Optional Power-Up</span>
             </div>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`h-[116px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group ${formData.resumeUploaded ? 'border-[#0df259] bg-[#0df259]/5' : 'border-[#3b5443] hover:border-[#0df259]/50 bg-[#102216]/50'}`}
             >
               <span className={`material-symbols-outlined text-3xl transition-all ${formData.resumeUploaded ? 'text-[#0df259]' : 'text-[#9cbaa6] group-hover:text-[#0df259]'}`}>
                 {formData.resumeUploaded ? 'check_circle' : 'upload_file'}
               </span>
               <p className="text-[11px] font-bold text-white text-center px-4 line-clamp-1">{fileName || 'Sync My Resume (PDF/JPG)'}</p>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-[#9cbaa6] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#0df259]">verified_user</span> Career Journey Milestones
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Professional', 'Leadership', 'Academic'].map(cat => (
                    <button 
                      key={cat}
                      type="button"
                      onClick={() => setActiveFilter(cat as any)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${activeFilter === cat ? 'bg-[#0df259] text-[#102216] border-[#0df259]' : 'bg-[#102216] text-[#9cbaa6] border-[#3b5443] hover:border-[#0df259]/50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#102216] px-4 py-2 rounded-2xl border border-[#3b5443] flex items-center gap-3">
                 <span className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-widest">Active Milestones</span>
                 <span className="text-xl font-black text-[#0df259]">{totalMilestones}</span>
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredMilestones.map(milestone => {
                const isActive = milestone.category === 'Leadership' 
                  ? formData.leadershipTypes.includes(milestone.label) 
                  : formData.experienceRoles.includes(milestone.label);
                
                return (
                  <div 
                    key={milestone.id}
                    onClick={() => toggleMilestone(milestone.id, milestone.category, milestone.label)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[100px] group relative overflow-hidden ${isActive ? 'bg-[#0df259]/10 border-[#0df259] shadow-[0_0_20px_rgba(13,242,89,0.1)]' : 'bg-[#102216] border-[#3b5443] hover:border-[#0df259]/40'}`}
                  >
                    <span className={`material-symbols-outlined text-2xl transition-all ${isActive ? 'text-[#0df259] scale-110' : 'text-[#3b5443] group-hover:text-[#0df259]/60'}`}>
                      {milestone.icon}
                    </span>
                    <span className={`text-[10px] font-black uppercase text-center leading-tight transition-colors ${isActive ? 'text-white' : 'text-[#9cbaa6]'}`}>
                      {milestone.label}
                    </span>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 size-2 bg-[#0df259] rounded-full animate-pulse"></div>
                    )}
                  </div>
                );
              })}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2">
             <label className="block text-xs font-black uppercase tracking-[0.2em] text-[#0df259] mb-4">Executive Bio Audit</label>
             <textarea 
               rows={4}
               value={formData.linkedinSummary}
               onChange={e => setFormData({...formData, linkedinSummary: e.target.value})}
               className="w-full bg-[#102216] border border-[#3b5443] rounded-2xl p-5 text-white focus:ring-2 focus:ring-[#0df259] outline-none text-sm resize-none placeholder:text-[#3b5443]"
               placeholder="Paste your 'About' section for AI semantic analysis..."
             />
           </div>
           <div className="bg-[#102216]/50 p-6 rounded-3xl border border-[#3b5443] flex flex-col justify-between">
              <div>
                 <label className="block text-[10px] font-black uppercase text-[#9cbaa6] mb-3">Academic CGPA</label>
                 <div className="flex items-end gap-2 mb-6">
                    <input 
                      type="number" step="0.01" min="0" max="10.0" 
                      value={formData.gpa} 
                      onChange={e => setFormData({...formData, gpa: parseFloat(e.target.value) || 0})} 
                      className="bg-transparent border-b border-[#3b5443] text-4xl font-black text-white w-24 outline-none focus:border-[#0df259]" 
                    />
                    <span className="text-[#9cbaa6] font-bold pb-1 text-sm">/ 10.0</span>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[11px] font-black uppercase">
                   <span className="text-[#9cbaa6]">Projects</span>
                   <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setFormData(p => ({...p, projectsCount: Math.max(0, p.projectsCount - 1)}))} className="size-6 rounded bg-[#28392e] text-white hover:bg-[#3b5443]">-</button>
                      <span className="text-white w-4 text-center font-black">{formData.projectsCount}</span>
                      <button type="button" onClick={() => setFormData(p => ({...p, projectsCount: p.projectsCount + 1}))} className="size-6 rounded bg-[#28392e] text-white hover:bg-[#3b5443]">+</button>
                   </div>
                 </div>
              </div>
           </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-7 bg-[#0df259] text-[#102216] font-black text-2xl rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_25px_60px_rgba(13,242,89,0.3)] group"
        >
          {loading ? (
            <div className="size-10 border-4 border-[#102216] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl group-hover:rotate-45 transition-transform duration-500">sync</span>
              RUN GLOBAL AUDIT
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm;
