import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

// Onboarding configuration
const onboardingSteps = [
  {
    title: 'What is your company name?',
    key: 'company_name',
    type: 'input',
  },
  {
    title: 'Are you an individual or a team?',
    options: ['Individual', 'Small Team', 'Agency'],
    key: 'userType',
    type: 'button',
  },
  {
    title: 'What best describes your role?',
    options: ['Founder', 'Salesperson', 'Marketer', 'Other'],
    key: 'role',
    type: 'button',
  },
  {
    title: 'What do you want to achieve with Outrelix?',
    options: ['Book more demos', 'Automate outreach', 'Replace SDRs', 'Try AI Sales', 'Other'],
    key: 'goals',
    type: 'button',
  },
  {
    title: 'What industry are you in?',
    options: ['SaaS', 'Real Estate', 'Finance', 'Legal', 'Consulting', 'Other'],
    key: 'industry',
    type: 'dropdown',
  },
  {
    title: 'What is your company size?',
    options: ['1-10', '11-50', '51-200', '201-500', '500+'],
    key: 'company_size',
    type: 'button',
  },
];

const OnboardingModal = ({ open, onClose, userName }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [otherInput, setOtherInput] = useState("");
  const navigate = useNavigate();

  if (!open) return null;

  // Welcome Modal (step 0)
  if (step === 0 && userName) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-purple-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden"
        >
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Main gradient orbs */}
            <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/15 via-purple-400/10 to-pink-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/12 via-blue-400/8 to-white/0 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-white/8 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '12s', animationDelay: '1s' }}></div>

            {/* Additional gradient orbs for more depth */}
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-bl from-green-400/8 via-blue-400/5 to-purple-400/3 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '15s', animationDelay: '3s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-gradient-to-tr from-pink-400/6 via-purple-400/4 to-blue-400/2 rounded-full blur-xl animate-pulse" style={{ animationDuration: '18s', animationDelay: '1.5s' }}></div>

            {/* Beautiful floating particles - enhanced */}
            <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0s' }}></div>
            <div className="absolute top-40 right-1/3 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-green-400/60 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 right-1/2 w-2.5 h-2.5 bg-blue-300/60 rounded-full animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}></div>

            {/* Additional floating particles */}
            <div className="absolute top-1/3 left-1/6 w-1.5 h-1.5 bg-yellow-400/50 rounded-full animate-bounce" style={{ animationDuration: '6s', animationDelay: '0.8s' }}></div>
            <div className="absolute top-2/3 right-1/6 w-1 h-1 bg-pink-400/50 rounded-full animate-bounce" style={{ animationDuration: '7s', animationDelay: '1.2s' }}></div>
            <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDuration: '5.5s', animationDelay: '0.3s' }}></div>
            <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce" style={{ animationDuration: '4.8s', animationDelay: '1.8s' }}></div>

            {/* Geometric shapes - enhanced */}
            <div className="absolute top-1/4 left-1/3 w-24 h-24 border border-white/10 rounded-full animate-spin" style={{ animationDuration: '30s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 border border-white/10 rotate-45 animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="absolute top-1/2 left-1/6 w-16 h-16 border border-white/8 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
            <div className="absolute bottom-1/2 right-1/6 w-20 h-20 border border-white/8 rotate-12 animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>

            {/* Corner decorative elements */}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-white/10"></div>
            <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-white/10"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-white/10"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-white/10"></div>

            {/* Additional corner accents */}
            <div className="absolute top-10 left-10 w-8 h-8 border-l border-t border-white/5"></div>
            <div className="absolute top-10 right-10 w-8 h-8 border-r border-t border-white/5"></div>
            <div className="absolute bottom-10 left-10 w-8 h-8 border-l border-b border-white/5"></div>
            <div className="absolute bottom-10 right-10 w-8 h-8 border-r border-b border-white/5"></div>

            {/* Floating lines - enhanced */}
            <div className="absolute top-1/2 left-0 w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="absolute top-1/3 right-0 w-24 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent"></div>
            <div className="absolute bottom-1/4 left-1/2 w-40 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent transform -translate-x-20"></div>
            <div className="absolute top-1/4 left-0 w-20 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute bottom-1/3 right-0 w-28 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent"></div>

            {/* Diamond shapes - enhanced */}
            <div className="absolute top-1/3 left-0 w-32 h-32 bg-white/5 rotate-45 transform -translate-x-16"></div>
            <div className="absolute bottom-1/3 right-0 w-24 h-24 bg-white/5 rotate-45 transform translate-x-12"></div>
            <div className="absolute top-1/6 left-1/2 w-16 h-16 bg-white/3 rotate-45 transform -translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-1/6 right-1/2 w-12 h-12 bg-white/3 rotate-45 transform translate-x-6 translate-y-6"></div>

            {/* Subtle wave effects */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent"></div>
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/3 to-transparent"></div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            {/* Additional subtle patterns */}
            <div className="absolute inset-0 opacity-3">
              <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.02) 50%, transparent 60%)`,
                backgroundSize: '100px 100px'
              }}></div>
            </div>

            {/* Sparkle effects */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
            <div className="absolute top-3/4 right-1/4 w-0.5 h-0.5 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1.5s' }}></div>
          </div>

          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 p-0 overflow-visible flex flex-col items-center justify-center min-h-[700px]"
            style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 60%, #a5b4fc 100%)', boxShadow: '0 20px 80px 0 rgba(80,80,180,0.18), 0 2px 12px 0 rgba(80,80,180,0.10)', backdropFilter: 'blur(28px)' }}
          >
            {/* Advanced animated background and Outrelix logo watermark */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* Animated gradient waves */}
              <div className="absolute inset-0 animate-gradient-x" style={{
                background: 'linear-gradient(120deg, #a5b4fc 0%, #818cf8 50%, #c7d2fe 100%)',
                opacity: 0.5,
                filter: 'blur(32px)'
              }}></div>
              {/* Outrelix logo watermark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/outrelix.png" alt="Outrelix Logo" className="w-[420px] h-[420px] opacity-10 select-none" style={{ filter: 'blur(1px)' }} />
              </div>
              {/* Animated orbs and sparkles */}
              <div className="absolute top-10 left-20 w-32 h-32 bg-blue-400/30 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '7s' }}></div>
              <div className="absolute bottom-10 right-24 w-24 h-24 bg-purple-400/30 rounded-full blur-xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '2s' }}></div>
              <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-yellow-200/80 rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
              <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-blue-200/70 rounded-full animate-ping" style={{ animationDuration: '2.2s', animationDelay: '1s' }}></div>
              {/* Animated lines and geometric shapes */}
              <div className="absolute top-1/2 left-1/4 w-40 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-pulse" style={{ animationDuration: '6s' }}></div>
              <div className="absolute bottom-1/3 right-1/4 w-32 h-px bg-gradient-to-l from-transparent via-purple-400/40 to-transparent animate-pulse" style={{ animationDuration: '7s' }}></div>
              <div className="absolute top-1/4 right-1/4 w-16 h-16 border-2 border-blue-200/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
              <div className="absolute bottom-1/4 left-1/3 w-12 h-12 border-2 border-purple-200/20 rotate-45 animate-pulse" style={{ animationDuration: '9s' }}></div>
            </div>
            <div className="flex flex-col items-center justify-start pt-4 md:pt-8 pb-6 md:pb-10 px-4 md:px-16 relative z-10 w-full h-full min-h-[500px]">
              {/* SVG image (smaller, at top) */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-2 md:mb-4"
              >
                <img
                  src="/process.svg"
                  alt="Welcome"
                  className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain drop-shadow-2xl filter brightness-110 contrast-110 mx-auto"
                  style={{ filter: 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.10))' }}
                />
              </motion.div>
              {/* Welcome text and button group moved up */}
              <motion.h2
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -10 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-6xl font-extralight font-poppins text-gray-900 dark:text-white mb-2 md:mb-3 text-center tracking-tight leading-tight"
                style={{ letterSpacing: '-0.03em', fontWeight: 200 }}
              >
                Welcome,{' '}
                <span className="font-light bg-gradient-to-r from-blue-500 via-purple-500 to-blue-700 bg-clip-text text-transparent" style={{ fontWeight: 300 }}>
                  {userName}
                </span>
                !
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -10 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-2xl font-extralight font-poppins text-gray-600 dark:text-gray-300 mb-3 md:mb-5 text-center max-w-2xl leading-relaxed"
                style={{ letterSpacing: '-0.01em', fontWeight: 200, lineHeight: '1.6' }}
              >
                We're excited to have you on board.<br />
                <span className="font-light">Let's personalize your Outrelix experience!</span>
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -10 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                onClick={() => setStep(1)}
                className="group relative px-8 md:px-12 py-3 md:py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold font-poppins text-base md:text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 tracking-tight overflow-hidden mb-4 border-0"
                style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
              >
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Continue
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </motion.button>
              {/* Decorative status row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="mt-2 flex items-center gap-6 text-xs md:text-sm text-gray-500 dark:text-gray-400 font-light"
                style={{ fontWeight: 200 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>AI-Powered</span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Secure</span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>Fast Setup</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Onboarding steps (step 1 and onward)
  if (step > 0 && step <= onboardingSteps.length) {
    const s = onboardingSteps[step - 1];
    const isLast = (step === onboardingSteps.length);
    // Input type (company name)
    if (s.type === 'input') {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-purple-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
          <div className="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 p-0 overflow-visible flex flex-col items-center justify-center min-h-[700px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl">
            <div className="flex flex-col items-center justify-center py-10 md:py-16 px-4 md:px-16 w-full h-full min-h-[500px]">
              <h1 className="text-3xl md:text-4xl font-bold font-poppins text-blue-700 dark:text-blue-400 mb-8 mt-8 text-center tracking-tight drop-shadow-lg">{s.title}</h1>
              <input
                type="text"
                className="px-6 py-4 rounded-xl border font-poppins text-base font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 tracking-tight w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 mb-8"
                placeholder="Enter your company name"
                value={answers.company_name || ''}
                onChange={e => setAnswers({ ...answers, company_name: e.target.value })}
              />
              <button
                onClick={() => setStep(step + 1)}
                disabled={!answers.company_name || !answers.company_name.trim()}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold font-poppins text-base shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 tracking-tight disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Button type (single select)
    if (s.type === 'button') {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-purple-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
          <div className="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 p-0 overflow-visible flex flex-col items-center justify-center min-h-[700px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl">
            <div className="flex flex-col items-center justify-center py-10 md:py-16 px-4 md:px-16 w-full h-full min-h-[500px]">
              <h1 className="text-3xl md:text-4xl font-bold font-poppins text-blue-700 dark:text-blue-400 mb-8 mt-8 text-center tracking-tight drop-shadow-lg">{s.title}</h1>
              <div className="flex flex-wrap gap-4 justify-center w-full max-w-xl mb-8">
                {s.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className={`px-6 py-3 rounded-xl border font-poppins text-base font-medium transition-all duration-200 shadow-md hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 tracking-tight
                        ${selectedOption === opt
                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white border-blue-600 scale-105 shadow-2xl'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
                    style={{ minWidth: '140px' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setAnswers({ ...answers, [s.key]: selectedOption });
                  setSelectedOption(null);
                  if (isLast) {
                    onClose({ ...answers, [s.key]: selectedOption });
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={!selectedOption}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold font-poppins text-base shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 tracking-tight disabled:opacity-50"
              >
                {isLast ? 'Finish' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Dropdown type
    if (s.type === 'dropdown') {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-purple-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 overflow-hidden">
          <div className="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 p-0 overflow-visible flex flex-col items-center justify-center min-h-[700px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl">
            <div className="flex flex-col items-center justify-center py-10 md:py-16 px-4 md:px-16 w-full h-full min-h-[500px]">
              <h1 className="text-3xl md:text-4xl font-bold font-poppins text-blue-700 dark:text-blue-400 mb-8 mt-8 text-center tracking-tight drop-shadow-lg">{s.title}</h1>
              <select
                className="px-6 py-4 rounded-xl border font-poppins text-base font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 tracking-tight w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 mb-8"
                value={answers[s.key] || ''}
                onChange={e => setAnswers({ ...answers, [s.key]: e.target.value })}
              >
                <option value="" disabled>Select an option</option>
                {s.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button
                onClick={() => setStep(step + 1)}
                disabled={!answers[s.key]}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold font-poppins text-base shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 tracking-tight disabled:opacity-50"
              >
                {isLast ? 'Finish' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
};

export default OnboardingModal; 