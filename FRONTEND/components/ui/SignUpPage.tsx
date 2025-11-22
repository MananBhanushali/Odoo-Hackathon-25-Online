import React, { useState } from 'react';
import { Eye, EyeOff, User } from 'lucide-react';
import { Testimonial } from './SignInPage';

// --- HELPER COMPONENTS ---

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onSignInClick?: () => void;
}

const GlassInputWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 focus-within:border-blue-400/70 focus-within:bg-blue-500/5 dark:focus-within:bg-blue-500/10 focus-within:ring-2 focus-within:ring-blue-500/20">
    {children}
  </div>
);

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = <span className="font-bold text-slate-900 dark:text-white tracking-tight">Create Account</span>,
  description = "Join StockMaster and optimize your inventory operations.",
  heroImageSrc,
  testimonials = [],
  onSignUp,
  onGoogleSignUp,
  onSignInClick,
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

      {/* Right column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col gap-6">
            <div className="animate-element animate-delay-100">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">{title}</h1>
            </div>
            <p className="animate-element animate-delay-200 text-slate-500 dark:text-gray-400 text-base sm:text-lg">{description}</p>

            <form className="space-y-4" onSubmit={onSignUp}>
              <div className="animate-element animate-delay-300 space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400 ml-1">Full Name</label>
                <GlassInputWrapper>
                    <div className="relative">
                        <input name="name" type="text" placeholder="John Doe" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500" />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-300 space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400 ml-1">Login Id</label>
                <GlassInputWrapper>
                  <input name="loginId" type="text" placeholder="johndoe123" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400 space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400 ml-1">Email Address</label>
                <GlassInputWrapper>
                  <input name="email" type="email" placeholder="john@example.com" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400 ml-1">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 space-y-1.5">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-400 ml-1">Re-Enter Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500" />
                  </div>
                </GlassInputWrapper>
              </div>

              <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-4 font-bold text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] mt-2">
                Create Account
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center py-2">
            </div>

            <p className="animate-element animate-delay-900 text-center text-sm text-slate-500 dark:text-gray-400">
              Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSignInClick?.(); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors">Sign In</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};