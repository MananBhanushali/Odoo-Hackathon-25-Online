
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { SignInPage, Testimonial } from '../components/ui/SignInPage';
import { ShieldCheck, Lock } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const loginId = formData.get('loginId') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user has admin role
        if (data.user.role === 'Super Admin' || data.user.role === 'Admin') {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Admin Security Clearance Granted', 'success');
            navigate('/admin-dashboard');
        } else {
            showToast('Access Denied: Insufficient Privileges', 'error');
        }
      } else {
        showToast(data.error || 'Authentication Failed', 'error');
      }
    } catch (error) {
      showToast('System Error: Authentication Service Unavailable', 'error');
    }
  };

  const testimonials: Testimonial[] = [
    {
      avatarSrc: "https://randomuser.me/api/portraits/men/99.jpg",
      name: "System Administrator",
      handle: "IT Security",
      text: "Restricted Area. All access attempts are logged and monitored for security purposes."
    }
  ];

  return (
    <div className="relative">
        {/* Red Accent for Admin context */}
        <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-600 z-50"></div>
        
        <SignInPage
        title={
            <span className="flex flex-col gap-2 font-bold text-slate-900 dark:text-white tracking-tight">
                <span className="flex items-center gap-2 text-red-600 dark:text-red-500 text-lg uppercase tracking-widest">
                    <Lock size={18} />
                    Secure Access
                </span>
                <span className="text-4xl">Admin <span className="text-slate-400">Portal</span></span>
            </span>
        }
        description="Please authenticate to access system configuration and user management."
        heroImageSrc="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
        testimonials={testimonials}
        onSignIn={handleSignIn}
        />
    </div>
  );
};

export default AdminLogin;
