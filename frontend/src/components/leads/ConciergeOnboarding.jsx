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
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
                <div className="h-2 bg-slate-100 w-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            <SparklesIcon className="h-3 w-3" />
                            Concierge Onboarding
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <XMarkIcon className="h-5 w-5 text-slate-400" />
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
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <currentStep.icon className="h-6 w-6 text-slate-800" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{currentStep.title}</h2>
                                </div>
                                <p className="text-slate-500 font-medium leading-relaxed">{currentStep.description}</p>
                            </div>

                            <div className="relative group">
                                <input
                                    autoFocus
                                    type="text"
                                    value={data[currentStep.field]}
                                    onChange={(e) => setData({ ...data, [currentStep.field]: e.target.value })}
                                    placeholder={currentStep.placeholder}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-lg font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-500/30 focus:bg-white transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                />
                                <button
                                    onClick={handleNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-100 text-slate-400 group-focus-within:bg-blue-600 group-focus-within:text-white rounded-xl transition-all"
                                >
                                    <ArrowRightIcon className="h-6 w-6" />
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

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                        <SparklesIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Step {step} of 3: <span className="text-slate-600">Building your "Insane" Opportunity Feed</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ConciergeOnboarding;
