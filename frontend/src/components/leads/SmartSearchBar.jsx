import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Sparkles,
    MapPin,
    Cpu,
    DollarSign,
    Users,
    X,
    Flame,
    ArrowRight
} from 'lucide-react';

const SmartSearchBar = ({ value, onChange, onSearch, onMagicRefine, isRefining }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = [
        { label: "New Tech Hires", query: "Companies hiring Senior Software Engineers", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Recent Series A", query: "Recent Series A funding rounds", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "AI Tech Stack", query: "Companies using OpenAI or Anthropic", icon: Cpu, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "NYC Expansion", query: "Marketing agencies in NYC with recent office expansion", icon: MapPin, color: "text-amber-500", bg: "bg-amber-50" },
    ];

    return (
        <div className="relative w-full max-w-4xl mx-auto z-40">
            <motion.div
                animate={{
                    scale: isFocused ? 1.02 : 1,
                    boxShadow: isFocused ? '0 30px 60px -15px rgba(59, 130, 246, 0.15)' : '0 10px 40px -10px rgba(0, 0, 0, 0.05)'
                }}
                className={`relative flex items-center bg-white transition-all duration-500 rounded-[2rem] p-3 border ${isFocused ? 'border-blue-100' : 'border-slate-100'}`}
            >
                <div className="flex-1 flex items-center px-6 gap-4">
                    <Search className={`h-6 w-6 transition-colors ${isFocused ? 'text-blue-600' : 'text-slate-300'}`} />
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
                        className="w-full py-4 text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none border-none ring-0 focus:ring-0 bg-transparent"
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
                                <X className="h-5 w-5" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: value && !isRefining ? 1.02 : 1 }}
                        whileTap={{ scale: value && !isRefining ? 0.98 : 1 }}
                        onClick={onMagicRefine}
                        disabled={isRefining || !value}
                        title="Use AI to optimize your search query"
                        className={`flex items-center gap-2 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isRefining || !value
                            ? 'bg-slate-50 text-slate-400 border border-slate-100 opacity-60 cursor-not-allowed'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 hover:bg-indigo-100'
                            }`}
                    >
                        {isRefining ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-slate-300 border-t-indigo-400 rounded-full animate-spin" />
                                <span>Brewing...</span>
                            </div>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                <span className="hidden sm:inline">Optimize</span>
                            </>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: value ? 1.05 : 1 }}
                        whileTap={{ scale: value ? 0.95 : 1 }}
                        onClick={onSearch}
                        disabled={!value}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${!value
                            ? 'bg-slate-50 text-slate-400 border border-slate-100 opacity-60 cursor-not-allowed'
                            : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-0.5'
                            }`}
                    >
                        <span>Search</span>
                        <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Recommendations Feed (Generative UI) */}
            <AnimatePresence>
                {showSuggestions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-6 bg-white border border-slate-100 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-8 overflow-hidden z-[50]"
                    >
                        <div className="flex items-center gap-2 mb-6 ml-2">
                            <Flame className="h-4 w-4 text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trending Intent Signals</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {suggestions.map((s, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02, backgroundColor: '#f8fafc', y: -2 }}
                                    onClick={() => {
                                        onChange(s.query);
                                        onSearch();
                                    }}
                                    className="flex items-center gap-5 p-5 rounded-2xl border border-slate-50 hover:border-slate-200 transition-all text-left group shadow-sm hover:shadow-md"
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
                                <MapPin className="h-3 w-3" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmartSearchBar;
