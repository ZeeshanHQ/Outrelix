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
import BACKEND_URL from '../config/backend';
import { auth, db } from '../supabase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OnboardingModal from '../components/OnboardingModal';
import WelcomeModal from '../components/WelcomeModal';
import OTPVerificationModal from '../components/OTPVerificationModal';
import Footer from '../components/Footer';
import { HeroSection } from '../components/blocks/hero-section-1';

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
    className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 ${popular
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
      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 font-poppins ${title === 'Starter'
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
    const locale = typeof navigator !== 'undefined' ? (navigator.language.split('-')[1] || 'PK') : 'PK';
    const res = await fetch(`${BACKEND_URL}/api/geoip?locale=${locale}`);
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
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('loginCalled:' + email) === 'true';
}
function setLoginCalled(email) {
  if (typeof window === 'undefined') return;
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
      await auth.signInWithGoogle({ redirectTo: window.location.origin + '/dashboard' });
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
        const res = await fetch(`${BACKEND_URL}/login`, {
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
        // Redirect handled by Supabase, logic will continue in App.jsx and Landing's useEffect
        return;
      } else {
        result = await auth.signUp(email, password, { full_name: name });
        localStorage.setItem('isNewUser', 'true');

        // Send OTP for email verification
        try {
          const otpResponse = await fetch(`${BACKEND_URL}/api/otp/send`, {
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
    const res = await fetch(`${BACKEND_URL}/login`, {
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
    const meRes = await fetch(`${BACKEND_URL}/me`, { credentials: 'include' });
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
                <img src="/icons/google.png" alt="Google" className="w-5 h-5" />
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
      await fetch(`${BACKEND_URL}/api/user/onboarding`, {
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
    <div className="min-h-screen bg-[#000000] text-white font-poppins selection:bg-blue-500/30 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap');
        
        :root {
          --obsidian: #000000;
          --obsidian-elevated: #050505;
          --obsidian-border: rgba(255, 255, 255, 0.08);
          --accent-blue: #3b82f6;
          --accent-purple: #8b5cf6;
        }

        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }

        .obsidian-card {
          background: rgba(10, 10, 10, 0.5);
          backdrop-filter: blur(12px);
          border: 1px solid var(--obsidian-border);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }

        .glow-overlay {
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        html { scroll-behavior: smooth; }
        section[id] { scroll-margin-top: 80px; }
      `}</style>

      {/* Hero Section Layer */}
      <div className="relative">
        <div className="absolute inset-0 glow-overlay pointer-events-none" />
        <HeroSection
          setIsSignupOpen={setIsSignupOpen}
        />
      </div>


      {/* Layer 2: Metric Grid - Tactical Intelligence */}
      <section className="relative py-24 bg-black overflow-hidden border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Neural Extractions", value: 12400000, suffix: "+", icon: SparklesIcon },
              { label: "Verified Leads", value: 890000, suffix: "", icon: CheckCircleIcon },
              { label: "Outreach Automation", value: 99.9, suffix: "%", icon: RocketLaunchIcon },
              { label: "Conversion Lift", value: 4.2, suffix: "x", icon: ChartBarIcon },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="obsidian-card p-10 rounded-[30px] group hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="flex items-center gap-4 mb-4">
                  <stat.icon className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{stat.label}</span>
                </div>
                <div className="text-4xl md:text-5xl font-outfit font-black text-white">
                  <LiveCounter start={0} end={stat.value} duration={2000} isLive />
                  <span className="text-blue-500">{stat.suffix}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Layer 3: Neural Intelligence - Bento Grid Feature Showcase */}
      <section className="relative py-32 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4">Autonomous Capabilities</h2>
            <h3 className="text-4xl md:text-7xl font-outfit font-black text-white uppercase italic tracking-tighter">
              The Architecture of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Dominance</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[350px]">
            {/* Big Feature 1: Global Intelligence */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-8 obsidian-card rounded-[40px] p-12 flex flex-col justify-end group transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                <GlobeAltIcon className="w-80 h-80 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">Neural Scan</span>
                </div>
                <h4 className="text-4xl font-outfit font-black text-white mb-6 uppercase">Global Lead Infiltration</h4>
                <p className="text-white/40 max-w-md font-inter text-lg leading-relaxed">
                  Our neural agents bypass traditional barriers to extract precise contact intelligence from across the decentralized web.
                </p>
              </div>
            </motion.div>

            {/* Small Feature 1: Verification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-4 obsidian-card rounded-[40px] p-12 flex flex-col items-center justify-center text-center group transition-all duration-500"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-12 h-12 text-purple-500" />
              </div>
              <h4 className="text-2xl font-outfit font-black text-white uppercase">Zero-Bounce Protocol</h4>
              <p className="text-white/40 text-base mt-4 font-inter leading-relaxed">Verified at source with 99.9% accuracy.</p>
            </motion.div>

            {/* Small Feature 2: Personalization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-4 obsidian-card rounded-[40px] p-12 flex flex-col items-center justify-center text-center group transition-all duration-500"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-600/20 to-blue-600/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <SparklesIcon className="w-12 h-12 text-green-500" />
              </div>
              <h4 className="text-2xl font-outfit font-black text-white uppercase">Neural Icebreakers</h4>
              <p className="text-white/40 text-base mt-4 font-inter leading-relaxed">Personalization that feels human, acts machine.</p>
            </motion.div>

            {/* Big Feature 2: Command Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-8 obsidian-card rounded-[40px] p-12 flex flex-col justify-end group transition-all duration-500 overflow-hidden relative bg-gradient-to-br from-[#050505] to-[#101010]"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-purple-600/20 text-purple-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">Command Center</span>
                </div>
                <h4 className="text-4xl font-outfit font-black text-white mb-6 uppercase">Unified Campaign Control</h4>
                <p className="text-white/40 max-w-lg font-inter text-lg leading-relaxed">
                  Orchestrate complex multi-channel outreach strategies from a single neural interface. Set your goals, and let the intelligence execute.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Layer 4: Enterprise Solutions - Comparative Advantage */}
      <section className="relative py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1">
              <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">Enterprise Protocol</h2>
              <h3 className="text-4xl md:text-5xl font-outfit font-black text-white italic uppercase tracking-tighter mb-8">
                Legacy Outreach is <br />
                <span className="text-white/20">Extinct.</span>
              </h3>
              <div className="space-y-6">
                {[
                  "Eliminate manual lead research entirely",
                  "Bypass restrictive landing page barriers",
                  "Automated personalization at global scale",
                  "Neural verification prevents domain blacklisting"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <span className="font-inter text-sm font-bold uppercase tracking-widest">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="obsidian-card p-8 rounded-[30px] border-red-500/10">
                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Legacy Scrapers</div>
                <div className="text-2xl font-outfit font-black text-white/40 mb-2">3.2% Response</div>
                <p className="text-white/20 text-xs">Unverified data, generic messages, high bounce rates.</p>
              </div>
              <div className="obsidian-card p-8 rounded-[30px] border-blue-500/30 bg-blue-500/5">
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Outrelix Neural</div>
                <div className="text-2xl font-outfit font-black text-white mb-2">18.4% Response</div>
                <p className="text-white/40 text-xs">Neural infiltration, 99.9% accuracy, automated empathy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layer 5: Global Social Proof - Partner Intelligence */}
      <div className="py-20 border-y border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-12 opacity-30 grayscale hover:opacity-100 transition-opacity duration-1000">
            {['Salesforce', 'HubSpot', 'Stripe', 'Google', 'Meta'].map((partner) => (
              <span key={partner} className="text-2xl font-outfit font-black text-white tracking-tighter uppercase italic">{partner}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Layer: Deep Sea Call to Action */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-8xl font-outfit font-black text-white uppercase italic tracking-tighter mb-12">
              Ready to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500">Infiltrate?</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button
                onClick={() => setIsSignupOpen(true)}
                className="w-full md:w-auto px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-blue-500 hover:text-white transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
              >
                Establish Connection
              </button>
              <button
                onClick={() => setIsVideoOpen(true)}
                className="w-full md:w-auto px-12 py-6 bg-transparent border-2 border-white/10 text-white font-black uppercase tracking-widest rounded-full hover:bg-white/5 transition-all duration-500"
              >
                Watch Briefing
              </button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
              <span>No Credit Card</span>
              <span>14-Day Intel Access</span>
              <span>Elite Level Only</span>
            </div>
          </motion.div>
        </div>
      </section>

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
  );
};

export default Landing;
// Force HMR update to clear ReferenceError