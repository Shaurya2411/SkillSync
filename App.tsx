
import React, { useState, useMemo, useEffect } from 'react';
import { UserData, AnalysisResult, ScoreBreakdown, CareerOpportunity, UserAccount } from './types';
import { auditCareerProfile } from './services/gemini';
import { db } from './services/db';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import SwipeInterface from './components/SwipeInterface';
import CareerCoachBot from './components/CareerCoachBot';
import SavedApplications from './components/SavedApplications';
import Auth from './components/Auth';

const SESSION_KEY = 'skill-sync-session-email';

const App: React.FC = () => {
  const [view, setView] = useState<'auth' | 'onboarding' | 'dashboard' | 'swiping' | 'applications'>('auth');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  
  const [savedOpportunities, setSavedOpportunities] = useState<CareerOpportunity[]>([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState<CareerOpportunity[]>([]);

  // Initialize dedicated database
  useEffect(() => {
    const initApp = async () => {
      try {
        await db.init();
        setDbReady(true);
        const sessionEmail = localStorage.getItem(SESSION_KEY);
        if (sessionEmail) {
          handleLogin(sessionEmail);
        }
      } catch (err) {
        console.error("Database initialization failed:", err);
      }
    };
    initApp();
  }, []);

  const handleLogin = async (email: string) => {
    const user = await db.getUser(email);
    if (user) {
      setCurrentUserEmail(email);
      localStorage.setItem(SESSION_KEY, email);
      
      setSavedOpportunities(user.savedOpportunities || []);
      setAppliedOpportunities(user.appliedOpportunities || []);

      if (user.analysis && user.profile) {
        setAnalysis(user.analysis);
        setUserData(user.profile);
        setView('dashboard');
      } else {
        setView('onboarding');
      }
    } else {
      handleSignUp(email);
    }
  };

  const handleSignUp = async (email: string) => {
    const existing = await db.getUser(email);
    if (!existing) {
      const newUser: UserAccount = {
        email,
        profile: null,
        analysis: null,
        savedOpportunities: [],
        appliedOpportunities: []
      };
      await db.saveUser(newUser);
    }
    setCurrentUserEmail(email);
    localStorage.setItem(SESSION_KEY, email);
    setSavedOpportunities([]);
    setAppliedOpportunities([]);
    setView('onboarding');
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUserEmail(null);
    setAnalysis(null);
    setUserData(null);
    setSavedOpportunities([]);
    setAppliedOpportunities([]);
    setView('auth');
  };

  const handleOnboardingSubmit = async (data: UserData) => {
    setLoading(true);
    setUserData(data);
    
    // Scoring logic (deterministic)
    const skillPoints = Math.min(data.skills.length * 2, 10); 
    const projectPoints = Math.min(data.projectsCount * 5, 10); 
    const courseraPoints = Math.min(data.courseraCourses.length * 5, 10); 
    const internshipPoints = Math.min(data.internshipsCount * 7.5, 15); 
    
    const gpaPoints = data.gpa >= 9.5 ? 4 : data.gpa >= 8.5 ? 3 : data.gpa >= 7.5 ? 2 : data.gpa >= 6.5 ? 1 : 0;
    const academicTotal = gpaPoints + Math.min(data.experienceRoles.length, 3) + Math.min(data.leadershipTypes.length * 1.5, 3);

    const audit = await auditCareerProfile(data);
    
    const linkedinScore = (data.linkedinUrl.includes('linkedin.com') ? 5 : 0) + audit.linkedinQualityScore; 
    const githubScore = (data.githubUrl.includes('github.com') ? 5 : 0) + audit.githubQualityScore; 
    const resumeScore = data.resumeUploaded ? (audit.resumeQualityScore * 1.5) : 0;

    const finalScore: ScoreBreakdown = {
      skills: skillPoints,
      projects: projectPoints,
      internships: internshipPoints,
      coursera: courseraPoints,
      linkedin: Math.min(linkedinScore, 15),
      github: Math.min(githubScore, 15),
      resume: Math.min(resumeScore, 15),
      academics: Math.min(academicTotal, 10),
      total: Math.round(skillPoints + projectPoints + internshipPoints + courseraPoints + linkedinScore + githubScore + resumeScore + academicTotal)
    };
    
    const analysisResult: AnalysisResult = {
      score: finalScore,
      radarData: audit.radarData,
      verdict: audit.verdict,
      linkedinInsight: audit.linkedinInsight,
      githubInsight: audit.githubInsight,
      resumeInsight: audit.resumeInsight,
      linkedinBioEdit: audit.linkedinBioEdit,
      resumeEdits: audit.resumeEdits,
      githubActionItems: audit.githubActionItems,
      missingSkills: audit.missingSkills,
      salaryRange: audit.salaryRange,
      roadmap: audit.roadmap,
      recommendedCourses: audit.recommendedCourses,
      linkedinVerified: audit.linkedinVerified,
      githubVerified: audit.githubVerified,
      generatedOpportunities: audit.generatedOpportunities
    };

    setAnalysis(analysisResult);
    
    // Persistent Commit to Dedicated Database
    if (currentUserEmail) {
      const user = await db.getUser(currentUserEmail);
      if (user) {
        user.profile = data;
        user.analysis = analysisResult;
        user.savedOpportunities = savedOpportunities;
        user.appliedOpportunities = appliedOpportunities;
        await db.saveUser(user);
      }
    }
    
    setLoading(false);
    setView('dashboard');
  };

  const handleSaveOpportunity = async (opp: CareerOpportunity) => {
    setSavedOpportunities(prev => {
      if (prev.find(o => o.id === opp.id)) return prev;
      const next = [...prev, opp];
      if (currentUserEmail) {
        db.getUser(currentUserEmail).then(user => {
          if (user) {
            user.savedOpportunities = next;
            db.saveUser(user);
          }
        });
      }
      return next;
    });
  };

  const handleApplyOpportunity = async (opp: CareerOpportunity) => {
    setAppliedOpportunities(prev => {
      if (prev.find(o => o.id === opp.id)) return prev;
      const next = [...prev, opp];
      if (currentUserEmail) {
        db.getUser(currentUserEmail).then(user => {
          if (user) {
            user.appliedOpportunities = next;
            db.saveUser(user);
          }
        });
      }
      return next;
    });
  };

  const handleRemoveSaved = async (oppId: number) => {
    setSavedOpportunities(prev => {
      const next = prev.filter(o => o.id !== oppId);
      if (currentUserEmail) {
        db.getUser(currentUserEmail).then(user => {
          if (user) {
            user.savedOpportunities = next;
            db.saveUser(user);
          }
        });
      }
      return next;
    });
  };

  const filteredOpportunities = useMemo(() => {
    if (!analysis) return [];
    return analysis.generatedOpportunities;
  }, [analysis]);

  const LockedView = () => (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
      <div className="size-24 bg-[#0df259]/10 rounded-full flex items-center justify-center mb-8 border border-[#0df259]/30">
        <span className="material-symbols-outlined text-5xl text-[#0df259]">lock</span>
      </div>
      <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Sync Required</h2>
      <p className="text-[#9cbaa6] text-lg max-w-md mb-8 leading-relaxed">
        This section is locked until your profile scoring is complete. Please go back to the audit to generate your score.
      </p>
      <button 
        onClick={() => setView('onboarding')}
        className="px-10 py-4 bg-[#0df259] text-[#102216] font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3"
      >
        <span className="material-symbols-outlined">analytics</span> GO BACK TO SCORING
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b border-[#28392e] px-10 py-4 bg-[#102216] sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-white group cursor-pointer" onClick={() => currentUserEmail && setView('dashboard')}>
            <div className="size-9 bg-[#0df259] rounded-xl flex items-center justify-center group-hover:rotate-90 transition-transform">
              <span className="material-symbols-outlined text-[#102216] font-black">token</span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter">SkillSync</h2>
          </div>
          {currentUserEmail && (
            <nav className="hidden md:flex items-center gap-10">
              <button onClick={() => setView('dashboard')} className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#0df259] transition-colors ${view === 'dashboard' ? 'text-[#0df259]' : 'text-[#9cbaa6]'}`}>Dashboard</button>
              <button onClick={() => setView('swiping')} className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#0df259] transition-colors ${view === 'swiping' ? 'text-[#0df259]' : 'text-[#9cbaa6]'}`}>Opportunity Matcher</button>
              <button onClick={() => setView('applications')} className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#0df259] transition-colors ${view === 'applications' ? 'text-[#0df259]' : 'text-[#9cbaa6]'}`}>Applied & Saved</button>
            </nav>
          )}
        </div>
        
        {/* Profile and DB Connection Area */}
        <div className="flex items-center gap-4">
          {currentUserEmail && (
            <>
              <div className="flex flex-col items-end">
                <p className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-0.5">{currentUserEmail}</p>
                <div className="flex items-center gap-1.5">
                  <div className="size-1.5 bg-[#0df259] rounded-full shadow-[0_0_8px_rgba(13,242,89,0.8)]"></div>
                  <p className="text-[11px] font-black text-[#0df259] tracking-tight">Dedicated DB Connected</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-[#9cbaa6] hover:text-white transition-all hover:scale-110 px-2" 
                title="De-Sync Session"
              >
                <span className="material-symbols-outlined text-2xl">logout</span>
              </button>
              <div className="size-11 rounded-2xl border-2 border-[#3b5443] bg-[url('https://picsum.photos/seed/user/100/100')] bg-cover shadow-lg hover:border-[#0df259] transition-colors cursor-pointer"></div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[1300px] w-full mx-auto p-4 md:p-10">
        {!dbReady ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="size-12 border-4 border-[#0df259] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#0df259] font-black uppercase tracking-widest text-xs">Initializing Secure Storage...</p>
          </div>
        ) : (
          <>
            {view === 'auth' && <Auth onLogin={handleLogin} onSignUp={handleSignUp} />}
            {view === 'onboarding' && <OnboardingForm onSubmit={handleOnboardingSubmit} loading={loading} />}
            {view === 'dashboard' && (
              analysis ? (
                <Dashboard 
                  analysis={analysis} 
                  onFindJobs={() => setView('swiping')} 
                  onRecalculate={() => setView('onboarding')}
                  onViewApplications={() => setView('applications')}
                  savedJobs={savedOpportunities}
                  appliedJobs={appliedOpportunities}
                  onApply={handleApplyOpportunity}
                  userData={userData}
                />
              ) : <LockedView />
            )}
            {view === 'swiping' && (
              analysis ? (
                <SwipeInterface 
                  opportunities={filteredOpportunities} 
                  onBack={() => setView('dashboard')} 
                  onFinish={() => setView('applications')}
                  userData={userData} 
                  analysis={analysis}
                  onSave={handleSaveOpportunity}
                  onApply={handleApplyOpportunity}
                  appliedIds={new Set(appliedOpportunities.map(o => o.id))}
                />
              ) : <LockedView />
            )}
            {view === 'applications' && (
              analysis ? (
                <SavedApplications 
                  savedJobs={savedOpportunities}
                  appliedJobs={appliedOpportunities}
                  onApply={handleApplyOpportunity}
                  onRemove={handleRemoveSaved}
                  onGoMatch={() => setView('swiping')}
                  onBack={() => setView('dashboard')}
                  userData={userData}
                  analysis={analysis}
                />
              ) : <LockedView />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-[#28392e] p-6 text-center">
         <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-[8px] font-black text-[#0df259] bg-[#0df259]/10 px-2 py-0.5 rounded border border-[#0df259]/20 uppercase tracking-[0.2em]">IndexedDB Engine v1.2</span>
         </div>
         <p className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-[0.5em]">SkillSync AI Audit Engine &copy; 2025</p>
      </footer>

      {currentUserEmail && <CareerCoachBot />}
    </div>
  );
};

export default App;
