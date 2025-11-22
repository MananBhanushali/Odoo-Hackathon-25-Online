import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 focus-within:border-blue-400/70 focus-within:bg-blue-500/5 dark:focus-within:bg-blue-500/10 focus-within:ring-2 focus-within:ring-blue-500/20">
    {children}
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-bold text-slate-900 dark:text-white tracking-tight">Welcome</span>,
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row font-sans w-full bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white overflow-x-hidden">
      
      {/* Left column: Logo + Branding */}
      <section className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#0F172A] relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0F172A] to-slate-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-6 p-10 text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-white">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
              </div>
              <h1 className="text-5xl font-bold text-white tracking-tight">Stock Master</h1>
              <p className="text-slate-300 text-lg max-w-md">
                  Streamline your inventory management with AI-driven insights and real-time tracking.
              </p>
          </div>
      </section>

      {/* Right column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col gap-6">
            <div className="animate-element animate-delay-100">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">{title}</h1>
            </div>
            <p className="animate-element animate-delay-200 text-slate-500 dark:text-gray-400 text-base sm:text-lg">{description}</p>

            <form className="space-y-5" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300 space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400 ml-1">Login Id</label>
                <GlassInputWrapper>
                  <input name="loginId" type="text" placeholder="Enter your login ID" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400 space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400 ml-1">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex flex-wrap items-center justify-between text-sm gap-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" name="rememberMe" className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400" />
                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Keep me signed in</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors font-medium">Reset password</a>
              </div>

              <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-4 font-bold text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]">
                Sign In
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center py-2">
            </div>

            {onCreateAccount && (
              <p className="animate-element animate-delay-900 text-center text-sm text-slate-500 dark:text-gray-400">
                New to StockMaster? <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount(); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors">Create Account</a>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};