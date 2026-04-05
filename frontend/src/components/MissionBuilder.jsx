import React, { useState, useEffect, useRef } from 'react';
import BACKEND_URL from '../config/backend';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    SparklesIcon,
    CheckCircleIcon,
    DocumentArrowUpIcon,
    PencilSquareIcon,
    RocketLaunchIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    CheckIcon,
    CpuChipIcon,
    MicrophoneIcon,
} from '@heroicons/react/24/outline';
import {
    Rocket,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Mic2,
    StopCircle,
    Wand2,
    CheckCircle,
    Search,
    Globe,
    ShieldCheck
} from 'lucide-react';
import { aiApi } from '../utils/supabaseHelpers';
import { toast } from 'react-toastify';

const industries = [
    'Technology', 'Marketing', 'E-commerce', 'Real Estate', 'Education',
    'Healthcare', 'Finance', 'Manufacturing', 'Legal', 'Consulting'
];

const PremiumStyles = () => (
    <style>{`
        @keyframes holographic-glow {
            0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(59, 130, 246, 0.2); }
            50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6), inset 0 0 20px rgba(99, 102, 241, 0.3); }
            100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 10px rgba(59, 130, 246, 0.2); }
        }
        .animate-holographic {
            animation: holographic-glow 3s infinite ease-in-out;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .animate-float {
            animation: float 4s infinite ease-in-out;
        }
        .animate-spin-slow {
            animation: spin 8s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `}</style>
);

const MissionBuilder = ({
    open,
    onClose,
    onStart,
    isLoading,
    formError,
    setFormError,
    isGmailConnected,
    initialData = null // New prop for edit mode
}) => {
    const [step, setStep] = useState(1);
    const [campaignGoal, setCampaignGoal] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('Technology');

    const [inputMethod, setInputMethod] = useState(''); // 'csv' or 'manual'
    const [csvFile, setCsvFile] = useState(null);
    const [manualEmails, setManualEmails] = useState('');
    const [validEmails, setValidEmails] = useState([]);

    // AI Lead Engine State
    const [aiRole, setAiRole] = useState('');
    const [aiLocation, setAiLocation] = useState('');
    const [aiCompanySize, setAiCompanySize] = useState('11-50');

    // Elite Scheduling State
    const [schedulingMode, setSchedulingMode] = useState('intelligence'); // 'intelligence' or 'manual'
    const [customTiming, setCustomTiming] = useState({ start: '08:00', end: '20:00' });

    // UI States for Voice/AI
    const [isListening, setIsListening] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const recognitionRef = useRef(null);

    const emailRegex = /^[^@\s]+@[@\s]+\.[^@\s]+$/;

    // Reset state when modal opens or initialData changes
    useEffect(() => {
        if (open) {
            setStep(1);
            if (initialData) {
                setCampaignGoal(initialData.goal || initialData.description || '');
                setCampaignName(initialData.name || '');
                setSelectedIndustry(initialData.industry || 'Technology');
                setInputMethod(initialData.emailSource || 'manual');
                // For edit mode, we might not have the full email list or files readily available
                // but we can pre-fill what we have.
            } else {
                setCampaignGoal('');
                setCampaignName('');
                setSelectedIndustry('Technology');
                setCsvFile(null);
                setValidEmails([]);
                setInputMethod('');
                setSchedulingMode('intelligence');
                setCustomTiming({ start: '08:00', end: '20:00' });
            }
            if (setFormError) setFormError('');
        }
    }, [open, initialData, setFormError]);

    // Auto-generate a sleek campaign name if they don't provide one
    useEffect(() => {
        if (campaignGoal && !campaignName) {
            const words = campaignGoal.split(' ').slice(0, 3).join(' ');
            setCampaignName(`Op: ${words.charAt(0).toUpperCase() + words.slice(1)}...`);
        }
    }, [campaignGoal]);

    const handleManualEmailsChange = (e) => {
        const value = e.target.value;
        setManualEmails(value);

        if (!value.trim()) {
            setValidEmails([]);
            return;
        }

        const emails = value
            .split(/[ ,;\n\t]+/)
            .map(e => e.trim())
            .filter(e => e.length > 0 && emailRegex.test(e));

        setValidEmails(emails);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (setFormError) setFormError("");

        if (file) {
            if (file.name.split('.').pop().toLowerCase() !== 'csv') {
                if (setFormError) setFormError('Please upload a valid CSV file.');
                setCsvFile(null);
                return;
            }
            setCsvFile(file);
        }
    };

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Voice recognition is not supported in your browser.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            if (recognitionRef.current) {
                recognitionRef.current.onend = null; // Prevent auto-restart loop
                recognitionRef.current.stop();
            }
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // We use a local variable to keep track of the text captured BEFORE the current session
        let accumulatedText = campaignGoal ? (campaignGoal.endsWith(' ') ? campaignGoal : campaignGoal + ' ') : '';

        recognition.onstart = () => {
            setIsListening(true);
            console.log('[AI Voice] Continuous session active...');
        };

        recognition.onresult = (event) => {
            let sessionTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
                sessionTranscript += event.results[i][0].transcript;
            }
            // Update UI with what we had before this session + what we are hearing now
            setCampaignGoal(accumulatedText + sessionTranscript);
        };

        recognition.onerror = (event) => {
            console.error('[AI Voice] Error:', event.error);
            if (event.error === 'not-allowed') {
                toast.error('Microphone access denied.');
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            if (isListening && recognitionRef.current) {
                // Before starting a new session, "lock in" what we just heard
                setCampaignGoal(prev => {
                    accumulatedText = prev.endsWith(' ') ? prev : prev + ' ';
                    return prev;
                });

                setTimeout(() => {
                    if (isListening) {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.error('[AI Voice] Restart failed:', e);
                        }
                    }
                }, 200);
            } else {
                setIsListening(false);
                recognitionRef.current = null;
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error('[AI Voice] Start failed:', e);
            setIsListening(false);
        }
    };

    const handleRefineGoal = async () => {
        if (!campaignGoal.trim()) {
            toast.warn('Tell me your rough mission idea first!');
            return;
        }

        setIsRefining(true);
        const originalText = campaignGoal;

        try {
            // Using the SAME Intelligence as the Lead Generation section
            const strategistPrompt = `You are a World-Class Campaign Strategist and Lead Generation Architect. 
            Transform this rough mission objective into an elite, high-converting outreach goal. 
            Focus on clarity, professional tone, and clear business intent.
            
            Original Goal: "${originalText}"
            
            Return ONLY the polished, refined objective (max 25-30 words). Do not include any meta-talk or intro/outro.`;

            const refined = await aiApi.complete([
                { role: 'system', content: 'You are an elite business campaign strategist.' },
                { role: 'user', content: strategistPrompt }
            ], {
                model: 'google/gemini-pro', // Using a premium model via the Edge Function
                temperature: 0.7
            });

            if (refined && refined.trim() !== originalText) {
                toast.success('Strategy Refined by AI');

                // Magical Typing Effect
                setCampaignGoal('');
                const text = refined.trim().replace(/^"|"$/g, '');
                let charIndex = 0;
                const typingSpeed = text.length > 100 ? 5 : 15;

                const interval = setInterval(() => {
                    setCampaignGoal(text.slice(0, charIndex + 1));
                    charIndex++;
                    if (charIndex >= text.length) clearInterval(interval);
                }, typingSpeed);
            } else {
                toast.info('Your mission is already perfectly optimized!');
            }
        } catch (error) {
            console.error('Refinement error:', error);
            toast.error(error.message || 'The AI Stratigist is currently occupied. Try again in 10s.');
            setCampaignGoal(originalText); // Restore if failed
        } finally {
            setIsRefining(false);
        }
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!campaignGoal.trim()) {
                if (setFormError) setFormError('Please describe your mission objective.');
                return false;
            }
            return true;
        }
        if (currentStep === 2) {
            if (!inputMethod) {
                if (setFormError) setFormError('Please select an audience input method.');
                return false;
            }
            if (inputMethod === 'csv' && !csvFile) {
                if (setFormError) setFormError('Please upload a CSV file.');
                return false;
            }
            if (inputMethod === 'manual' && validEmails.length === 0) {
                if (setFormError) setFormError('Please enter at least one valid email address.');
                return false;
            }
            if (inputMethod === 'ai' && (!aiRole.trim() || !aiLocation.trim())) {
                if (setFormError) setFormError('Please provide both a Target Role and Location for the AI Engine.');
                return false;
            }
            return true;
        }
        return true;
    };

    const handleNext = () => {
        if (setFormError) setFormError("");
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (setFormError) setFormError("");
        setStep(step - 1);
    };

    const handleLaunch = () => {
        if (validateStep(2)) { // Final check
            onStart && onStart({
                id: initialData?.id, // Pass ID for editing
                campaignName: campaignName || 'Alpha Node Outreach',
                campaignGoal,
                emails: inputMethod === 'manual' ? validEmails : [],
                industry: selectedIndustry,
                emailSource: inputMethod,
                template: 'Intelligence Alpha',
                aiLeadParams: inputMethod === 'ai' ? {
                    role: aiRole,
                    location: aiLocation,
                    companySize: aiCompanySize
                } : null,
                scheduling: {
                    mode: schedulingMode,
                    timing: customTiming
                }
            });
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] font-poppins flex items-center justify-center">
            <PremiumStyles />
            {/* Immersive Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Abstract Glow Background inside modal */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-800/60 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SparklesIcon className="w-5 h-5 text-blue-400" />
                            <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Mission Builder</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {step === 1 ? 'Define Objective' : step === 2 ? 'Acquire Targets' : 'Pre-Flight Check'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all focus:outline-none"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Tracker */}
                <div className="flex items-center px-6 md:px-8 py-4 bg-slate-900/50 border-b border-slate-800/60 relative z-10 overflow-x-auto no-scrollbar">
                    {[
                        { num: 1, label: 'Objective' },
                        { num: 2, label: 'Audience' },
                        { num: 3, label: 'Launch' }
                    ].map((s, idx) => (
                        <React.Fragment key={s.num}>
                            <div className={`flex items-center gap-3 ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-500 ${step > s.num ? 'bg-blue-600 border-blue-600 text-white' : step === s.num ? 'border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 text-slate-500'}`}>
                                    {step > s.num ? <CheckIcon className="w-4 h-4" /> : s.num}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < 2 && (
                                <div className={`flex-1 min-w-[30px] h-px mx-4 ${step > s.num ? 'bg-blue-600/50' : 'bg-slate-800'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {/* STEP 1: OBJECTIVE */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto space-y-8"
                            >
                                {formError && (
                                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                                        {formError}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                                        1. The Goal (AI Copilot)
                                    </label>
                                    <p className="text-slate-300 text-sm mb-4">
                                        Speak naturally. Tell Outrelix Intelligence what you want to achieve, and we'll craft the perfect sequence.
                                    </p>
                                    <div className="relative group">
                                        <div className={`absolute inset-0 bg-blue-500/5 rounded-2xl transition-opacity duration-500 ${isListening ? 'opacity-100' : 'opacity-0'}`} />

                                        <textarea
                                            value={campaignGoal}
                                            onChange={e => setCampaignGoal(e.target.value)}
                                            placeholder={isListening ? "" : (campaignGoal ? "" : "Describe your mission... (e.g., Target CEOs for a SaaS growth partnership)")}
                                            className={`w-full h-48 bg-slate-900/80 backdrop-blur-sm border rounded-3xl p-6 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none shadow-[inner_0_2px_10px_rgba(0,0,0,0.5)] pr-16 custom-scrollbar ${isRefining ? 'animate-pulse border-indigo-500/50' : 'border-slate-800/80'}`}
                                        />

                                        {/* Holographic Controls Container */}
                                        <div className="absolute right-4 bottom-4 flex flex-col items-center gap-3">
                                            {/* AI Orb (Voice) */}
                                            <div className="relative">
                                                <AnimatePresence>
                                                    {isListening && (
                                                        <>
                                                            <motion.div
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1.5, opacity: 0.3 }}
                                                                exit={{ scale: 0.8, opacity: 0 }}
                                                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                                                className="absolute inset-0 bg-blue-400 rounded-full blur-xl"
                                                            />
                                                            <motion.div
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 2, opacity: 0.1 }}
                                                                exit={{ scale: 0.8, opacity: 0 }}
                                                                transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                                                                className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl"
                                                            />
                                                        </>
                                                    )}
                                                </AnimatePresence>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleVoiceInput}
                                                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-[0_0_25px_rgba(37,99,235,0.6)] border-white/20' : 'bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white'}`}
                                                >
                                                    {isListening ? (
                                                        <StopCircle className="w-5 h-5 text-white" />
                                                    ) : (
                                                        <Mic2 className="w-5 h-5" />
                                                    )}
                                                </motion.button>
                                            </div>

                                            {/* AI Refiner (Sparkles) */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleRefineGoal}
                                                disabled={isRefining || !campaignGoal.trim()}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border ${isRefining ? 'bg-indigo-600 border-indigo-400 text-white animate-spin-slow' : 'bg-slate-800 border-slate-700 text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/50 shadow-inner'} disabled:opacity-30 disabled:grayscale`}
                                            >
                                                {isRefining ? (
                                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                                ) : (
                                                    <Wand2 className="w-5 h-5" />
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* Listening Waveform Overlay */}
                                        <AnimatePresence>
                                            {isListening && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute inset-x-6 top-6 flex items-center gap-3 pointer-events-none"
                                                >
                                                    <div className="flex gap-1 h-4 items-center">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <motion.div
                                                                key={i}
                                                                animate={{ height: [4, 16, 8, 20, 4] }}
                                                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                                                className="w-1 bg-blue-500 rounded-full"
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] animate-pulse">
                                                        AI Engine Sourcing Intent...
                                                    </span>
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                        <span className="text-[9px] font-black text-blue-400 uppercase">Live</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            Campaign Alias
                                        </label>
                                        <input
                                            type="text"
                                            value={campaignName}
                                            onChange={e => setCampaignName(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            Target Sector
                                        </label>
                                        <select
                                            value={selectedIndustry}
                                            onChange={e => setSelectedIndustry(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                        >
                                            {industries.map(ind => (
                                                <option key={ind} value={ind}>{ind}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: AUDIENCE */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto space-y-8"
                            >
                                {formError && (
                                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                                        {formError}
                                    </div>
                                )}

                                <div className="text-center space-y-2 mb-8">
                                    <h3 className="text-xl font-bold text-white">How are we acquiring targets?</h3>
                                    <p className="text-slate-400 text-sm">Upload a dataset or input targets manually.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* AI Option (Hero) */}
                                    <button
                                        onClick={() => setInputMethod('ai')}
                                        className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-4 text-center group overflow-hidden ${inputMethod === 'ai' ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                                        <div className={`relative p-4 rounded-full ${inputMethod === 'ai' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all'}`}>
                                            <CpuChipIcon className="w-8 h-8" />
                                        </div>
                                        <div className="relative z-10">
                                            <span className="block font-black text-white mb-1">AI Lead Engine</span>
                                            <span className="text-xs text-slate-500">Autonomous target sourcing</span>
                                        </div>
                                        {inputMethod === 'ai' && <div className="absolute top-4 right-4 text-indigo-500"><CheckCircleIcon className="w-6 h-6" /></div>}
                                    </button>

                                    {/* CSV Option */}
                                    <button
                                        onClick={() => setInputMethod('csv')}
                                        className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-4 text-center group ${inputMethod === 'csv' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'}`}
                                    >
                                        <div className={`p-4 rounded-full ${inputMethod === 'csv' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                                            <DocumentArrowUpIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-white mb-1">Upload CSV</span>
                                            <span className="text-xs text-slate-500">Bulk import parsed leads</span>
                                        </div>
                                        {inputMethod === 'csv' && <div className="absolute top-4 right-4 text-blue-500"><CheckCircleIcon className="w-6 h-6" /></div>}
                                    </button>

                                    {/* Manual Option */}
                                    <button
                                        onClick={() => setInputMethod('manual')}
                                        className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-4 text-center group ${inputMethod === 'manual' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'}`}
                                    >
                                        <div className={`p-4 rounded-full ${inputMethod === 'manual' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                                            <PencilSquareIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-white mb-1">Manual Input</span>
                                            <span className="text-xs text-slate-500">Paste or type emails</span>
                                        </div>
                                        {inputMethod === 'manual' && <div className="absolute top-4 right-4 text-blue-500"><CheckCircleIcon className="w-6 h-6" /></div>}
                                    </button>
                                </div>

                                {/* Conditional Inputs based on selection */}
                                <AnimatePresence mode="popLayout">
                                    {inputMethod === 'ai' && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-8 border-t border-slate-800">
                                            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                                                <div className="flex items-center gap-2 mb-6">
                                                    <Search className="w-5 h-5 text-indigo-400" />
                                                    <h4 className="text-sm font-black text-indigo-300 uppercase tracking-widest">Define Target Persona</h4>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Location</label>
                                                        <input
                                                            type="text"
                                                            value={aiLocation}
                                                            onChange={e => setAiLocation(e.target.value)}
                                                            placeholder="e.g. San Francisco, California"
                                                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-400">Target Role / Title</label>
                                                        <input
                                                            type="text"
                                                            value={aiRole}
                                                            onChange={e => setAiRole(e.target.value)}
                                                            placeholder="e.g. VP of Marketing, CEO"
                                                            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-xs font-bold text-slate-400">Target Company Size</label>
                                                        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/80 w-full overflow-x-auto no-scrollbar">
                                                            {['1-10', '11-50', '51-200', '201-500', '500+'].map(size => (
                                                                <button
                                                                    key={size}
                                                                    onClick={() => setAiCompanySize(size)}
                                                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${aiCompanySize === size ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                                                >
                                                                    {size}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {inputMethod === 'csv' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-slate-800">
                                            <label className="relative flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500 transition-all cursor-pointer group">
                                                <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                                                {csvFile ? (
                                                    <div className="flex flex-col items-center text-emerald-400">
                                                        <CheckCircleIcon className="w-8 h-8 mb-2" />
                                                        <span className="font-bold text-sm truncate max-w-[200px]">{csvFile.name}</span>
                                                        <span className="text-[10px] uppercase tracking-widest mt-1 opacity-70">Click to replace</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-500 group-hover:text-blue-400 transition-colors">
                                                        <DocumentArrowUpIcon className="w-8 h-8 mb-2" />
                                                        <span className="font-bold text-sm">Select CSV File</span>
                                                        <span className="text-[10px] uppercase tracking-widest mt-1 opacity-70">Max size 5MB</span>
                                                    </div>
                                                )}
                                            </label>
                                        </motion.div>
                                    )}

                                    {inputMethod === 'manual' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-slate-800 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Emails</label>
                                                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">{validEmails.length} Valid</span>
                                            </div>
                                            <textarea
                                                value={manualEmails}
                                                onChange={handleManualEmailsChange}
                                                placeholder="Paste emails here (separated by commas or lines)..."
                                                className="w-full h-40 bg-slate-900 border border-slate-700/50 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm resize-none shadow-inner"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* STEP 3: PRE-FLIGHT CHECK */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-3xl mx-auto"
                            >
                                {formError && (
                                    <div className="p-3 mb-6 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
                                        {formError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left: Mission Briefing */}
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mission Briefing</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Alias</p>
                                                    <p className="text-white font-mono font-bold">{campaignName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Sector</p>
                                                    <p className="text-blue-400 font-bold">{selectedIndustry}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Primary Objective</p>
                                                    <p className="text-slate-300 text-sm italic border-l-2 border-slate-700 pl-3">" {campaignGoal} "</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Target Audience</p>
                                                    <p className="text-white font-bold inline-flex items-center gap-2">
                                                        {inputMethod === 'ai' ? (
                                                            <><CpuChipIcon className="w-4 h-4 text-indigo-400" /> AI Hunting: {aiRole}s in {aiLocation}</>
                                                        ) : inputMethod === 'csv' ? (
                                                            <><DocumentArrowUpIcon className="w-4 h-4 text-emerald-400" /> {csvFile?.name}</>
                                                        ) : (
                                                            <><PencilSquareIcon className="w-4 h-4 text-emerald-400" /> {validEmails.length} Email(s) Loaded</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30 flex gap-4 items-center">
                                            <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-indigo-300 text-sm font-bold">Launch Intelligence</p>
                                                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                                                        <button
                                                            onClick={() => setSchedulingMode('intelligence')}
                                                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${schedulingMode === 'intelligence' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                                        >
                                                            AI Managed
                                                        </button>
                                                        <button
                                                            onClick={() => setSchedulingMode('manual')}
                                                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${schedulingMode === 'manual' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                                        >
                                                            Manual
                                                        </button>
                                                    </div>
                                                </div>
                                                {schedulingMode === 'intelligence' ? (
                                                    <p className="text-indigo-400/60 text-[10px] leading-relaxed">
                                                        Outrelix will analyze historical engagement gaps and dynamically pace your sequence for maximum clinical precision.
                                                    </p>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <p className="text-[9px] text-slate-500 uppercase mb-1">Window Start</p>
                                                            <input
                                                                type="time"
                                                                value={customTiming.start}
                                                                onChange={(e) => setCustomTiming(prev => ({ ...prev, start: e.target.value }))}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[9px] text-slate-500 uppercase mb-1">Window End</p>
                                                            <input
                                                                type="time"
                                                                value={customTiming.end}
                                                                onChange={(e) => setCustomTiming(prev => ({ ...prev, end: e.target.value }))}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Launch Area */}
                                    <div className="flex flex-col justify-center items-center p-8 bg-slate-900/50 rounded-2xl border border-slate-800">
                                        <div className="text-center space-y-2 mb-8">
                                            <h3 className="text-2xl font-black text-white">System Ready</h3>
                                            <p className="text-slate-400 text-sm">Awaiting commander authorization.</p>
                                        </div>

                                        {/* Progress Circle (Decorative) */}
                                        <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="8" />
                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="283" strokeDashoffset={isLoading ? "0" : "283"} className="transition-all ease-out" style={{ transitionDuration: '3000ms' }} />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-3xl font-black text-white">100<span className="text-lg text-slate-500">%</span></span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Health Score</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleLaunch}
                                            disabled={isLoading}
                                            className="w-full relative group overflow-hidden rounded-2xl p-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                            <div className="relative flex items-center justify-center gap-3">
                                                {isLoading ? (
                                                    <>
                                                        <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                                        </svg>
                                                        <span className="font-black text-white text-lg tracking-widest uppercase">Initiating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <RocketLaunchIcon className="w-6 h-6 text-white" />
                                                        <span className="font-black text-white text-lg tracking-widest uppercase">Launch Sequence</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4">Powered by Outrelix Intelligence 2026</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer actions */}
                <div className="p-6 border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-md flex items-center justify-between relative z-10">
                    <div>
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-700 text-slate-400 font-bold text-sm hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50"
                            >
                                <ChevronLeftIcon className="w-4 h-4" /> Back
                            </button>
                        )}
                    </div>

                    <div>
                        {step < 3 && (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-slate-900 font-black text-sm uppercase tracking-wider hover:bg-slate-200 transition-all shadow-lg shadow-white/10"
                            >
                                Next Phase <ChevronRightIcon className="w-4 h-4 stroke-2" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MissionBuilder;
