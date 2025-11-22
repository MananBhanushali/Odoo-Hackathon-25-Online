import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { SignInPage, Testimonial } from '../components/ui/SignInPage';

const Login: React.FC = () => {
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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        navigate('/dashboard');
      } else {
        showToast(data.error || 'Login failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred during login', 'error');
    }
  };

  const handleGoogleSignIn = () => {
    showToast('Redirecting to Google Authentication...', 'info');
  };

  const handleResetPassword = () => {
    showToast('Password reset link sent to your email.', 'success');
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  const testimonials: Testimonial[] = [
    {
      avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
      name: "Elena Rodriguez",
      handle: "Logistics Director",
      text: "StockMaster reduced our inventory discrepancies by 94% in just two months."
    },
    {
      avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
      name: "James Chen",
      handle: "Warehouse Ops",
      text: "The real-time tracking and dark mode UI makes night shifts so much easier on the eyes."
    },
    {
      avatarSrc: "https://randomuser.me/api/portraits/women/68.jpg",
      name: "Sarah Miller",
      handle: "Supply Chain Lead",
      text: "Finally, an IMS that actually looks good and works even better. Highly recommended!"
    }
  ];

  return (
    <SignInPage
      title={<span className="font-bold text-slate-900 dark:text-white tracking-tight">Welcome to <span className="text-blue-600">StockMaster</span></span>}
      description="Sign in to access your real-time inventory dashboard."
      heroImageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
      testimonials={testimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
};

export default Login;