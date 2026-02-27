import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    SparklesIcon,
    MapPinIcon,
    CpuChipIcon,
    CurrencyDollarIcon,
    UsersIcon,
    XMarkIcon,
    FireIcon
} from '@heroicons/react/24/outline';

const SmartSearchBar = ({ value, onChange, onSearch, onMagicRefine, isRefining }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = [
        { label: "New Tech Hires", query: "Companies hiring Senior Software Engineers", icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Recent Series A", query: "Recent Series A funding rounds", icon: CurrencyDollarIcon, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "AI Tech Stack", query: "Companies using OpenAI or Anthropic", icon: CpuChipIcon, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "NYC Expansion", query: "Marketing agencies in NYC with recent office expansion", icon: MapPinIcon, color: "text-amber-500", bg: "bg-amber-50" },
    ];

    return (
        <div className="relative w-full max-w-4xl mx-auto z-40">
            <motion.div
                animate={{
                    scale: isFocused ? 1.02 : 1,
                    boxShadow: isFocused ? '0 20px 40px -15px rgba(59, 130, 246, 0.15)' : '0 10px 20px -10px rgba(0, 0, 0, 0.05)'
                }}
                className={`relative flex items-center bg-white transition-all duration-500 rounded-3xl p-2 ${isFocused ? 'shadow-2xl shadow-blue-500/10' : 'shadow-lg shadow-slate-200/50'
                    }`}
            >
                <div className="flex-1 flex items-center px-4 gap-4">
                    <MagnifyingGlassIcon className={`h-6 w-6 transition-colors ${isFocused ? 'text-blue-500' : 'text-slate-300'}`} />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => { setIsFocused(true); setShowSuggestions(true); }}
                        onBlur={() => {
                            // Delay hiding to allow clicks
                            setTimeout(() => {
                                setIsFocused(false);
                                setShowSuggestions(false);
                            }, 200);
                        }}
                        placeholder="Search for your next high-value opportunity..."
                        className="w-full py-4 text-xl font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none border-none ring-0 focus:ring-0"
                        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    />
                </div>

                <div className="flex items-center gap-2 pr-2">
                    <AnimatePresence>
                        {value && (
                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={() => onChange('')}
                                className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onMagicRefine}
                        disabled={isRefining || !value}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isRefining
                            ? 'bg-slate-50 text-slate-400'
                            : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 active:bg-blue-700'
                            }`}
                    >
                        {isRefining ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                                <span>Brewing...</span>
                            </div>
                        ) : (
                            <>
                                <SparklesIcon className="h-4 w-4" />
                                <span>Optimize</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Recommendations Feed (Generative UI) */}
            <AnimatePresence>
                {showSuggestions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 overflow-hidden z-[50]"
                    >
                        <div className="flex items-center gap-2 mb-6 ml-2">
                            <FireIcon className="h-4 w-4 text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trending Intent Signals</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {suggestions.map((s, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                                    onClick={() => {
                                        onChange(s.query);
                                        onSearch();
                                    }}
                                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:border-slate-200 transition-all text-left group"
                                >
                                    <div className={`p-3 rounded-xl transition-colors ${s.bg}`}>
                                        <s.icon className={`h-5 w-5 ${s.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">{s.label}</p>
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{s.query}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400">12,400+ Intent Signals scanned today</p>
                            </div>
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:underline">
                                View Intelligent Map
                                <MapPinIcon className="h-3 w-3" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmartSearchBar;
