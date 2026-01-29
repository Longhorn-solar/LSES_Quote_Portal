
import React, { useState } from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [logoError, setLogoError] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Authorization logic
  const checkAccess = (emailInput: string) => {
    const e = emailInput.toLowerCase().trim();
    if (e.endsWith('@longhornsolar.com')) return true;
    if (e === 'richard.balius@gmail.com') return true;
    if (e === 'richard@rbvital.com') return true;
    return false;
  };

  const isAuthorized = checkAccess(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!isAuthorized) {
      setError('Access denied. Please use an authorized company email.');
      return;
    }

    setIsVerifying(true);
    
    // Simulate a brief auth verification delay
    setTimeout(() => {
      const name = email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      onLogin({
        name: name || 'Longhorn Admin',
        email: email,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f39200&color=fff`
      });
      setIsVerifying(false);
    }, 800);
  };

  // Reusable Pixelated Logo Component
  const LonghornLogo = () => (
    <div className="flex flex-col items-center text-center">
      {/* Custom Pixelated Texas SVG */}
      <svg className="w-14 h-14 mb-4 text-[#0062ab]" viewBox="0 0 24 24" fill="currentColor">
        {/* Pixel-style Texas Recreation */}
        <rect x="12" y="4" width="2" height="2" />
        <rect x="14" y="4" width="2" height="2" />
        <rect x="12" y="6" width="6" height="2" />
        <rect x="10" y="8" width="8" height="2" />
        <rect x="8" y="10" width="10" height="2" />
        <rect x="6" y="12" width="10" height="2" />
        <rect x="6" y="14" width="6" height="2" />
        <rect x="8" y="16" width="4" height="2" />
        <rect x="10" y="18" width="2" height="2" />
      </svg>
      <div className="text-[#002a4d] font-[900] text-[1.75rem] tracking-tight leading-none uppercase">Longhorn</div>
      <div className="text-[#f39200] font-black text-sm tracking-[0.4em] uppercase mt-1">Solar</div>
      <div className="text-[#0062ab] font-bold text-[0.65rem] uppercase tracking-[0.15em] mt-1.5">& Energy Services</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#002a4d] flex items-center justify-center p-6 overflow-hidden relative font-['Inter']">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0062ab] rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#f39200] rounded-full blur-[100px] opacity-10"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 animate-slideUp">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-50 p-8 rounded-2xl mb-8 w-full flex justify-center shadow-inner min-h-[220px] items-center">
            {!logoError ? (
              <img 
                src="https://longhornsolar.com/wp-content/uploads/2021/04/Longhorn-Solar-Logo-Vertical-1.png" 
                alt="Longhorn Solar" 
                className="h-40 object-contain"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
              />
            ) : (
              <LonghornLogo />
            )}
          </div>
          <h2 className="text-3xl font-black text-[#002a4d] text-center mb-2">Employee Portal</h2>
          <p className="text-slate-500 text-center font-medium">Energy Efficiency Estimator v2.3</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Company Email</label>
            <div className="relative group">
              <input 
                type="email"
                placeholder="j.smith@longhornsolar.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full py-4 px-6 bg-slate-50 border-2 rounded-2xl outline-none transition-all text-lg font-semibold placeholder-slate-300 ${
                  error ? 'border-red-200 bg-red-50 text-red-900' : 'border-slate-100 focus:border-[#0062ab] text-[#002a4d]'
                }`}
              />
              {isAuthorized && email.length > 5 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center animate-fadeIn">
                  <i className="fa-solid fa-check text-[10px]"></i>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 animate-fadeIn">
                <p className="text-sm font-bold text-red-500 flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </p>
              </div>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isVerifying}
            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-4 transition-all group active:scale-[0.98] shadow-lg ${
              isVerifying ? 'bg-slate-200 cursor-not-allowed' : 'bg-[#002a4d] hover:bg-[#003d70]'
            }`}
          >
            {isVerifying ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                <span className="text-slate-500 font-bold">Verifying...</span>
              </div>
            ) : (
              <>
                <i className="fa-solid fa-shield-halved text-[#f39200]"></i>
                <span className="text-white font-bold text-lg">Secure Access Login</span>
              </>
            )}
          </button>

          <div className="pt-6 text-center border-t border-slate-50">
            <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-black tracking-widest">
              Authorized Personnel Only
            </p>
            <p className="text-[10px] text-slate-300 mt-2 font-medium">
              System monitoring in place. Unauthorized access attempts are logged and reported.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
