
import React from 'react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  // Mock login function for demonstration
  // In a real app, this would be handled by the Google One Tap / Button callback
  const handleGoogleLogin = () => {
    onLogin({
      name: 'Longhorn Employee',
      email: 'employee@longhornsolar.com',
      picture: 'https://ui-avatars.com/api/?name=Longhorn+Employee&background=f39200&color=fff'
    });
  };

  return (
    <div className="min-h-screen bg-[#002a4d] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0062ab] rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#f39200] rounded-full blur-[100px] opacity-10"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 animate-slideUp">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 w-full flex justify-center shadow-inner">
            <img 
              src="https://longhornsolar.com/wp-content/uploads/2021/04/Longhorn-Solar-Logo-Horizontal-1.png" 
              alt="Longhorn Solar" 
              className="h-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-black text-[#002a4d] text-center mb-2">Internal Portal</h2>
          <p className="text-slate-500 text-center font-medium">Energy Efficiency Estimator v2.2</p>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-slate-400 text-center uppercase tracking-widest font-bold">Authorized Access Only</p>
          
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 px-6 border border-slate-200 rounded-2xl flex items-center justify-center gap-4 hover:bg-slate-50 transition-all group active:scale-[0.98]"
          >
            <svg className="w-6 h-6" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span className="text-[#002a4d] font-bold text-lg">Sign in with Workspace</span>
          </button>

          <div className="pt-8 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              Use your <strong>@longhornsolar.com</strong> email to access the estimator tools and project database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
