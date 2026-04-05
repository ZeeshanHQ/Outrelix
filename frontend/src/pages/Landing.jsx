import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NumberFlow from "@number-flow/react";
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle, Rocket, BarChart3, Clock, Globe, ShieldCheck, Sparkles, PlayCircle, HelpCircle, CreditCard, Settings, Users, Eye, EyeOff } from 'lucide-react';
import BACKEND_URL from '../config/backend';
import { auth, db } from '../supabase';
import OnboardingModal from '../components/OnboardingModal';
import WelcomeModal from '../components/WelcomeModal';
import OTPVerificationModal from '../components/OTPVerificationModal';
// New Elite Components
import EliteSignupModal from '../components/auth/EliteSignupModal';
import ElitePricing from '../components/blocks/ElitePricing';
import EliteFeatures from '../components/blocks/EliteFeatures';

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
import { toast } from 'react-toastify';


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
    <div className="min-h-screen bg-obsidian-950 text-white overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">

      {/* Hero */}
      <HeroSection setIsSignupOpen={setIsSignupOpen} />



      {/* ── Interactive Capabilities Pipeline ── */}
      <div className="py-48 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.02),transparent_70%)]" />
        <InteractivePipeline />
      </div>

      {/* ── The Outrelix Protocol (New Orbital Timeline) ── */}
      <div className="py-48 border-t border-white/5 bg-obsidian-900/20">
        <OrbitalTimelineBlock />
      </div>

      {/* ── How It Works (New ProcessSection) ── */}
      <div id="how-it-works" className="py-48 border-t border-white/5">
        <ProcessSection />
      </div>

      {/* ── Industries We Serve (New IndustryScrapers) ── */}
      <div className="py-48 border-t border-white/5 bg-obsidian-900/20">
        <IndustryScrapers />
      </div>

      {/* ── Customer Stories section removed as requested ── */}

      {/* ── Capabilities HUD ── */}
      <EliteFeatures />

      {/* ── Pricing ── */}
      <ElitePricing onSignupClick={() => setIsSignupOpen(true)} />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── Final CTA ── */}
      <section className="py-48 relative overflow-hidden border-t border-white/5 bg-obsidian-950">
        <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full scale-150 translate-y-1/2 opacity-50" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto p-12 md:p-32 rounded-[5rem] bg-obsidian-800/20 border border-white/5 backdrop-blur-3xl relative group overflow-hidden"
          >
            {/* Animated Glow Border */}
            <div className="absolute inset-[1px] rounded-[5rem] bg-gradient-to-br from-blue-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10">
              <span className="text-label-small mb-8 block text-blue-400/60 uppercase tracking-[0.4em]">INITIATE PROTOCOL — 04</span>
              <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-12 leading-[0.9]">
                Claim Your <br/>
                <span className="text-white/30 italic">Unfair Advantage.</span>
              </h2>
              <p className="text-xl text-white/50 mb-16 max-w-2xl mx-auto leading-relaxed font-medium">
                The window of opportunity for AI-driven dominance is closing. Secure your infrastructure today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <button 
                  onClick={() => setIsSignupOpen(true)}
                  className="group relative px-16 py-6 bg-white text-obsidian-950 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-700 shadow-[0_0_80px_rgba(255,255,255,0.15)] overflow-hidden"
                >
                  <span className="relative z-10">Ascend to Elite</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
                <button className="px-16 py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-xl hover:bg-white/10 transition-all duration-500 backdrop-blur-xl">
                  Private Session
                </button>
              </div>
              
              <div className="mt-20 pt-12 border-t border-white/5 flex flex-wrap items-center justify-center gap-12 text-white/30 font-bold uppercase tracking-[0.2em] text-[10px]">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  NO COMMITMENT REQUIRED
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  INSTANT PROVISIONING
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  SECURE ENCRYPTION
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <EliteSignupModal
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