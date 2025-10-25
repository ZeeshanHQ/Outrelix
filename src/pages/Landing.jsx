import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { 
  RocketLaunchIcon, 
  ChartBarIcon, 
  ClockIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  CreditCardIcon,
  CogIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { auth, db } from '../supabase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OnboardingModal from '../components/OnboardingModal';
import WelcomeModal from '../components/WelcomeModal';
import OTPVerificationModal from '../components/OTPVerificationModal';
import Footer from '../components/Footer';

// FeatureCard component
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
  >
    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white font-poppins leading-tight">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 font-poppins leading-relaxed">{description}</p>
  </motion.div>
);

// TestimonialCard component
const TestimonialCard = ({ image, name, role, company, quote, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-center mb-6">
      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gradient-to-r from-green-400 via-blue-500 to-purple-600 shadow-lg">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="ml-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-poppins">{name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-poppins">{role}</p>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-poppins font-semibold">{company}</p>
      </div>
    </div>
    <div className="mb-6">
      <p className="text-gray-600 dark:text-gray-300 font-poppins leading-relaxed text-lg italic">"{quote}"</p>
    </div>
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  </motion.div>
);

// LiveCounter component
const LiveCounter = ({ start, end, duration, isLive = false, updateInterval = 10000 }) => {
  const [count, setCount] = React.useState(start);
  React.useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentCount = Math.floor(start + (end - start) * progress);
      setCount(currentCount);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
    if (isLive) {
      const interval = setInterval(() => {
        setCount(prevCount => {
          const increment = Math.floor(Math.random() * 50) + 10;
          return prevCount + increment;
        });
      }, updateInterval);
      return () => clearInterval(interval);
    }
  }, [start, end, duration, isLive, updateInterval]);
  return <span>{count.toLocaleString()}</span>;
};

// PricingCard component
const PricingCard = ({ title, price, subtitle, features, popular, delay, onSignupClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 ${
      popular 
        ? 'border-primary-500 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950' 
        : 'border-gray-100 dark:border-gray-700'
    }`}
  >
    {popular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold font-poppins shadow-lg">
          Most Popular
        </span>
      </div>
    )}
    <div className="text-center mb-8">
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 font-poppins mb-4">
        {subtitle}
      </p>
      <div className="mb-6">
        <span className="text-5xl font-bold text-gray-900 dark:text-white font-poppins">${price}</span>
        <span className="text-xl text-gray-600 dark:text-gray-400 font-poppins">/month</span>
      </div>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start text-gray-600 dark:text-gray-300 font-poppins">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-sm leading-relaxed">{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onSignupClick}
      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 font-poppins ${
        title === 'Starter'
          ? 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105'
          : popular
          ? 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
      }`}
    >
      {title === 'Starter' ? 'Start Free Trial' : 'Upgrade Now'}
    </button>
  </motion.div>
);

// industryPhrases array
const industryPhrases = [
  "Real Estate",
  "Healthcare",
  "Technology",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Legal Services",
  "Marketing",
  "E-commerce",
  "SaaS",
  "Non-profit",
  "Construction",
  "Hospitality",
  "Automotive",
  "Insurance",
  "Media",
  "Energy",
  "Transportation"
];

// Helper to get country and timezone
async function getCountryAndTimezone() {
  let country = null;
  let country_name = null;
  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    // Get browser locale for fallback - default to PK for Pakistan
    const locale = navigator.language.split('-')[1] || 'PK';
    const res = await fetch(`http://localhost:5000/api/geoip?locale=${locale}`);
    const data = await res.json();
    country = data.country;
    country_name = data.country_name;
  } catch (e) {
    console.error('Geo-IP lookup failed:', e);
  }
  return { country, country_name, timezone };
}

// Add helpers for login call deduplication
function isLoginCalled(email) {
  return localStorage.getItem('loginCalled:' + email) === 'true';
}
function setLoginCalled(email) {
  localStorage.setItem('loginCalled:' + email, 'true');
}

const SignupModal = ({ isOpen, onClose, onSignupSuccess, onEmailVerified, pendingOnboardingUserName, setShowOnboardingModal, setShowWelcomeModal, setIsNewUser, setOnboardingUserName, selectedCountry, setSelectedCountry, hasProcessedVerification, setHasProcessedVerification, showOTPModal, setShowOTPModal, pendingEmail, setPendingEmail }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [verificationSent, setVerificationSent] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const intervalRef = useRef(null);
  // Add name field to signup modal (only for new users)
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await auth.signInWithGoogle();
      
      if (error) {
        throw error;
      }
      
      // The user will be redirected to dashboard after successful authentication
      // Supabase will handle the OAuth flow
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.message?.includes('popup')) {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!email || !password) {
      toast.error('Please fill in all fields.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
      return;
    }
    
    // Password validation
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
      return;
    }
    
    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await auth.signIn(email, password);
        localStorage.setItem('isNewUser', 'false');
        if (!result.user.emailVerified) {
          setEmailNotVerified(true);
          setVerificationSent(false);
          toast.warning('Please verify your email address before signing in.', {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
          });
          return;
        }
        
        // Use name from signup or fallback to displayName/email
        const userName = name || result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : '');
        const userEmail = result.user.email;
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({
          name: userName,
          displayName: userName,
          email: userEmail,
          photoURL: null,
          provider: 'email'
        }));
        
        toast.success('Successfully signed in!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
        
        onClose();
        onSignupSuccess(userName, userEmail);
        // Always call /login after successful login
        const { country: detectedCountry, country_name: detectedCountryName, timezone } = await getCountryAndTimezone();
        const finalCountry = (selectedCountry || detectedCountry || 'PK').toUpperCase();
        const finalCountryName = detectedCountryName || 'Pakistan';
        const res = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: userEmail,
            name: userName,
            country: finalCountry,
            country_name: finalCountryName,
            timezone
          })
        });
        const data = await res.json();
        if (data.is_new_user) {
          setIsNewUser(true);
          setOnboardingUserName(userName);
          setShowOnboardingModal(true);
        } else {
          setIsNewUser(false);
          setShowWelcomeModal(true);
          // Optionally, redirect to dashboard after welcome modal
        }
        // No /login call here; will be handled after verification
        // Fetch user profile from backend and update localStorage
        const meRes = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://outrelix-backend.onrender.com'}/me`, { credentials: 'include' });
        if (meRes.ok) {
          const me = await meRes.json();
          localStorage.setItem('user', JSON.stringify({
            name: me.name || userName,
            displayName: me.name || userName,
            email: me.email,
            photoURL: result.user.photoURL,
            provider: 'google',
            country: me.country,
            country_name: me.country_name,
            timezone: me.timezone
          }));
          window.dispatchEvent(new Event('user-updated'));
        }
        return;
      } else {
        result = await auth.signUp(email, password, { full_name: name });
        localStorage.setItem('isNewUser', 'true');
        
        // Send OTP for email verification
        try {
          const otpResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://outrelix-backend.onrender.com'}/api/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: email,
              purpose: 'email_verification'
            })
          });
          
          if (otpResponse.ok) {
            setPendingEmail(email);
            setShowOTPModal(true);
            toast.success('Verification code sent to your email!', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
          } else {
            throw new Error('Failed to send verification code');
          }
        } catch (otpError) {
          console.error('OTP send error:', otpError);
          toast.error('Account created but failed to send verification code. Please try logging in.', {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
          });
        }
      }
    } catch (error) {
      console.error('Email/password auth error:', error);
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up instead.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password authentication is not enabled. Please contact support.';
      }
      
      toast.error(errorMessage, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        toast.success('Verification email sent! Please check your inbox.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } else {
        toast.error('No user found. Please try signing up again.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to send verification email. Please try again.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleGuest = () => {
    // Implement guest login logic here
    console.log('Continue as Guest');
  };

  // Auto-checker for email verification
  useEffect(() => {
    if (emailNotVerified && auth.currentUser && !hasProcessedVerification) {
      setVerifying(true);
      intervalRef.current = setInterval(async () => {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified && !hasProcessedVerification) {
          setVerified(true);
          setVerifying(false);
          setHasProcessedVerification(true);
          clearInterval(intervalRef.current);
          
          // Check if user is already authenticated (Google sign-in case)
          const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (isAuthenticated && user.email && user.provider === 'google') {
            console.log('[Email Verification] User already authenticated via Google, skipping /login call');
          setTimeout(() => {
            onClose();
            }, 1200);
          } else {
            // Only call /login for email/password signup
            setTimeout(() => {
              onClose();
              if (pendingOnboardingUserName) {
              const userEmail = auth.currentUser.email;
                handleEmailVerified(pendingOnboardingUserName, userEmail);
            }
          }, 1200); // Show success for 1.2s before redirect
          }
        }
      }, 3000);
    } else {
      setVerifying(false);
      setVerified(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [emailNotVerified, isOpen, hasProcessedVerification]);

  // Reset verification state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasProcessedVerification(false);
      setVerified(false);
      setVerifying(false);
      // PERMANENT FIX: Reset global flag when modal opens
      // globalLoginCalled = false;
      console.log('[SignupModal] Modal opened, reset global login flag');
    }
  }, [isOpen]);

  // Move handleEmailVerified here
  const handleEmailVerified = async (userName, userEmail, countryData = null) => {
    // Prevent multiple calls
    if (hasProcessedVerification) {
      console.log('[Signup] handleEmailVerified already processed, skipping');
      return;
    }
    setHasProcessedVerification(true);
    // LOCAL FLAG: Only call /login once
    if (isLoginCalled(userEmail)) {
      console.log('[Signup] login already called for', userEmail, 'skipping duplicate call');
      return;
    }
    setLoginCalled(userEmail);
    // Set user info in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify({
      name: userName,
      displayName: userName,
      email: userEmail,
      photoURL: null,
      provider: 'email'
    }));

    // Get country and timezone (use provided data if available, otherwise fetch)
    let finalCountry, finalCountryName, timezone;
    if (countryData) {
      // Use provided country data (for Google sign-in)
      finalCountry = countryData.country;
      finalCountryName = countryData.country_name;
      timezone = countryData.timezone;
    } else {
      // Fetch country data (for email/password signup)
      const { country: detectedCountry, country_name: detectedCountryName, timezone: detectedTimezone } = await getCountryAndTimezone();
      console.log('[Signup] getCountryAndTimezone result:', { detectedCountry, detectedCountryName, detectedTimezone, selectedCountry });
      finalCountry = (selectedCountry || detectedCountry || 'PK').toUpperCase();
      finalCountryName = detectedCountryName || 'Pakistan'; // Default to Pakistan if detection fails
      timezone = detectedTimezone;
    }
    
    // Call backend /login to store user in Supabase and get is_new_user
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        email: userEmail, 
        name: userName, 
        country: finalCountry, 
        country_name: finalCountryName,
        timezone 
      })
    });
    const data = await res.json();
    console.log('[Signup] /login response:', data);
    if (data.is_new_user) {
      setIsNewUser(true);
      setOnboardingUserName(userName); // Ensure onboarding modal has correct name
      setShowOnboardingModal(true);
    } else {
      setIsNewUser(false);
      setShowWelcomeModal(true);
    }
    // Fetch user profile from backend and update localStorage
    const meRes = await fetch('http://localhost:5000/me', { credentials: 'include' });
    if (meRes.ok) {
      const me = await meRes.json();
      localStorage.setItem('user', JSON.stringify({
        name: me.name || userName,
        displayName: me.name || userName,
        email: me.email,
        photoURL: null,
        provider: 'email',
        country: me.country,
        country_name: me.country_name,
        timezone: me.timezone
      }));
      window.dispatchEvent(new Event('user-updated'));
    }
    window.dispatchEvent(new Event('user-updated'));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 max-w-sm w-full overflow-hidden relative z-[10000]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-700/20"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white font-poppins mb-1">
                  {isLogin ? 'Welcome Back!' : 'Start Your Journey'}
            </h2>
                <p className="text-blue-100 text-sm font-poppins font-light">
                  {isLogin ? 'Sign in to continue' : 'Join thousands of users'}
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-2 right-2 w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/10 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Google Sign In Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-60 text-gray-700 dark:text-gray-200 font-poppins font-medium shadow-sm hover:shadow-md"
              >
                <img src={`${process.env.PUBLIC_URL || ''}/icons/google.png`} alt="Google" className="w-5 h-5" />
                Continue with Google
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-poppins font-medium">or continue with email</span>
                </div>
              </div>
              
              {/* Email Form */}
              <form className="space-y-4" onSubmit={handleEmailPasswordAuth}>
                {isLogin ? (
                  <>
                    <div className="space-y-2">
                  <input
                    type="email"
                        placeholder="Email address"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-poppins text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                    <div className="relative">
                  <input
                        type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins pr-12"
                        minLength={isLogin ? undefined : 8}
                    required
                  />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                </div>
                    {passwordError && (
                      <div className="text-red-500 text-xs mt-1 font-poppins">{passwordError}</div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Your name"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-poppins text-sm"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <input
                        type="email"
                        placeholder="Email address"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-poppins text-sm"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins pr-12"
                        minLength={isLogin ? undefined : 8}
                        required
                      />
                <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <div className="text-red-500 text-xs mt-1 font-poppins">{passwordError}</div>
                    )}
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white px-4 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-60 font-poppins shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </motion.button>
              </form>
            </div>
            
            {/* Email Verification Section */}
            {emailNotVerified && (
              <div className="px-6 pb-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex flex-col items-center">
                  {verified ? (
                    <>
                      <div className="flex flex-col items-center justify-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.2, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className="mb-2"
                        >
                          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                        <p className="text-green-700 dark:text-green-300 font-semibold text-base font-poppins">Email verified! Redirecting…</p>
                      </div>
                  </>
                ) : (
                    <>
                      <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-sm font-poppins mb-1">Please verify your email address</p>
                      <p className="text-yellow-600 dark:text-yellow-300 text-xs font-poppins mb-2">Check your inbox for a verification link.</p>
                      {verifying && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-poppins animate-pulse">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                          </svg>
                          Waiting for verification…
                        </div>
                      )}
                    </>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  onClick={handleResendVerification}
                    className="mt-2 text-blue-600 dark:text-blue-400 underline text-xs font-poppins disabled:opacity-60 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    disabled={resendLoading || verified}
                >
                    {resendLoading ? 'Resending…' : 'Resend Verification Email'}
                  </motion.button>
                </div>
              </div>
            )}
            
            {/* Footer */}
            <div className="px-6 pb-6">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-poppins">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors font-poppins"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </motion.button>
              </p>
            </div>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-xl z-20"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// In the Landing component, after all imports and before return:
const industryNames = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Real Estate',
  'E-commerce',
  'Manufacturing',
  'Marketing',
];

const Landing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  
  // Digital typewriter state for hero section
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  // Industry text changer state (for Security & Compliance section)
  const [industryIndex, setIndustryIndex] = useState(0);
  const [industryDisplayed, setIndustryDisplayed] = useState('');
  const [industryTyping, setIndustryTyping] = useState(true);

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [onboardingUserName, setOnboardingUserName] = useState("");
  const [pendingOnboardingUserName, setPendingOnboardingUserName] = useState("");
  const [pendingOnboardingUserEmail, setPendingOnboardingUserEmail] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasProcessedVerification, setHasProcessedVerification] = useState(false);
  // In the Landing component, add this state at the top:
  const [selectedCountry, setSelectedCountry] = useState("");
  // OTP verification states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleOTPVerificationSuccess = () => {
    setShowOTPModal(false);
    setPendingEmail("");
    // Handle successful OTP verification
    navigate('/dashboard');
  };

  // Check if user is new or existing
  const checkIfUserIsNew = (email) => {
    const existingUsers = JSON.parse(localStorage.getItem('existingUsers') || '[]');
    return !existingUsers.includes(email);
  };

  const markUserAsExisting = (email) => {
    const existingUsers = JSON.parse(localStorage.getItem('existingUsers') || '[]');
    if (!existingUsers.includes(email)) {
      existingUsers.push(email);
      localStorage.setItem('existingUsers', JSON.stringify(existingUsers));
    }
  };

  // Check if user is already authenticated and redirect if existing user
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email) {
        const isNewUser = checkIfUserIsNew(user.email);
        if (!isNewUser) {
          // Existing user - redirect to dashboard
          navigate('/dashboard');
        }
      }
    }
  }, [navigate]);

  // Handle smooth scrolling to sections
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 100);
        }
      }
    };

    // Handle initial load with hash
    handleHashChange();

    // Handle hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Function to scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle signup success - check if new or existing user
  const handleSignupSuccess = (userName, userEmail) => {
    setPendingOnboardingUserName(userName);
    setPendingOnboardingUserEmail(userEmail);
    // Do not show WelcomeModal yet; wait for verification
  };

  const features = [
    {
      icon: GlobeAltIcon,
      title: "Select Industry & Target Audience",
      description: "Choose from 50+ industries and AI automatically finds your ideal prospects with precision targeting",
      delay: 0.1
    },
    {
      icon: RocketLaunchIcon,
      title: "Professional Email Templates",
      description: "Access 200+ proven email templates designed by experts for maximum open and reply rates",
      delay: 0.2
    },
    {
      icon: ChartBarIcon,
      title: "Smart Response Notifications",
      description: "Get instant alerts when prospects respond positively, so you never miss a hot lead",
      delay: 0.3
    },
    {
      icon: ShieldCheckIcon,
      title: "AI-Powered Personalization",
      description: "Advanced AI analyzes each prospect and crafts personalized messages that convert",
      delay: 0.4
    },
    {
      icon: ClockIcon,
      title: "Automated Follow-up Sequences",
      description: "Set up intelligent follow-up campaigns that nurture leads automatically 24/7",
      delay: 0.5
    },
    {
      icon: SparklesIcon,
      title: "Real-time Analytics Dashboard",
      description: "Track campaign performance, open rates, and conversion metrics in real-time",
      delay: 0.6
    }
  ];

  const testimonials = [
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      name: "Daniel Griffin",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      quote: "This platform has revolutionized our email outreach. We've seen a 300% increase in response rates and saved countless hours of manual work. The AI personalization is incredible!",
      delay: 0.1
    },
    {
      image: "/testimonials/sarah.png",
      name: "Sarah Smith",
      role: "Sales Manager",
      company: "Global Solutions",
      quote: "The AI-powered personalization and automated follow-ups have been game-changers for our sales team. Our conversion rates have doubled since we started using this platform.",
      delay: 0.2
    },
    {
      image: "/testimonials/michel.png",
      name: "Michael Chen",
      role: "Founder & CEO",
      company: "StartupX",
      quote: "As a startup founder, this tool has been invaluable. It's helped us scale our outreach efforts without hiring additional staff. The ROI is absolutely phenomenal.",
      delay: 0.3
    },
    {
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      name: "Emma Rodriguez",
      role: "VP of Sales",
      company: "Enterprise Solutions",
      quote: "The industry-specific templates and smart targeting features have transformed our B2B outreach. We're generating 5x more qualified leads than before.",
      delay: 0.4
    },
    {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      name: "David Thompson",
      role: "Growth Marketing Lead",
      company: "ScaleUp Ventures",
      quote: "The real-time analytics and response notifications keep us ahead of the competition. This platform is a must-have for any growth-focused company.",
      delay: 0.5
    },
    {
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      name: "Lisa Anderson",
      role: "Digital Marketing Manager",
      company: "Innovation Labs",
      quote: "Setting up campaigns is incredibly easy, and the automated follow-up sequences work perfectly. Our team productivity has increased by 400%.",
      delay: 0.6
    }
  ];

  const pricingPlans = [
    {
      title: 'Starter',
      price: '99',
      subtitle: 'Perfect for solo founders',
      features: [
        '1,000 emails per month',
        '1 active sequence',
        'Basic analytics dashboard',
        'Email verification',
        '24/7 email support',
        'No integrations'
      ],
      popular: false,
      delay: 0.1
    },
    {
      title: 'Pro',
      price: '199',
      subtitle: 'Ideal for SaaS founders & small teams',
      features: [
        '5,000 emails per month',
        'Unlimited sequences',
        'Smart AI replies',
        '200+ email templates',
        'Basic CRM integration',
        'Limited integrations',
        'Priority support',
        'Custom domain'
      ],
      popular: true,
      delay: 0.2
    },
    {
      title: 'Power',
      price: '399',
      subtitle: 'Built for agencies & startups',
      features: [
        '15,000 emails per month',
        'Unlimited everything',
        'AI chat assistant',
        'Full CRM integration',
        'All integrations',
        'Team access & collaboration',
        'Email warmup service',
        'Dedicated account manager',
        'API access',
        'Custom integrations'
      ],
      popular: false,
      delay: 0.3
    }
  ];

  const handleWelcomeComplete = (onboardingData) => {
    setShowWelcomeModal(false);
    if (isNewUser) {
      setShowOnboardingModal(true);
    } else {
      // Existing user: go straight to dashboard
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email) {
        markUserAsExisting(user.email);
      }
      window.dispatchEvent(new Event('user-updated'));
      navigate('/dashboard');
      toast.success('Welcome to Outrelix! Your dashboard is ready.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    }
  };

  const handleOnboardingComplete = async (onboardingData) => {
    setShowOnboardingModal(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      markUserAsExisting(user.email);
    }
    // Send onboarding answers to backend
    try {
      console.log("POSTING onboarding", onboardingData);
      await fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://outrelix-backend.onrender.com'}/api/user/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          expect: onboardingData.expect || onboardingData.goals || '',
          primary_role: onboardingData.role || '',
          industry: onboardingData.industry || '',
          company_size: onboardingData.company_size || onboardingData.companySize || '',
          email_platform: 'google',
          company_name: onboardingData.company_name || onboardingData.companyName || ''
        })
      });
    } catch (err) {
      console.error('Failed to save onboarding:', err);
    }
    // Update user name in localStorage if changed in onboarding
    if (onboardingData && onboardingData.userName) {
      user.name = onboardingData.userName;
      user.displayName = onboardingData.userName;
      localStorage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
    }
    window.dispatchEvent(new Event('user-updated'));
    navigate('/dashboard');
    toast.success('Welcome to Outrelix! Your dashboard is ready.', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  };

  // --- Fix: Auto-change industry text ---
  useEffect(() => {
    let timeout;
    if (industryTyping) {
      if (industryDisplayed.length < industryNames[industryIndex].length) {
        timeout = setTimeout(() => {
          setIndustryDisplayed(industryNames[industryIndex].slice(0, industryDisplayed.length + 1));
        }, 60);
      } else {
        timeout = setTimeout(() => setIndustryTyping(false), 1200);
      }
    } else {
      timeout = setTimeout(() => {
        setIndustryDisplayed('');
        setIndustryTyping(true);
        setIndustryIndex((prev) => (prev + 1) % industryNames.length);
      }, 800);
    }
    return () => clearTimeout(timeout);
  }, [industryDisplayed, industryTyping, industryIndex]);

  return (
    <>
      <style>{`
        nav:not(:first-of-type) { display: none !important; }
        .gradient-text {
          background: linear-gradient(135deg, #22c55e, #3b82f6, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .floating { animation: float 6s ease-in-out infinite; }
        body, .poppins, .font-poppins {
          font-family: 'Poppins', Arial, sans-serif !important;
        }
        html, body, #root {
          height: 100%;
        }
        /* Enhanced animations */
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(168, 85, 247, 0.6); }
        }
        .glow-animation { animation: glow 3s ease-in-out infinite; }
        @keyframes pulse-glow {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(168, 85, 247, 0.4);
          }
        }
        .pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
        section[id] { scroll-margin-top: 80px; }
        .btn-gradient:hover {
          background-size: 200% 200%;
          animation: gradient-shift 2s ease infinite;
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>

      <div className="min-h-screen flex flex-col" style={{ minHeight: '100vh', background: 'none' }}>
        {/* Hero Section - now truly full viewport, edge-to-edge */}
        <section className="relative w-full min-h-[700px] flex items-start justify-center overflow-hidden" style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
          {/* Full background gradient */}
          <div className="absolute inset-0 w-full h-full z-0 bg-white dark:bg-gray-900" />
          
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            {/* Top-left vertical line */}
            <div className="absolute top-20 left-20 space-y-3">
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
            </div>
            
            {/* Top-right small cluster */}
            <div className="absolute top-16 right-32 space-y-2">
              <div className="flex space-x-2">
                <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              </div>
            </div>
            
            {/* Mid-left small cluster */}
            <div className="absolute top-1/2 left-1/4 space-y-2">
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
            </div>
            
            {/* Mid-right scattered dots */}
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
            <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
            <div className="absolute top-1/2 right-1/5 w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
            
            {/* Bottom-left vertical line */}
            <div className="absolute bottom-32 left-20 space-y-3">
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
          </div>
          
            {/* Bottom-right scattered dots */}
            <div className="absolute bottom-24 right-32 w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
            <div className="absolute bottom-16 right-24 w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
            <div className="absolute bottom-40 right-16 w-1 h-1 bg-gray-300 rounded-full opacity-40"></div>
          </div>
          
          {/* Hero content */}
          <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between w-full max-w-7xl mx-auto px-6 pt-12 pb-16">
            {/* Left: Enhanced Text Content */}
            <div className="flex-1 flex flex-col justify-start items-start text-left gap-6 max-w-2xl font-poppins">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                {/* Enhanced Headline with better font balance */}
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight group">
                  <span 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent font-poppins drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 cursor-default" 
                    style={{ lineHeight: '1.05' }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.1))';
                    }}
                  >
                    Supercharge Your Outreach
                  </span>
                </h1>
                
                {/* Enhanced Subheadline */}
                <h2 className="text-xl lg:text-3xl font-medium text-gray-900 dark:text-white font-poppins leading-tight">
                  <svg className="inline-block w-7 h-7 mr-3 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    {/* Main sparkle/star */}
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                    {/* Inner sparkle */}
                    <path d="M12 6L12.5 8.5L15 9L12.5 9.5L12 12L11.5 9.5L9 9L11.5 8.5L12 6Z"/>
                    {/* Automation magic elements - gears and connections */}
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.6"/>
                    {/* Small connecting dots */}
                    <circle cx="8" cy="8" r="0.5" fill="currentColor" opacity="0.4"/>
                    <circle cx="16" cy="8" r="0.5" fill="currentColor" opacity="0.4"/>
                    <circle cx="8" cy="16" r="0.5" fill="currentColor" opacity="0.4"/>
                    <circle cx="16" cy="16" r="0.5" fill="currentColor" opacity="0.4"/>
                    {/* Magic sparkles around */}
                    <path d="M6 6L6.5 6.5L7 6L6.5 5.5L6 6Z" fill="currentColor" opacity="0.3"/>
                    <path d="M18 6L17.5 6.5L17 6L17.5 5.5L18 6Z" fill="currentColor" opacity="0.3"/>
                    <path d="M6 18L6.5 17.5L7 18L6.5 18.5L6 18Z" fill="currentColor" opacity="0.3"/>
                    <path d="M18 18L17.5 17.5L17 18L17.5 18.5L18 18Z" fill="currentColor" opacity="0.3"/>
                  </svg>
                  with Smart AI Email Automation
                </h2>
                
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 font-normal max-w-xl font-poppins leading-relaxed">
                  Find ideal leads, launch personalized campaigns, and grow your business — even while you sleep.
                </p>
                
                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-5">
                  <motion.button
                  onClick={() => setIsSignupOpen(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-out border-0 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <RocketLaunchIcon className="w-5 h-5" />
                      Start Free Trial
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </motion.button>
                  
                  <motion.button
                  onClick={() => setIsVideoOpen(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-out flex items-center gap-3 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <PlayCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    Watch Demo
                  </motion.button>
                </div>
                
                {/* Enhanced Trust Badges - Moved Closer to Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>Trusted by 500+ startups</span>
                  </div>
                  <div className="hidden sm:block text-gray-300 dark:text-gray-600">|</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="text-gray-400">🔒</span>
                    <span>14-day free trial</span>
                  </div>
                  <div className="hidden sm:block text-gray-300 dark:text-gray-600">|</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4 text-purple-500" />
                    <span>Setup in 5 minutes</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Right: Enhanced Animated Illustration */}
            <div className="flex-1 flex flex-col items-center justify-start relative mt-4 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="relative"
              >
                {/* Email SVG Image - Clean without background container */}
                <div className="relative w-96 h-96 lg:w-[28rem] lg:h-[28rem] flex items-center justify-center">
                  <img 
                    src={`${process.env.PUBLIC_URL || ''}/email.svg`} 
                    alt="Email Automation" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Enhanced animated elements */}
                  <motion.div
                    animate={{ y: [-12, 12, -12], scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-12 right-12 w-4 h-4 bg-blue-500 rounded-full opacity-70 shadow-lg"
                  />
                  <motion.div
                    animate={{ y: [12, -12, 12], scale: [1, 1.3, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-12 left-12 w-3 h-3 bg-purple-500 rounded-full opacity-70 shadow-lg"
                  />
                  <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 right-8 w-2 h-2 bg-green-400 rounded-full opacity-60"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Company Logos Section */}
        <section className="py-16 w-full bg-white dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Built for marketing & sales teams using
              </h3>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Seamlessly integrate with your favorite tools
              </p>
            </div>
            
            {/* Logos Container */}
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll space-x-20">
                {/* First set of logos */}
                <div className="flex items-center space-x-20 min-w-max">
                  <div className="flex items-center justify-center w-72 h-44 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/salesforce.png`} alt="Salesforce" className="h-40 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-48 h-22 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110 -ml-6">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/HubSpot.png`} alt="HubSpot" className="h-16 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/google.png`} alt="Google" className="h-12 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/mailchimp.png`} alt="Mailchimp" className="h-10 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img 
                      src={`${process.env.PUBLIC_URL || ''}/logos/linkedin.png`} 
                      alt="LinkedIn" 
                      className="h-8 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" 
                      onError={(e) => {
                        // Try alternative file extensions
                        if (e.target.src.includes('.png')) {
                          e.target.src = '/logos/linkedin.svg';
                        } else if (e.target.src.includes('.svg')) {
                          e.target.src = '/logos/linkedin.jpg';
                        } else if (e.target.src.includes('.jpg')) {
                          e.target.src = '/logos/LinkedIn.png';
                        } else {
                          e.target.style.display = 'none';
                          console.log('LinkedIn logo failed to load - trying alternative paths');
                        }
                      }} 
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/zoom.png`} alt="Zoom" className="h-16 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-32 h-16 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/slack.png`} alt="Slack" className="h-8 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                </div>
                
                {/* Duplicate set for seamless loop */}
                <div className="flex items-center space-x-20 min-w-max">
                  <div className="flex items-center justify-center w-72 h-44 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/salesforce.png`} alt="Salesforce" className="h-40 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-48 h-22 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110 -ml-6">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/HubSpot.png`} alt="HubSpot" className="h-16 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/google.png`} alt="Google" className="h-12 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/mailchimp.png`} alt="Mailchimp" className="h-10 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img 
                      src={`${process.env.PUBLIC_URL || ''}/logos/linkedin.png`} 
                      alt="LinkedIn" 
                      className="h-8 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" 
                      onError={(e) => {
                        // Try alternative file extensions
                        if (e.target.src.includes('.png')) {
                          e.target.src = '/logos/linkedin.svg';
                        } else if (e.target.src.includes('.svg')) {
                          e.target.src = '/logos/linkedin.jpg';
                        } else if (e.target.src.includes('.jpg')) {
                          e.target.src = '/logos/LinkedIn.png';
                        } else {
                          e.target.style.display = 'none';
                          console.log('LinkedIn logo failed to load - trying alternative paths');
                        }
                      }} 
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/zoom.png`} alt="Zoom" className="h-16 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-32 h-16 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/slack.png`} alt="Slack" className="h-8 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                </div>
                
                {/* Third duplicate set for smoother loop */}
                <div className="flex items-center space-x-20 min-w-max">
                  <div className="flex items-center justify-center w-72 h-44 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/salesforce.png`} alt="Salesforce" className="h-40 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-48 h-22 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110 -ml-6">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/HubSpot.png`} alt="HubSpot" className="h-16 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/google.png`} alt="Google" className="h-12 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/mailchimp.png`} alt="Mailchimp" className="h-10 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img 
                      src={`${process.env.PUBLIC_URL || ''}/logos/linkedin.png`} 
                      alt="LinkedIn" 
                      className="h-8 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" 
                      onError={(e) => {
                        // Try alternative file extensions
                        if (e.target.src.includes('.png')) {
                          e.target.src = '/logos/linkedin.svg';
                        } else if (e.target.src.includes('.svg')) {
                          e.target.src = '/logos/linkedin.jpg';
                        } else if (e.target.src.includes('.jpg')) {
                          e.target.src = '/logos/LinkedIn.png';
                        } else {
                          e.target.style.display = 'none';
                          console.log('LinkedIn logo failed to load - trying alternative paths');
                        }
                      }} 
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/zoom.png`} alt="Zoom" className="h-16 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-32 h-16 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/slack.png`} alt="Slack" className="h-8 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                </div>
                
                {/* Fourth duplicate set for completely seamless loop */}
                <div className="flex items-center space-x-20 min-w-max">
                  <div className="flex items-center justify-center w-72 h-44 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/salesforce.png`} alt="Salesforce" className="h-40 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-48 h-22 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110 -ml-6">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/HubSpot.png`} alt="HubSpot" className="h-16 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/google.png`} alt="Google" className="h-12 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/mailchimp.png`} alt="Mailchimp" className="h-10 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-40 h-20 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img 
                      src={`${process.env.PUBLIC_URL || ''}/logos/linkedin.png`} 
                      alt="LinkedIn" 
                      className="h-8 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" 
                      onError={(e) => {
                        // Try alternative file extensions
                        if (e.target.src.includes('.png')) {
                          e.target.src = '/logos/linkedin.svg';
                        } else if (e.target.src.includes('.svg')) {
                          e.target.src = '/logos/linkedin.jpg';
                        } else if (e.target.src.includes('.jpg')) {
                          e.target.src = '/logos/LinkedIn.png';
                        } else {
                          e.target.style.display = 'none';
                          console.log('LinkedIn logo failed to load - trying alternative paths');
                        }
                      }} 
                    />
                  </div>
                  <div className="flex items-center justify-center w-48 h-24 opacity-75 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/zoom.png`} alt="Zoom" className="h-16 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                  <div className="flex items-center justify-center w-32 h-16 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <img src={`${process.env.PUBLIC_URL || ''}/logos/slack.png`} alt="Slack" className="h-8 w-auto object-contain filter drop-shadow-sm dark:brightness-0 dark:invert" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow mb-4 font-poppins">
                Powerful Features That Drive Results
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-poppins">
                Everything you need to run successful email campaigns and grow your business
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
            
            {/* More Details Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <a
                href="/faq#technical"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold font-poppins transition-colors duration-300 group"
              >
                <span>Learn more about our features and technical details</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
              </a>
            </motion.div>
          </div>
        </section>

        <section id="testimonials" className="py-20 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow mb-4 font-poppins">
                What Our Clients Say
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-poppins">
                Join thousands of satisfied users who have transformed their email outreach and achieved remarkable results
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow mb-4 font-poppins">
                Real-Time Platform Statistics
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-poppins">
                See the impact our platform is making right now
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2 font-poppins relative">
                  <LiveCounter start={1247} end={2000} duration={3000} isLive={true} updateInterval={10000} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xl text-gray-600 dark:text-gray-300 font-poppins">Emails Sent Today</div>
                <div className="text-sm text-green-500 dark:text-green-400 font-poppins mt-2">Live Counter • Updates Every 10s</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 font-poppins">
                  <LiveCounter start={89} end={95} duration={2000} />%
                </div>
                <div className="text-xl text-gray-600 dark:text-gray-300 font-poppins">Average Open Rate</div>
                <div className="text-sm text-blue-500 dark:text-blue-400 font-poppins mt-2">Industry Leading</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2 font-poppins">
                  <LiveCounter start={156} end={200} duration={2500} />
                </div>
                <div className="text-xl text-gray-600 dark:text-gray-300 font-poppins">Active Campaigns</div>
                <div className="text-sm text-purple-500 dark:text-purple-400 font-poppins mt-2">Running Now</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Security & Compliance Section */}
        <section id="security" className="py-20 w-full bg-white dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16">
              {/* Left: Security Content */}
              <div className="flex-1 space-y-8">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full text-sm font-medium text-green-700 dark:text-green-300 mb-4">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Security & Compliance
                  </div>
                  <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow mb-6 font-poppins">
                    Your Data Security is Our Priority
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 font-poppins leading-relaxed">
                    We understand the importance of data protection and compliance in today's digital landscape.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins mb-1">We Never Store Your Leads</h3>
                        <p className="text-gray-600 dark:text-gray-400 font-poppins text-sm leading-relaxed">Your prospect data remains secure and private</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins mb-1">SOC2 & GDPR Ready</h3>
                        <p className="text-gray-600 dark:text-gray-400 font-poppins text-sm leading-relaxed">Enterprise-grade security and compliance</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins mb-1">End-to-End Encryption</h3>
                      <p className="text-gray-600 dark:text-gray-400 font-poppins text-sm leading-relaxed">All data is encrypted in transit and at rest</p>
                    </div>
                  </div>
                </motion.div>

                {/* More Details Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-center lg:text-left"
                >
                  <a
                    href="/faq#security"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold font-poppins transition-colors duration-300 group"
                  >
                    <span>Learn more about our security measures</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </motion.div>
              </div>
              
              {/* Right: Industry Selector - Moved further right */}
              <div className="flex-shrink-0 flex flex-col items-center lg:items-end">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">
                      Select Your Industry
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-poppins">
                      Choose from our comprehensive list of industries
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-poppins mb-2">
                        Available Industries
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white font-poppins min-h-[3rem] flex items-center justify-center">
                        {industryDisplayed}
                        <span className="animate-pulse">|</span>
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-poppins mt-2">
                        +20 Industries Available
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    {industryPhrases.slice(0, 6).map((industry, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-poppins">{industry}</span>
                      </div>
                    ))}
                  </div>
                  
                <button
                  onClick={() => setIsSignupOpen(true)}
                    className="w-full mt-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity font-poppins"
                  >
                    Start with Your Industry
                </button>
              </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 w-full bg-white dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 px-4 py-2 rounded-full text-sm font-medium text-green-700 dark:text-green-300 mb-4">
                <SparklesIcon className="w-4 h-4" />
                Pricing Plans
              </div>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow mb-6 font-poppins">
                Choose Your Perfect Plan
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-poppins leading-relaxed">
                Start with our free trial and scale as you grow. No hidden fees, cancel anytime.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
              {pricingPlans.map((plan, index) => (
                <PricingCard key={index} {...plan} onSignupClick={() => setIsSignupOpen(true)} />
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-gray-600 dark:text-gray-400 font-poppins mb-4">
                🔒 Only the Starter Plan is available during the 14-day free trial. Pro and Power plans require paid upgrades.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 font-poppins">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span>24/7 support</span>
                </div>
              </div>
              
              {/* More Details Link */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <Link
                  to="/faq#pricing"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold font-poppins transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                >
                  <span>View Pricing FAQs & Details</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Preview Section */}
        <section className="py-12 w-full bg-white dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 px-4 py-2 rounded-full text-sm font-medium text-green-700 dark:text-green-300 mb-4">
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                  Frequently Asked Questions
                </div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow mb-6 font-poppins">
                  Common Questions About Outrelix
            </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-poppins">
                  Get quick answers to the most frequently asked questions about our AI-powered email automation platform
              </p>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {/* Quick FAQ Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <RocketLaunchIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">Getting Started</h3>
          </div>
                  <p className="text-gray-600 dark:text-gray-400 font-poppins mb-4">
                    How quickly can I see results with Outrelix?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-poppins">
                    Most users see results within the first week. Our AI starts learning immediately and you'll typically see improved open rates within 7-14 days.
                  </p>
                </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CreditCardIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">Pricing & Billing</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-poppins mb-4">
                    What's included in the free trial?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-poppins">
                    The 14-day free trial includes full access to Starter plan features: 1,000 emails, 1 active sequence, analytics dashboard, and 24/7 support.
                  </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">Security & Privacy</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-poppins mb-4">
                    How do you protect my data?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-poppins">
                    We never store your prospect data permanently. All data is encrypted with AES-256 and we're SOC2 & GDPR compliant.
                  </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <CogIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">Technical Features</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-poppins mb-4">
                    How accurate is the AI personalization?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-poppins">
                    Our AI achieves 85-95% personalization rates by analyzing each prospect's profile and company information.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">Analytics & Reporting</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-poppins mb-4">
                    What analytics do you provide?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-poppins">
                    Real-time dashboards with open rates, click rates, reply rates, bounce rates, and conversion tracking.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                      <UserGroupIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-poppins">Support & Help</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-poppins mb-4">
                    What support options are available?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 font-poppins">
                    24/7 email support for all plans, live chat for Pro/Power plans, and dedicated account managers for Power users.
                  </p>
                </motion.div>
              </div>

              {/* View All FAQs Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <a
                  href="/faq"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity font-poppins shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <QuestionMarkCircleIcon className="w-6 h-6" />
                  View All FAQs
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 w-full relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #1d4ed8 50%, #1e40af 75%, #1e3a8a 100%)'
        }}>
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Enhanced crystal gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-500/15 to-blue-600/20"></div>
            
            {/* Crystal-like floating elements */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-blue-300/20 rounded-full animate-pulse backdrop-blur-sm" style={{ animationDuration: '4s' }}></div>
            <div className="absolute top-20 right-20 w-12 h-12 bg-blue-200/25 rounded-full animate-pulse backdrop-blur-sm" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-blue-300/30 rounded-full animate-pulse backdrop-blur-sm" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
            <div className="absolute bottom-10 right-1/3 w-20 h-20 bg-blue-200/20 rounded-full animate-pulse backdrop-blur-sm" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}></div>
            
            {/* Crystal geometric shapes */}
            <div className="absolute top-1/4 left-1/3 w-24 h-24 border border-blue-300/30 rounded-full animate-spin backdrop-blur-sm" style={{ animationDuration: '30s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 border border-blue-200/40 rotate-45 animate-pulse backdrop-blur-sm" style={{ animationDuration: '6s' }}></div>
            
            {/* Crystal grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(147, 197, 253, 0.8) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>
            
            {/* Crystal decorative elements */}
            {/* Large crystal circles */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-200/25 to-transparent rounded-full blur-xl"></div>
            
            {/* Crystal diamond shapes */}
            <div className="absolute top-1/3 left-0 w-32 h-32 bg-blue-300/15 rotate-45 transform -translate-x-16 backdrop-blur-sm"></div>
            <div className="absolute bottom-1/3 right-0 w-24 h-24 bg-blue-200/20 rotate-45 transform translate-x-12 backdrop-blur-sm"></div>
            
            {/* Crystal floating lines */}
            <div className="absolute top-1/2 left-0 w-32 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent"></div>
            <div className="absolute top-1/3 right-0 w-24 h-px bg-gradient-to-l from-transparent via-blue-200/50 to-transparent"></div>
            <div className="absolute bottom-1/4 left-1/2 w-40 h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent transform -translate-x-20"></div>
            
            {/* Crystal animated particles */}
            <div className="absolute top-20 left-1/2 w-2 h-2 bg-blue-200/60 rounded-full animate-bounce backdrop-blur-sm" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
            <div className="absolute top-40 right-1/3 w-1.5 h-1.5 bg-blue-300/70 rounded-full animate-bounce backdrop-blur-sm" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-blue-200/80 rounded-full animate-bounce backdrop-blur-sm" style={{ animationDuration: '2.5s', animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 right-1/2 w-2.5 h-2.5 bg-blue-300/50 rounded-full animate-bounce backdrop-blur-sm" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>
            
            {/* Crystal wave effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-300/10 to-transparent"></div>
            
            {/* Crystal corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-blue-300/30"></div>
            <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-blue-300/30"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-blue-300/30"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-blue-300/30"></div>
          </div>
          
          <div className="relative z-10 w-full text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full px-4 sm:px-6 lg:px-8"
            >
              {/* Enhanced Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-semibold text-white mb-6 border border-white/20 shadow-lg">
                <SparklesIcon className="w-5 h-5 text-yellow-300" />
                Join 10,000+ Successful Users
              </div>
              
              {/* Refined Main Heading */}
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 font-poppins leading-tight drop-shadow-lg">
                Ready to Transform Your 
                <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                  Email Outreach?
                </span>
              </h2>
              
              {/* Enhanced Subtitle */}
              <p className="text-xl lg:text-2xl text-white/95 mb-8 font-poppins leading-relaxed max-w-3xl mx-auto">
                Start your free trial today and see the difference AI-powered email automation can make for your business
              </p>
              
              {/* Refined Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                  <div className="text-2xl font-bold text-white font-poppins">14 Days</div>
                  <div className="text-white/90 text-sm font-poppins">Free Trial</div>
            </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                  <div className="text-2xl font-bold text-white font-poppins">$0</div>
                  <div className="text-white/90 text-sm font-poppins">Setup Fee</div>
            </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                  <div className="text-2xl font-bold text-white font-poppins">24/7</div>
                  <div className="text-white/90 text-sm font-poppins">Support</div>
          </div>
              </div>
              
              {/* Enhanced CTA Buttons - Equal Size */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <motion.button
              onClick={() => setIsSignupOpen(true)}
                  className="group relative bg-white text-blue-700 px-8 py-5 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl font-poppins overflow-hidden border-2 border-white/20"
                >
                  {/* Enhanced button background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors duration-300">
                    <RocketLaunchIcon className="w-6 h-6" />
                    Get Started Now
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  
                  {/* Enhanced shine effect */}
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </motion.button>
                
                <motion.button
                  onClick={() => setIsVideoOpen(true)}
                  className="group bg-transparent border-2 border-white/30 text-white px-8 py-5 rounded-2xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm font-poppins flex items-center gap-3 shadow-lg hover:shadow-xl hover:shadow-white/20"
                >
                  <PlayCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  Watch Demo
                </motion.button>
              </div>
              
              {/* Enhanced trust indicators */}
              <div className="space-y-6">
                {/* Value propositions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="flex items-start gap-3 text-white/95 text-sm font-poppins">
                    <CheckCircleIcon className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>Full access to AI sales agent</span>
                  </div>
                  <div className="flex items-start gap-3 text-white/95 text-sm font-poppins">
                    <CheckCircleIcon className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>Send your first cold email campaign today</span>
                  </div>
                  <div className="flex items-start gap-3 text-white/95 text-sm font-poppins">
                    <CheckCircleIcon className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>AI writes, sends, and replies — you just get meetings</span>
                  </div>
                  <div className="flex items-start gap-3 text-white/95 text-sm font-poppins">
                    <CheckCircleIcon className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                    <span>Cancel anytime. Zero commitment.</span>
                  </div>
                </div>
                
                {/* Enhanced credit card requirement */}
                <div className="flex items-center justify-center gap-2 text-white/90 text-sm font-poppins bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20 max-w-md mx-auto shadow-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-green-300" />
                  <span>Credit card required to protect platform quality</span>
                </div>
                
                {/* Additional trust signals */}
                <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-xs font-poppins">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-300" />
                    <span>No hidden fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-300" />
                    <span>Instant setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-300" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Spacer to disconnect sections */}
        <div className="w-full h-16 bg-white dark:bg-gray-900" style={{ margin: 0, padding: 0 }}></div>

        <AnimatePresence>
          {isVideoOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
              onClick={() => setIsVideoOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl w-full aspect-video bg-black rounded-xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                  {t('Your browser does not support the video tag.')}
                </video>
                <button
                  onClick={() => setIsVideoOpen(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <SignupModal
          isOpen={isSignupOpen}
          onClose={() => setIsSignupOpen(false)}
          onSignupSuccess={handleSignupSuccess}
          pendingOnboardingUserName={pendingOnboardingUserName}
          setShowOnboardingModal={setShowOnboardingModal}
          setShowWelcomeModal={setShowWelcomeModal}
          setIsNewUser={setIsNewUser}
          setOnboardingUserName={setOnboardingUserName}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          hasProcessedVerification={hasProcessedVerification}
          setHasProcessedVerification={setHasProcessedVerification}
          showOTPModal={showOTPModal}
          setShowOTPModal={setShowOTPModal}
          pendingEmail={pendingEmail}
          setPendingEmail={setPendingEmail}
        />
        <WelcomeModal
          isOpen={showWelcomeModal}
          onComplete={handleWelcomeComplete}
        />
        <OnboardingModal
          open={showOnboardingModal}
          userName={onboardingUserName}
          onClose={handleOnboardingComplete}
        />
        <OTPVerificationModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          email={pendingEmail}
          onVerificationSuccess={handleOTPVerificationSuccess}
        />
        <ToastContainer />
        {/* Footer - properly separated and full width */}
        <footer className="w-full">
          <Footer />
        </footer>
      </div>
    </>
  );
};

export default Landing; 