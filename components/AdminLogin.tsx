
import React, { useState } from 'react';
import { Lock, Unlock, X, ShieldCheck, Moon } from 'lucide-react';
import { Button } from './UIComponents';

interface AdminLoginProps {
  onLogin: () => void;
  onClose: () => void;
  accentColor: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose, accentColor }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulating a secure check
    setTimeout(() => {
        // Simple hardcoded password for the lunar theme
        if (password.toLowerCase() === 'AAFI2728' || password.toLowerCase() === 'AAHAM') {
          onLogin();
          onClose();
        } else {
          setError(true);
          setIsSubmitting(false);
          // Shake effect trigger would go here if using a library, 
          // but we'll stick to simple red border
          setTimeout(() => setError(false), 2000);
        }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050510]/90 backdrop-blur-md p-4 transition-all duration-500">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
        
        {/* Abstract Background Decoration */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ backgroundColor: accentColor }} />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-6 mb-8 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700 shadow-inner group">
             <Lock size={32} className="transition-all duration-500 group-hover:scale-110" style={{ color: accentColor }} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-serif-display text-white mb-2">Lunar Command</h2>
            <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">Authorized Access Only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <div className="relative">
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Passkey"
                className={`w-full bg-slate-950/50 border ${error ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-slate-800'} rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-all text-center tracking-[0.5em] font-mono`}
                autoFocus
                disabled={isSubmitting}
                />
                {error && (
                    <p className="text-red-400 text-[10px] text-center mt-2 font-medium uppercase tracking-widest animate-bounce">
                        Access Denied
                    </p>
                )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl"
            style={{ backgroundColor: accentColor }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <><ShieldCheck size={18} /> Authenticate</>
            )}
          </Button>
          
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest opacity-50">
            Encrypted Session
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
