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
        { name: 'Brandify HQ', email: 'hello@brandify.com', industry: 'Design', status: 'Opened', score: 83 },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveRow(prev => (prev + 1) % leads.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    const statusColors = {
        Replied: 'bg-green-50 text-green-600',
        Opened: 'bg-blue-50 text-blue-600',
        Sent: 'bg-slate-50 text-slate-500',
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Browser chrome */}
            <div className="bg-slate-800 rounded-t-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-3 bg-slate-700 rounded-lg px-3 py-1 text-xs text-slate-400 font-mono">
                    app.outrelix.com/dashboard
                </div>
            </div>

            {/* Dashboard body */}
            <div className="bg-white border border-slate-200/60 rounded-b-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.12)]">
                {/* Top stats row */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                    {[
                        { label: 'Leads Found', value: '12,847', delta: '+2.4k', icon: Users, color: 'text-blue-600' },
                        { label: 'Emails Sent', value: '5,291', delta: 'today', icon: Mail, color: 'text-indigo-600' },
                        { label: 'Reply Rate', value: '23.6%', delta: '↑ 4.1%', icon: TrendingUp, color: 'text-green-600' },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 flex items-start gap-3">
                            <div className={`p-1.5 rounded-lg bg-slate-50 ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                                <p className="text-base font-bold text-slate-900">{stat.value}</p>
                                <p className="text-xs text-green-500 font-semibold">{stat.delta}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Leads table */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Latest Extracted Leads</span>
                        <span className="flex items-center gap-1 text-xs text-green-500 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        {leads.map((lead, i) => (
                            <motion.div
                                key={i}
                                animate={{ backgroundColor: i === activeRow ? '#eff6ff' : '#ffffff' }}
                                transition={{ duration: 0.4 }}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-transparent hover:border-blue-100 transition-all"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {lead.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 truncate">{lead.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{lead.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="hidden sm:block text-xs text-slate-400">{lead.industry}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[lead.status]}`}>
                                        {lead.status}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 w-6 text-right">{lead.score}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Mini chart bar at bottom */}
                <div className="border-t border-slate-100 px-4 py-3 flex items-end gap-1 bg-slate-50/50">
                    {[40, 65, 52, 78, 61, 85, 72, 90, 68, 95, 74, 88].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h * 0.4}px` }}
                            transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
                            className="flex-1 bg-blue-200 rounded-sm"
                            style={{ minHeight: 4 }}
                        />
                    ))}
                </div>
            </div>

            {/* Floating stat bubbles */}
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -left-16 top-8 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100 hidden lg:block"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Accuracy</p>
                        <p className="text-sm font-bold text-slate-900">99.8%</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -right-16 top-16 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100 hidden lg:block"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Speed</p>
                        <p className="text-sm font-bold text-slate-900">1k leads/min</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                className="absolute -right-14 bottom-20 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100 hidden lg:block"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <BarChart2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Reply Rate</p>
                        <p className="text-sm font-bold text-slate-900">4.2x Higher</p>
                    </div>
                </div>
            </motion.div>
        </div>
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
                timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 70);
            } else {
                timeout = setTimeout(() => setIsTyping(false), 1400);
            }
        } else {
            if (displayed.length > 0) {
                timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
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

// — Main Hero Section Export —
export function HeroSection({ setIsSignupOpen }) {
    const industries = ['Real Estate', 'SaaS', 'E-commerce', 'Healthcare', 'Technology', 'Finance', 'Marketing', 'Agencies'];

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white z-0">
            {/* Ambient background blobs */}
            <div className="absolute inset-0 bg-[#F8FAFC]/50" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(59,130,246,0.04)_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-32">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Left: Copy */}
                    <div>
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            <span className="text-blue-700 text-xs font-bold uppercase tracking-widest">
                                AI Lead Engine · v2.0 · 99.8% Accuracy
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.7 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] mb-6"
                        >
                            Find Leads for{' '}
                            <TypingRotator words={industries} />
                            <br />
                            <span className="text-slate-900">at Lightning Speed.</span>
                        </motion.h1>

                        {/* Sub-headline */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg"
                        >
                            Outrelix scrapes verified leads from Google Maps, LinkedIn, and 10+ sources — then sends
                            personalized cold emails via your Gmail. <strong className="text-slate-700">Fully automated.</strong>
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, duration: 0.7 }}
                            className="flex flex-col sm:flex-row gap-3 mb-10"
                        >
                            <GradientButton
                                onClick={() => setIsSignupOpen(true)}
                                className="group shadow-lg shadow-blue-200/50 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Start Scraping Free
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </GradientButton>
                            <button className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-base hover:bg-slate-50 transition-all">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-blue-600 fill-current" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                Watch 2-min Demo
                            </button>
                        </motion.div>

                        {/* Social proof row */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="flex items-center gap-4"
                        >
                            <div className="flex -space-x-2">
                                {['https://i.pravatar.cc/32?u=1', 'https://i.pravatar.cc/32?u=2', 'https://i.pravatar.cc/32?u=3', 'https://i.pravatar.cc/32?u=4'].map((src, i) => (
                                    <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                                ))}
                            </div>
                            <div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 font-medium">2,500+ teams trust Outrelix</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        className="hidden lg:block"
                    >
                        <DashboardPreview />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
