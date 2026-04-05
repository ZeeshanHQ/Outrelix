import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Command,
  Unlock,
  FastForward,
  Cpu
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth } from '../../supabase';
import BACKEND_URL from '../../config/backend';

// Helper to get country and timezone
async function getCountryAndTimezone() {
  let country = null;
  let country_name = null;
  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
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

function isLoginCalled(email) {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('loginCalled:' + email) === 'true';
}

function setLoginCalled(email) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('loginCalled:' + email, 'true');
}

const EliteSignupModal = ({ 
  isOpen, 
  onClose, 
  onSignupSuccess, 
  pendingOnboardingUserName, 
  setShowOnboardingModal, 
  setShowWelcomeModal, 
  setIsNewUser, 
  setOnboardingUserName, 
  selectedCountry, 
  setSelectedCountry, 
  hasProcessedVerification, 
  setHasProcessedVerification, 
  showOTPModal, 
  setShowOTPModal, 
  pendingEmail, 
  setPendingEmail, 
  initialMode = 'signup' 
}) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
    }
  }, [isOpen, initialMode]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await auth.signInWithGoogle({ redirectTo: window.location.origin + '/dashboard' });
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await auth.signIn(email, password);
        localStorage.setItem('isNewUser', 'false');
        
        if (!result.user.emailVerified) {
          toast.warning('Please verify your email address before signing in.');
          return;
        }

        const userName = result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : '');
        const userEmail = result.user.email;

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({
          name: userName,
          displayName: userName,
          email: userEmail,
          photoURL: null,
          provider: 'email'
        }));

        toast.success('Access Granted. Welcome back.');
        onClose();
        onSignupSuccess(userName, userEmail);

        const { country: detectedCountry, country_name: detectedCountryName, timezone } = await getCountryAndTimezone();
        const finalCountry = (selectedCountry || detectedCountry || 'PK').toUpperCase();
        
        await fetch(`${BACKEND_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: userEmail,
            name: userName,
            country: finalCountry,
            country_name: detectedCountryName || 'Unknown',
            timezone: timezone || 'UTC'
          })
        });
      } else {
        // Signup logic
        result = await auth.signUp(email, password);
        setIsNewUser(true);
        setPendingEmail(email);
        setShowOTPModal(true);
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-2xl"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl grid md:grid-cols-2 rounded-[3.5rem] bg-obsidian-900 border border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        >
          {/* Left Side: Technical Info */}
          <div className="hidden md:flex flex-col justify-between p-16 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8">
                <Unlock className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-[10px] font-black text-blue-400/60 tracking-[0.4em] uppercase mb-4 block">PROTOCOL ACCESS v2.4</span>
              <h2 className="text-4xl font-black text-white tracking-tighter leading-[0.9] uppercase italic mb-8">
                SECURE <br/>
                <span className="text-white/20 not-italic">INFRASTRUCTURE.</span>
              </h2>
              <p className="text-sm text-white/40 leading-relaxed font-medium mb-12">
                Gain entry to the most advanced AI-driven outbound automation environment in the industry.
              </p>

              <div className="space-y-6">
                {[
                  { icon: FastForward, label: "Neural Transmission" },
                  { icon: Cpu, label: "Core Processing" },
                  { icon: ShieldCheck, label: "Identity Protocols" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-[11px] font-black text-white/30 tracking-widest uppercase">
                    <item.icon className="w-4 h-4 text-blue-400/40" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-12 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">SYTEM STATUS: OPERATIONAL</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-10 md:p-16 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-12">
              <div className="flex gap-4">
                <button
                  onClick={() => setIsLogin(false)}
                  className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${!isLogin ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  INITIALIZE
                </button>
                <div className="w-[1px] h-3 bg-white/10" />
                <button
                  onClick={() => setIsLogin(true)}
                  className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${isLogin ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                >
                  RESUME
                </button>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-5 h-5 text-white/20" />
              </button>
            </div>

            <form onSubmit={handleEmailPasswordAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">TRANSMISSION ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                  placeholder="name@domain.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 tracking-widest uppercase ml-1">ACCESS CODE</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 px-8 bg-white text-obsidian-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group"
              >
                {loading ? "AUTHENTICATING..." : isLogin ? "AUTHORIZE ENTRY" : "PROVISION ACCOUNT"}
                {!loading && <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-12">
              <div className="relative mb-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-obsidian-900 px-4 text-[9px] font-black text-white/10 tracking-[0.4em] uppercase">FEDERATED UPLINK</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full py-5 px-8 bg-white/5 border border-white/5 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Command className="w-4 h-4 text-blue-400" />
                Connect via Google Authority
              </button>
            </div>
            
            <p className="mt-12 text-[9px] font-bold text-white/20 text-center leading-relaxed tracking-widest uppercase">
              By accessing this node, you agree to our <br/>
              <span className="text-white/40 cursor-pointer hover:text-blue-400 transition-colors underline decoration-white/5">Protocol Terms</span> and <span className="text-white/40 cursor-pointer hover:text-blue-400 transition-colors underline decoration-white/5">Encryption Privacy</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EliteSignupModal;
