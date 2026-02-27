import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    SparklesIcon,
    PaperAirplaneIcon,
    ClipboardIcon,
    ArrowPathIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import { aiApi } from '../../utils/supabaseHelpers';
import { toast } from 'react-toastify';

const AIOpenerGenerator = ({ isOpen, onClose, lead }) => {
    const [draft, setDraft] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [tone, setTone] = useState('Professional & Helpful');

    const generateDraft = async () => {
        if (!lead) return;
        setIsGenerating(true);
        try {
            const prompt = `Write a hyper-personalized first-touch outreach email for:
            Company: ${lead.company_name}
            Industry: ${lead.enrichment_industry}
            Intent Signal: ${lead.intent_signals?.join(', ') || 'General Interest'}
            Outreach Angle: ${lead.ai_outreach_line}
            
            Tone: ${tone}
            Keep it under 3-4 sentences. Focus on solving a problem related to their intent.
            Return ONLY the subject line and body.`;

            const result = await aiApi.complete([
                { role: 'system', content: 'You are an elite SDR copywriter.' },
                { role: 'user', content: prompt }
            ]);

            if (result) setDraft(result);
        } catch (error) {
            toast.error("AI is busy refining its craft.");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (isOpen && lead) {
            generateDraft();
        }
    }, [isOpen]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(draft);
        toast.success("Draft copied to clipboard!");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                    <SparklesIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">AI Outreach Forge</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        Crafting for: <span className="text-blue-600">{lead?.company_name}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <XMarkIcon className="h-6 w-6 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8">
                            {/* Controls */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    {['Professional & Helpful', 'Casual & Direct', 'Bullish & Creative'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tone === t
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {t.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={generateDraft}
                                    disabled={isGenerating}
                                    className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                                >
                                    <ArrowPathIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                    Regenerate
                                </button>
                            </div>

                            {/* Draft Display */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                                <div className="relative bg-slate-50/50 rounded-3xl p-6 min-h-[200px] border border-slate-100/50">
                                    {isGenerating ? (
                                        <div className="absolute inset-0 flex items-center justify-center p-8 text-center space-y-4 flex-col">
                                            <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Scanning signals... Synthesizing hook...</p>
                                        </div>
                                    ) : (
                                        <pre className="whitespace-pre-wrap font-sans text-sm font-medium text-slate-600 leading-relaxed">
                                            {draft || 'Drafting your personalized opener...'}
                                        </pre>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 bg-white border-2 border-slate-100 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <ClipboardIcon className="h-4 w-4" />
                                    Copy to Clipboard
                                </button>
                                <button
                                    className="flex-1 bg-blue-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <PaperAirplaneIcon className="h-4 w-4" />
                                    Send to Outreach
                                </button>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                This opener leverages <span className="text-blue-500">Intent Signals</span> found on their primary domain.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AIOpenerGenerator;
