import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Target, Mail, Users, TrendingUp, CheckCircle, BarChart2 } from 'lucide-react'
import { GradientButton } from '../ui/gradient-button'

// — Animated Dashboard Preview Component —
const DashboardPreview = () => {
    const [activeRow, setActiveRow] = useState(0);

    const leads = [
        { name: 'TechNova Inc.', email: 'ceo@technova.io', industry: 'SaaS', status: 'Replied', score: 94 },
        { name: 'GrowthBase', email: 'founder@growthbase.co', industry: 'Marketing', status: 'Opened', score: 87 },
        { name: 'Apex Digital', email: 'sales@apexdigital.com', industry: 'Agency', status: 'Sent', score: 76 },
        { name: 'Vertex Labs', email: 'cto@vertexlabs.io', industry: 'Tech', status: 'Replied', score: 91 },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveRow(prev => (prev + 1) % leads.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    const statusColors = {
        Replied: 'bg-green-500/10 text-green-400 border-green-500/20',
        Opened: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        Sent: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto group">
            {/* Ambient Shadow glow */}
            <div className="absolute -inset-4 bg-blue-500/10 rounded-[2.5rem] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            
            {/* Browser chrome */}
            <div className="bg-obsidian-800 rounded-t-2xl px-4 py-3 flex items-center gap-2 border-x border-t border-white/10">
                <div className="flex gap-1.5 font-inter">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10" />
                </div>
                <div className="flex-1 mx-3 bg-obsidian-950/50 rounded-lg px-3 py-1 text-[10px] text-white/30 font-mono tracking-wider flex justify-center border border-white/5">
                    OUTRELIX.ASTRAVENTA.ONLINE/DASHBOARD
                </div>
            </div>

            {/* Dashboard body */}
            <div className="bg-obsidian-900/80 backdrop-blur-3xl border-x border-b border-white/10 rounded-b-2xl overflow-hidden shadow-2xl relative">
                {/* Top stats row */}
                <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
                    {[
                        { label: 'LEADS FOUND', value: '12,847', delta: '+2.4k', icon: Users, color: 'text-blue-400' },
                        { label: 'EMAILS SENT', value: '5,291', delta: 'REAL-TIME', icon: Mail, color: 'text-indigo-400' },
                        { label: 'REPLY RATE', value: '23.6%', delta: '↑ 4.1%', icon: TrendingUp, color: 'text-green-400' },
                    ].map((stat, i) => (
                        <div key={i} className="p-5 flex flex-col items-start gap-1">
                             <div className="flex items-center gap-2 mb-1">
                                <stat.icon className={`w-3.5 h-3.5 ${stat.color} opacity-80`} />
                                <span className="text-label-small !opacity-40">{stat.label}</span>
                             </div>
                             <p className="text-xl font-bold text-white tracking-tight leading-none">{stat.value}</p>
                             <span className="text-[9px] font-bold text-green-500 tracking-widest mt-1 opacity-80">{stat.delta}</span>
                        </div>
                    ))}
                </div>

                {/* Leads table */}
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-label-small !opacity-60">NETWORK_FEED: LIVE_EXTRACTION</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] text-green-400 font-bold tracking-tighter">ACTIVE</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {leads.map((lead, i) => (
                            <motion.div
                                key={i}
                                animate={{ 
                                    backgroundColor: i === activeRow ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0)',
                                    borderColor: i === activeRow ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0)'
                                }}
                                transition={{ duration: 0.4 }}
                                className="flex items-center justify-between px-3 py-2 rounded-xl border transition-all"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-obsidian-700/50 border border-white/10 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                        {lead.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-white/90 truncate tracking-tight">{lead.name}</p>
                                        <p className="text-[9px] text-white/30 truncate tracking-wide">{lead.email.toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${statusColors[lead.status]}`}>
                                        {lead.status.toUpperCase()}
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-white/70 w-6 text-right leading-none">{lead.score}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Technical metadata footer */}
                <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between bg-obsidian-950/20">
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-white/20 font-bold tracking-tighter">LATENCY</span>
                            <span className="text-[10px] text-white/60 font-mono">12ms</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-white/20 font-bold tracking-tighter">SUCCESS_RATE</span>
                            <span className="text-[10px] text-white/60 font-mono">99.8%</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-1 h-6">
                        {[40, 65, 52, 78, 61, 85, 72, 90, 68, 95, 74, 88].map((h, i) => (
                            <div key={i} className="flex-1 w-1 bg-white/10 rounded-t-[1px]" style={{ height: `${h * 0.25}px` }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
    );
};

// — Typing Rotator for industry names —
const TypingRotator = ({ words }) => {
    const [wordIndex, setWordIndex] = useState(0);
    const [displayed, setDisplayed] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let timeout;
        const word = words[wordIndex];
        if (isTyping) {
            if (displayed.length < word.length) {
                timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 50);
            } else {
                timeout = setTimeout(() => setIsTyping(false), 900);
            }
        } else {
            if (displayed.length > 0) {
                timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 25);
            } else {
                setWordIndex((prev) => (prev + 1) % words.length);
                setIsTyping(true);
            }
        }
        return () => clearTimeout(timeout);
    }, [displayed, isTyping, wordIndex, words]);

    return (
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {displayed}<span className="animate-pulse text-blue-600">|</span>
        </span>
    );
};

export function HeroSection({ setIsSignupOpen }) {
    const industries = ['Real Estate', 'SaaS', 'E-commerce', 'Healthcare', 'Technology', 'Finance', 'Marketing', 'Agencies'];

    return (
        <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-obsidian-900 z-0 py-32 sm:py-48">
            {/* Elite Radial Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full obsidian-gradient pointer-events-none" />
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] opacity-20" />
                <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] opacity-10" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
                <div className="grid lg:grid-cols-2 gap-20 lg:gap-32 items-center">
                    {/* Left: Copy */}
                    <div className="text-center lg:text-left">
                        {/* Elite Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-md"
                        >
                            <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                            <span className="text-label-small !opacity-80">
                                AI LEAD_V1.2 · ENTERPRISE_GRADE_ACCURACY
                            </span>
                        </motion.div>

                        {/* Editorial Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.8 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-inter"
                        >
                            The Silent Authority <br/>
                            <span className="text-white/40">in Outreach.</span>
                        </motion.h1>

                        {/* Premium Sub-headline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-lg text-white/50 leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0 font-inter"
                        >
                            Reveal verified leads from every corner of the web. Fully automated lead generation and AI cold outreach — designed for those who demand <span className="text-white/80 font-semibold">absolute precision.</span>
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 mb-14 justify-center lg:justify-start"
                        >
                            <button
                                onClick={() => setIsSignupOpen(true)}
                                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-white text-obsidian-950 font-bold rounded-xl text-base hover:bg-white/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                Generate Leads Now
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="flex items-center justify-center gap-3 px-8 py-4 bg-obsidian-800 border border-white/10 text-white font-bold rounded-xl text-base hover:bg-obsidian-700 transition-all border-b-2">
                                <PlayCircleIcon className="w-5 h-5 text-white/50" />
                                Watch System Demo
                            </button>
                        </motion.div>

                        {/* Social proof - Minimalized */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 1 }}
                            className="flex items-center gap-4 justify-center lg:justify-start"
                        >
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-9 h-9 rounded-full border border-obsidian-900 bg-obsidian-800 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" className="w-full h-full object-cover grayscale opacity-80" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-left">
                                <p className="text-label-small !opacity-40 !tracking-widest">ENDORSED_BY 2.5K+ TEAMS</p>
                                <div className="flex gap-0.5 mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-1 h-1 rounded-full bg-blue-400" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="hidden lg:block relative"
                    >
                        <DashboardPreview />
                        
                        {/* Technical Floating Meta */}
                        <div className="absolute -bottom-10 -right-10 bg-obsidian-950/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl z-20">
                           <div className="flex flex-col gap-1">
                               <span className="text-[10px] text-white/40 font-mono">ENCRYPTION: AES-256</span>
                               <span className="text-[10px] text-green-400 font-mono">STATUS: OPTIMIZED</span>
                           </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
