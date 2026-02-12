import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    SparklesIcon,
    HandThumbUpIcon,
    HandThumbDownIcon
} from '@heroicons/react/24/outline';

const IcebreakerReviewModal = ({ open, onClose }) => {
    const [icebreakers, setIcebreakers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState('');

    // Mock Data Loading
    useEffect(() => {
        if (open) {
            setIcebreakers([
                {
                    id: 1,
                    lead: "Sarah Connor",
                    company: "Skynet Systems",
                    role: "CTO",
                    context: "Recent LinkedIn post about AI safety regulations.",
                    generated_icebreaker: "Hi Sarah, saw your recent post on AI safety. It's fascinating how you balance innovation with regulation at Skynet - definitely the biggest challenge in tech right now."
                },
                {
                    id: 2,
                    lead: "John Anderson",
                    company: "MetaCortex",
                    role: "Software Engineer",
                    context: "Company just raised Series B funding.",
                    generated_icebreaker: "Congrats on the Series B, John! Huge milestone for MetaCortex. Curious to see how you'll scale the engineering team with the new capital."
                },
                {
                    id: 3,
                    lead: "Diana Prince",
                    company: "Themyscira Inc.",
                    role: "CEO",
                    context: "Featured in 'Top 30 under 30' article.",
                    generated_icebreaker: "Diana, just read the 'Top 30 under 30' piece—incredible journey with Themyscira so far. The section about your leadership philosophy really resonated with me."
                }
            ]);
        }
    }, [open]);

    const handleApprove = () => {
        nextCard();
    };

    const handleRegenerate = () => {
        // Mock regeneration
        const current = icebreakers[currentIndex];
        const variants = [
            `Hey ${current.lead.split(' ')[0]}, loved your thoughts on ${current.context.toLowerCase().includes('post') ? 'your recent post' : 'recent news'}.`,
            `${current.lead.split(' ')[0]}, big fan of what you're doing at ${current.company}. The news about ${current.context} is impressive.`,
        ];
        const newText = variants[Math.floor(Math.random() * variants.length)];

        const updated = [...icebreakers];
        updated[currentIndex].generated_icebreaker = newText;
        setIcebreakers(updated);
    };

    const handleSaveEdit = () => {
        const updated = [...icebreakers];
        updated[currentIndex].generated_icebreaker = editText;
        setIcebreakers(updated);
        setEditing(false);
    };

    const nextCard = () => {
        if (currentIndex < icebreakers.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose(); // Finished all
        }
    };

    if (!open) return null;

    const currentItem = icebreakers[currentIndex];

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
                        <div className="p-2 bg-pink-500/20 rounded-xl border border-pink-500/30">
                            <SparklesIcon className="w-6 h-6 text-pink-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Icebreaker Review</h2>
                            <p className="text-xs text-gray-400">Personal AI Agent • <span className="text-blue-400">{currentIndex + 1}</span> of <span className="text-gray-500">{icebreakers.length}</span> pending</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                {currentItem && (
                    <div className="p-8 flex-1 overflow-y-auto">
                        {/* Lead Context Card */}
                        <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                                    {currentItem.lead[0]}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{currentItem.lead}</h3>
                                    <p className="text-sm text-gray-400">{currentItem.role} @ {currentItem.company}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-300 bg-black/20 p-4 rounded-xl border-l-2 border-blue-500">
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">Context Signal</span>
                                "{currentItem.context}"
                            </div>
                        </div>

                        {/* Generated Icebreaker */}
                        <div className="relative">
                            <label className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2 block">AI Generated Opener</label>

                            {editing ? (
                                <div className="space-y-4">
                                    <textarea
                                        value={editText || currentItem.generated_icebreaker}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full bg-slate-800 border border-pink-500/50 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 text-lg leading-relaxed min-h-[120px]"
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                                        <button onClick={handleSaveEdit} className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-600">Save Changes</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group relative">
                                    <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6 text-xl text-white leading-relaxed shadow-inner">
                                        "{currentItem.generated_icebreaker}"
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button
                                            onClick={() => { setEditText(currentItem.generated_icebreaker); setEditing(true); }}
                                            className="p-2 bg-slate-800 rounded-lg text-gray-400 hover:text-white border border-white/10 shadow-lg"
                                            title="Edit"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleRegenerate}
                                            className="p-2 bg-slate-800 rounded-lg text-gray-400 hover:text-blue-400 border border-white/10 shadow-lg"
                                            title="Regenerate"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-black/20 flex items-center justify-between gap-4">
                    <button
                        onClick={handleRegenerate}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-all border border-white/5"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                        Regenerate
                    </button>

                    <div className="flex gap-3">
                        <button
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            onClick={nextCard}
                        >
                            <HandThumbDownIcon className="w-5 h-5" />
                            Discard
                        </button>
                        <button
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/20 transition-all transform hover:-translate-y-0.5"
                            onClick={handleApprove}
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                            Approve & Next
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default IcebreakerReviewModal;
