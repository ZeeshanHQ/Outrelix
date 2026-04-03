import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SparklesIcon,
    UserGroupIcon,
    RocketLaunchIcon,
    FireIcon,
    XMarkIcon,
    ArrowRightIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const ConciergeOnboarding = ({ isOpen, onClose, onFinish }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        favoriteClient: '',
        problemSolved: '',
        trigger: ''
    });

    const steps = [
        {
            id: 1,
            title: "Who is your favorite existing client?",
            description: "We'll find lookalikes automatically using our sector-matching engine.",
            placeholder: "e.g. Acme Corp (SaaS)",
            icon: UserGroupIcon,
            field: 'favoriteClient'
        },
        {
            id: 2,
            title: "What is the #1 problem you solve?",
            description: "We'll identify industries currently feeling this specific pain point.",
            placeholder: "e.g. High customer churn in retail",
            icon: FireIcon,
            field: 'problemSolved'
        },
        {
            id: 3,
            title: "What's a 'Trigger' for you?",
            description: "When do you want to talk to a lead? (e.g. New hiring, recent funding)",
            placeholder: "e.g. Companies that just hired a new CMO",
            icon: RocketLaunchIcon,
            field: 'trigger'
        }
    ];

    const currentStep = steps[step - 1];

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            onFinish(data);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 0.85, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 origin-center"
            >
                <div className="h-2 bg-slate-100 w-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-10 lg:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 text-blue-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-blue-100">
                            <SparklesIcon className="h-4 w-4" />
                            Concierge Onboarding
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors group">
                            <XMarkIcon className="h-6 w-6 text-slate-400 group-hover:text-slate-600" />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-2xl shrink-0">
                                        <currentStep.icon className="h-8 w-8 text-slate-800" />
                                    </div>
                                    <h2 className="text-[32px] font-black text-slate-800 tracking-tight leading-tight">{currentStep.title}</h2>
                                </div>
                                <p className="text-slate-500 font-bold leading-relaxed">{currentStep.description}</p>
                            </div>

                            <div className="relative group pt-4">
                                <input
                                    autoFocus
                                    type="text"
                                    value={data[currentStep.field]}
                                    onChange={(e) => setData({ ...data, [currentStep.field]: e.target.value })}
                                    placeholder={currentStep.placeholder}
                                    className="w-full bg-white border-2 border-blue-500 rounded-3xl pl-8 pr-20 py-6 text-2xl font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                />
                                <button
                                    onClick={handleNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-2 p-4 bg-blue-600 text-white rounded-[1.25rem] shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all"
                                >
                                    <ArrowRightIcon className="h-7 w-7" />
                                </button>
                            </div>

                            <div className="flex gap-2 pt-4">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-blue-600' :
                                            s < step ? 'w-4 bg-blue-200' : 'w-4 bg-slate-100'
                                            }`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center gap-5">
                    <div className="h-12 w-12 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                        <SparklesIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                        Step {step} of 3: <span className="text-slate-600">Building your "Insane" Opportunity Feed</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ConciergeOnboarding;
