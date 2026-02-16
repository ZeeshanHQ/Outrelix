import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    ShieldCheckIcon,
    BoltIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    ClipboardDocumentCheckIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

const ObjectionHandlerModal = ({ open, onClose }) => {
    const [objection, setObjection] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = () => {
        if (!objection.trim()) return;
        setIsAnalyzing(true);
        setResult(null);

        // Simulate RAG Latency
        setTimeout(() => {
            // Mock RAG Logic based on keywords
            let strategy = "Value-Based Reframe";
            let context = ["Case Study: TechFlow ROI (2024)", "Pricing Methodology Doc v2"];
            let response = "I completely understand that budget is a primary concern. However, most of our partners find that the efficiency gains from the Lead Engine offset the cost within the first 30 days. For example, TechFlow reduced their CAC by 40%. Would you be open to a brief ROI modeling session to see if similar results represent a win for you?";

            if (objection.toLowerCase().includes("time") || objection.toLowerCase().includes("busy")) {
                strategy = "Priority & Ease of Use";
                context = ["Onboarding Velocity Metrics", "User Testimonial: 'Set and Forget'"];
                response = "I hear you, bandwidth is always tight. That's exactly why we designed the platform to be 'set and forget'. Getting started takes less than 15 minutes, and our AI agents handle the day-to-day execution. If we could save you 10 hours of prospecting time a week, would that be worth a 15-minute conversation?";
            } else if (objection.toLowerCase().includes("competitor") || objection.toLowerCase().includes("using someone else")) {
                strategy = "Differentiation & Gap Analysis";
                context = ["Competitor Feature Matrix 2024", "Unique Selling Proposition: Neural Scoring"];
                response = "It's great you already have a solution in place. Many of our current clients switched because they found traditional tools lacked our real-time Neural Scoring. We're not asking you to rip and replace, but would you be open to running a small side-by-side test to compare lead intent quality?";
            }

            setResult({ strategy, context, response });
            setIsAnalyzing(false);
        }, 1500);
    };

    const reset = () => {
        setObjection('');
        setResult(null);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                            <ShieldCheckIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Objection Handler</h2>
                            <p className="text-xs text-gray-400">RAG Knowledge Base • <span className="text-green-400">Online</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {!result && !isAnalyzing && (
                        <div className="flex flex-col items-center justify-center py-2 text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">What's the blocker?</h3>
                            <p className="text-gray-400 max-w-sm text-sm">Enter the prospect's objection below. Our AI will retrieve the best counter-arguments from your knowledge base.</p>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="relative mb-8">
                        <textarea
                            value={objection}
                            onChange={(e) => setObjection(e.target.value)}
                            placeholder='e.g., "It"s too expensive", "We don"t have time", "I need to talk to my boss"...'
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                            disabled={isAnalyzing || result}
                        />
                        {(!result && !isAnalyzing) && (
                            <div className="absolute bottom-4 right-4">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!objection.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <BoltIcon className="w-4 h-4" />
                                    Analyze Objection
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Analysis Animation */}
                    {isAnalyzing && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-indigo-400 font-mono animate-pulse">
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                Scanning Knowledge Vault...
                            </div>
                            <div className="break-inside-avoid space-y-2">
                                <div className="h-2 bg-indigo-500/20 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5 }}
                                        className="h-full bg-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result Display */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* RAG Context */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BoltIcon className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Strategy</span>
                                    </div>
                                    <p className="text-sm text-white font-medium">{result.strategy}</p>
                                </div>
                                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DocumentTextIcon className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Sources Retrieval</span>
                                    </div>
                                    <ul className="text-xs text-gray-300 list-disc list-inside">
                                        {result.context.map((ctx, i) => (
                                            <li key={i}>{ctx}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Generated Response */}
                            <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-2xl p-6 shadow-inner relative group">
                                <span className="absolute top-4 right-4 text-[10px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-500/20 px-2 py-1 rounded">AI Suggested Response</span>
                                <p className="text-lg text-white leading-relaxed pt-6">"{result.response}"</p>

                                <div className="mt-6 flex gap-3">
                                    <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                        <ClipboardDocumentCheckIcon className="w-4 h-4" />
                                        Copy to Clipboard
                                    </button>
                                    <button
                                        onClick={handleAnalyze}
                                        className="px-4 py-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 border border-transparent hover:border-white/10"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                        Regenerate
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={reset}
                                    className="text-gray-500 text-sm hover:text-white transition-colors"
                                >
                                    Start Over
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ObjectionHandlerModal;
