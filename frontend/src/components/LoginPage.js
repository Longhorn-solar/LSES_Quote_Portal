import React, { useState } from 'react';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

function LoginPage() {
  const [logoError, setLogoError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Use browser's location object to build redirect URL
    const redirectUrl = window.location.origin + '/';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Pixelated Logo Fallback
  const LonghornLogo = () => (
    <div className="flex flex-col items-center text-center">
      <svg className="w-14 h-14 mb-4 text-[#0062ab]" viewBox="0 0 24 24" fill="currentColor">
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
    <div className="min-h-screen bg-[#002a4d] flex items-center justify-center p-6 overflow-hidden relative">
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
          <p className="text-slate-500 text-center font-medium">Energy Efficiency Estimator v2.5</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            data-testid="google-login-btn"
            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-4 transition-all group active:scale-[0.98] shadow-lg ${
              isLoading ? 'bg-slate-200 cursor-not-allowed' : 'bg-white border-2 border-slate-200 hover:border-[#0062ab] hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                <span className="text-slate-500 font-bold">Redirecting...</span>
              </div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-[#002a4d] font-bold text-lg">Sign in with Google</span>
              </>
            )}
          </button>

          <div className="pt-6 text-center border-t border-slate-100">
            <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-black tracking-widest">
              Authorized Personnel Only
            </p>
            <p className="text-[10px] text-slate-300 mt-2 font-medium">
              Access restricted to @longhornsolar.com emails and approved admins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
