
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { SignUpPage } from '../components/ui/SignUpPage';
import { Testimonial } from '../components/ui/SignInPage';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const loginId = formData.get('loginId') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loginId, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('Account created successfully! Welcome aboard.', 'success');
        navigate('/dashboard');
      } else {
        showToast(data.error || 'Signup failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred during signup', 'error');
    }
  };

  const handleGoogleSignUp = () => {
    showToast('Redirecting to Google Authentication...', 'info');
  };

  const handleSignInClick = () => {
    navigate('/login');
  };

  const testimonials: Testimonial[] = [
    {
      avatarSrc: "https://randomuser.me/api/portraits/men/41.jpg",
      name: "Michael Foster",
      handle: "Operations Manager",
      text: "Setting up my warehouse took less than 10 minutes. The UI is intuitive and fast."
    },
    {
      avatarSrc: "https://randomuser.me/api/portraits/women/63.jpg",
      name: "Lisa Wong",
      handle: "Inventory Specialist",
      text: "I love the dark mode and the mobile responsiveness. I can manage stock from anywhere."
    },
    {
      avatarSrc: "https://randomuser.me/api/portraits/men/86.jpg",
      name: "Robert Key",
      handle: "Small Business Owner",
      text: "Best investment for my business this year. Tracking stock flow has never been this beautiful."
    }
  ];

  return (
    <SignUpPage
      title={<span className="font-bold text-slate-900 dark:text-white tracking-tight">Join <span className="text-blue-600">StockMaster</span></span>}
      description="Create your account and start optimizing your inventory today."
      heroImageSrc="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=2832&auto=format&fit=crop"
      testimonials={testimonials}
      onSignUp={handleSignUp}
      onGoogleSignUp={handleGoogleSignUp}
      onSignInClick={handleSignInClick}
    />
  );
};

export default Signup;