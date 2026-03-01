import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NumberFlow from "@number-flow/react";
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
import { ArrowRight, CheckCircle } from 'lucide-react';
import BACKEND_URL from '../config/backend';
import { auth, db } from '../supabase';
import OnboardingModal from '../components/OnboardingModal';
import WelcomeModal from '../components/WelcomeModal';
import OTPVerificationModal from '../components/OTPVerificationModal';
// Removed Footer import to prevent duplication
import { HeroSection } from '../components/blocks/hero-section-1';
import ProcessSection from '../components/blocks/ProcessSection';
import OrbitalTimelineBlock from '../components/blocks/OrbitalTimelineBlock';
import IndustryScrapers from '../components/blocks/IndustryScrapers';
import FAQSection from '../components/blocks/FAQSection';
import InteractivePipeline from '../components/blocks/InteractivePipeline';
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Avatar, AvatarImage } from "../components/ui/avatar";
import { RainbowButton } from "../components/ui/rainbow-button";
import { cn } from "../lib/utils";

// FeatureCard component
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-100 group"
  >
    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-blue-600" />
    </div>
    <h3 className="text-xl font-bold mb-4 text-slate-900 leading-tight">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

// TestimonialCard component
const TestimonialCard = ({ author, text, className }) => {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border-t",
        "bg-gradient-to-b from-muted/50 to-muted/10",
        "p-4 text-start sm:p-6",
        "hover:from-muted/60 hover:to-muted/20",
        "transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-md font-semibold leading-none">{author.name}</h3>
          <p className="text-sm text-muted-foreground">{author.handle}</p>
        </div>
      </div>
      <p className="sm:text-md mt-4 text-sm text-muted-foreground leading-relaxed italic">"{text}"</p>
    </div>
  )
};

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
const PricingCard = ({ tier, paymentFrequency = "monthly", onSignupClick }) => {
  const price = tier.price[paymentFrequency]
  const isHighlighted = tier.highlighted
  const isPopular = tier.popular

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-8 overflow-hidden p-6 hover:shadow-2xl transition-all duration-300",
        isHighlighted ? "bg-foreground text-background" : "bg-background text-foreground",
        isPopular && "ring-2 ring-blue-600"
      )}
    >
      {isHighlighted && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      )}
      {isPopular && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.1),rgba(255,255,255,0))]" />
      )}

      <h2 className="flex items-center gap-3 text-xl font-medium capitalize z-10">
        {tier.name}
        {isPopular && (
          <Badge variant="secondary" className="mt-1 z-10 bg-blue-100 text-blue-600 border-none shadow-none">
            🔥 Most Popular
          </Badge>
        )}
      </h2>

      <div className="relative h-12 z-10">
        {typeof price === "number" ? (
          <>
            <NumberFlow
              format={{
                style: "currency",
                currency: "USD",
              }}
              value={price}
              className="text-4xl font-medium"
            />
            <p className="-mt-2 text-xs text-muted-foreground">Per month</p>
          </>
        ) : (
          <h1 className="text-4xl font-medium">{price}</h1>
        )}
      </div>

      <div className="flex-1 space-y-2 z-10">
        <h3 className="text-sm font-medium">{tier.description || tier.subtitle}</h3>
        <ul className="space-y-2">
          {tier.features.map((feature, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                isHighlighted ? "text-background" : "text-slate-600"
              )}
            >
              <CheckCircle className="h-4 w-4 text-blue-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant={isHighlighted ? "secondary" : (isPopular ? "default" : "outline")}
        className={cn("w-full z-10", isPopular && "bg-blue-600 hover:bg-blue-700")}
        onClick={onSignupClick}
      >
        Start with {tier.name}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  )
};

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

const SignupModal = ({ isOpen, onClose, onSignupSuccess, onEmailVerified, pendingOnboardingUserName, setShowOnboardingModal, setShowWelcomeModal, setIsNewUser, setOnboardingUserName, selectedCountry, setSelectedCountry, hasProcessedVerification, setHasProcessedVerification, showOTPModal, setShowOTPModal, pendingEmail, setPendingEmail, initialMode = 'signup' }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
    }
  }, [isOpen, initialMode]);
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
            onClose(); // Auto close signup modal when OTP is sent
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
  const location = useLocation();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');

  // Handle Auth Hash Routing
  useEffect(() => {
    if (location.hash === '#login') {
      setAuthMode('login');
      setIsSignupOpen(true);
      window.history.replaceState(null, '', '/');
    } else if (location.hash === '#signup') {
      setAuthMode('signup');
      setIsSignupOpen(true);
      window.history.replaceState(null, '', '/');
    }
  }, [location.hash]);
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
      author: {
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        name: "Daniel Griffin",
        handle: "Marketing Director @ TechCorp",
      },
      text: "This platform has revolutionized our email outreach. We've seen a 300% increase in response rates and saved countless hours of manual work. The AI personalization is incredible!",
    },
    {
      author: {
        avatar: "/testimonials/sarah.png",
        name: "Sarah Smith",
        handle: "Sales Manager @ Global Solutions",
      },
      text: "The AI-powered personalization and automated follow-ups have been game-changers for our sales team. Our conversion rates have doubled since we started using this platform.",
    },
    {
      author: {
        avatar: "/testimonials/michel.png",
        name: "Michael Chen",
        handle: "Founder & CEO @ StartupX",
      },
      text: "As a startup founder, this tool has been invaluable. It's helped us scale our outreach efforts without hiring additional staff. The ROI is absolutely phenomenal.",
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: { monthly: 99, yearly: 79 },
      description: 'Perfect for solo founders',
      features: [
        '1,000 emails per month',
        '1 active sequence',
        'Basic analytics dashboard',
        'Email verification',
        '24/7 email support',
        'No integrations'
      ],
      popular: false,
      highlighted: false
    },
    {
      name: 'Pro',
      price: { monthly: 199, yearly: 159 },
      description: 'Ideal for SaaS founders & small teams',
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
      highlighted: false
    },
    {
      name: 'Power',
      price: { monthly: 399, yearly: 319 },
      description: 'Built for agencies & startups',
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
      highlighted: true
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden">

      {/* Hero */}
      <HeroSection setIsSignupOpen={setIsSignupOpen} />



      {/* ── Interactive Capabilities Pipeline ── */}
      <InteractivePipeline />

      {/* ── The Outrelix Protocol (New Orbital Timeline) ── */}
      <OrbitalTimelineBlock />

      {/* ── How It Works (New ProcessSection) ── */}
      <div id="how-it-works">
        <ProcessSection />
      </div>

      {/* ── Industries We Serve (New IndustryScrapers) ── */}
      <IndustryScrapers />

      {/* ── Customer Stories section removed as requested ── */}

      {/* ── Pricing ── */}
      <section id="pricing" className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.03),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="text-center mb-24">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              Pricing Plans
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
              Simple, <span className="text-indigo-600">Transparent</span> Pricing
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Start free. Scale as you grow. No hidden fees, just pure growth.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <PricingCard
                  tier={plan}
                  onSignupClick={() => setIsSignupOpen(true)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── Final CTA ── */}
      <section className="py-32 relative overflow-hidden bg-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] opacity-40 animate-pulse [animation-delay:2s]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] px-10 py-20 text-white shadow-2xl relative overflow-hidden group"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
            <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay group-hover:bg-blue-600/20 transition-all duration-700"></div>

            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-8 border border-white/10">
              Start Generating Revenue
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
              Your Competitors Are Already<br />Using AI. <span className="text-blue-500">Don't Fall Behind.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
              Join 2,500+ growth-focused teams generating pipeline on autopilot. No credit card required. Up and running in 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <RainbowButton
                onClick={() => setIsSignupOpen(true)}
                className="group px-10 py-5 text-base shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:translate-y-0"
              >
                Start Generating Leads <span className="inline-block group-hover:translate-x-1 transition-transform ml-1">→</span>
              </RainbowButton>
              <button className="px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-xl text-white font-bold rounded-2xl text-base hover:bg-white/10 transition-all border-white/20">
                Book a Private Demo
              </button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 opacity-60">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Cancel Anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <SignupModal
        isOpen={isSignupOpen}
        initialMode={authMode}
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
      <WelcomeModal isOpen={showWelcomeModal} onComplete={handleWelcomeComplete} />
      <OnboardingModal open={showOnboardingModal} userName={onboardingUserName} onClose={handleOnboardingComplete} />
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={pendingEmail}
        onVerificationSuccess={handleOTPVerificationSuccess}
      />
    </div>
  );
};


export default Landing;