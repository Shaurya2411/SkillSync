
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (email: string, password?: string) => void;
  onSignUp: (email: string, password?: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignUp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password);
    } else {
      onSignUp(email, password);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a2e20] border border-[#3b5443] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0df259] to-transparent opacity-50"></div>
        <div className="absolute -bottom-20 -right-20 size-64 bg-[#0df259]/5 blur-[80px] rounded-full"></div>
        
        <div className="text-center mb-10 relative">
          <div className="size-14 bg-[#0df259] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(13,242,89,0.3)]">
            <span className="material-symbols-outlined text-[#102216] text-3xl font-black">token</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
            {isLogin ? 'Identity Sync' : 'Initialize Node'}
          </h2>
          <p className="text-[#9cbaa6] text-sm font-medium">
            {isLogin ? 'Access your career neural network' : 'Register your professional signature'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="space-y-4">
            <div className="relative group">
              <label className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-widest mb-2 block ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#102216] border border-[#3b5443] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#0df259] focus:ring-1 focus:ring-[#0df259]/20 transition-all"
                placeholder="name@nexus.com"
              />
            </div>
            <div className="relative group">
              <label className="text-[10px] font-black text-[#9cbaa6] uppercase tracking-widest mb-2 block ml-1">Secure Passkey</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#102216] border border-[#3b5443] rounded-2xl px-5 py-4 text-white outline-none focus:border-[#0df259] focus:ring-1 focus:ring-[#0df259]/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-[#0df259] text-[#102216] font-black rounded-2xl shadow-[0_15px_40px_rgba(13,242,89,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isLogin ? 'SYNC IDENTITY' : 'CREATE ACCOUNT'}
            <span className="material-symbols-outlined">{isLogin ? 'login' : 'person_add'}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#9cbaa6] text-xs font-black uppercase tracking-widest hover:text-[#0df259] transition-colors"
          >
            {isLogin ? "Don't have a node? Create one" : "Already have a node? Sync here"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
