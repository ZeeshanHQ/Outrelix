import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  ArrowRight, 
  Target, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  TrendingUp,
  Building2,
  ChevronRight,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Onboarding configuration
const onboardingSteps = [
  {
    title: 'COMPANY IDENTITY',
    subtitle: 'Define the origin of your outreach nodes.',
    key: 'company_name',
    type: 'input',
    placeholder: 'NODE_NAME_OR_COMPANY',
    icon: Building2
  },
  {
    title: 'OPERATIONAL CAPACITY',
    subtitle: 'Determine the scale of your outreach hive.',
    options: ['Individual', 'Small Team', 'Agency'],
    key: 'userType',
    type: 'button',
    icon: Users
  },
  {
    title: 'CORE OPERATIVE ROLE',
    subtitle: 'Assign your status within the protocol.',
    options: ['Founder', 'Salesperson', 'Marketer', 'Other'],
    key: 'role',
    type: 'button',
    icon: ShieldCheck
  },
  {
    title: 'STRATEGIC OBJECTIVE',
    subtitle: 'Define the mission parameters.',
    options: ['Book more demos', 'Automate outreach', 'Replace SDRs', 'Try AI Sales', 'Other'],
    key: 'goals',
    type: 'button',
    icon: Target
  },
  {
    title: 'SECTOR ALIGNMENT',
    subtitle: 'Select the industrial grid to infiltrate.',
    options: ['SaaS', 'Real Estate', 'Finance', 'Legal', 'Consulting', 'Other'],
    key: 'industry',
    type: 'dropdown',
    icon: Database
  },
  {
    title: 'HIVE SCALE',
    subtitle: 'Identify the magnitude of your organization.',
    options: ['1-10', '11-50', '51-200', '201-500', '500+'],
    key: 'company_size',
    type: 'button',
    icon: TrendingUp
  },
];

const OnboardingModal = ({ open, onClose, userName }) => {
  // Start at step 1 to bypass redundant welcome (handled by WelcomeModal)
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  if (!open) return null;

  const currentStepData = onboardingSteps[step - 1];
  const isLast = (step === onboardingSteps.length);
  const progress = (step / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (isLast) {
      onClose(answers);
    } else {
      setStep(step + 1);
      setSelectedOption(null);
    }
  };

  const Icon = currentStepData?.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-obsidian-950/95 backdrop-blur-3xl px-4"
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative flex flex-col w-full max-w-2xl bg-obsidian-900 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden"
        >
          {/* Progress Bar - Elite Style */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "circOut" }}
            />
          </div>

          <div className="px-12 pt-16 pb-12 flex flex-col h-full">
            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-10">
               <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 tracking-[0.2em]">
                 STEP 0{step} / 06
               </div>
               <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Personalization Protocol</div>
            </div>

            {/* Question Header */}
            <div className="flex items-start gap-8 mb-12">
               <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  {Icon && <Icon className="w-8 h-8 text-white/40" />}
               </div>
               <div>
                 <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-none italic">
                   {currentStepData.title}
                 </h2>
                 <p className="text-lg text-white/40 font-medium max-w-md leading-relaxed italic border-l border-white/10 pl-6">
                   {currentStepData.subtitle}
                 </p>
               </div>
            </div>

            {/* Input Areas */}
            <div className="flex-1 mb-12">
              {currentStepData.type === 'input' && (
                <div className="relative group">
                  <input
                    type="text"
                    value={answers[currentStepData.key] || ''}
                    onChange={e => setAnswers({ ...answers, [currentStepData.key]: e.target.value })}
                    placeholder={currentStepData.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-xl font-bold text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              {currentStepData.type === 'button' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentStepData.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedOption(opt);
                        setAnswers({ ...answers, [currentStepData.key]: opt });
                      }}
                      className={`
                        px-8 py-5 rounded-2xl border text-xs font-black tracking-widest uppercase transition-all duration-500 flex items-center justify-between
                        ${(selectedOption === opt || answers[currentStepData.key] === opt)
                          ? 'bg-white text-obsidian-950 border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]'
                          : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:bg-white/10'
                        }
                      `}
                    >
                      {opt}
                      {(selectedOption === opt || answers[currentStepData.key] === opt) && <CheckCircle className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}

              {currentStepData.type === 'dropdown' && (
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-500 cursor-pointer"
                    value={answers[currentStepData.key] || ''}
                    onChange={e => setAnswers({ ...answers, [currentStepData.key]: e.target.value })}
                  >
                    <option value="" disabled className="bg-obsidian-900">Select Sector</option>
                    {currentStepData.options.map(opt => (
                      <option key={opt} value={opt} className="bg-obsidian-900">{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-5 h-5 text-white/20 rotate-90" />
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between mt-auto">
               <button 
                 onClick={() => setStep(Math.max(1, step - 1))}
                 disabled={step === 1}
                 className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-white/20 hover:text-white'}`}
               >
                 Previous Phase
               </button>

               <motion.button
                 onClick={handleNext}
                 disabled={!answers[currentStepData.key]}
                 className="group relative px-10 py-5 bg-white text-obsidian-950 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase flex items-center gap-4 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all duration-500"
                 whileTap={{ scale: 0.98 }}
               >
                 {isLast ? 'Complete Initialization' : 'Advance Sequence'}
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </motion.button>
            </div>
          </div>

          {/* Technical Status Bar */}
          <div className="w-full px-12 py-5 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
              Processing Personalization Matrix
            </p>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
              V.1.0 // ONBOARDING_SEQ
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal; 