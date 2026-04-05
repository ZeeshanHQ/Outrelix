import React from 'react';
import { motion } from 'framer-motion';
import { Search, Database, Mail, Zap, Users, Shield, Cpu, ArrowDown } from 'lucide-react';

const STAGES = [
    {
        id: "ingestion",
        title: "Massive Data Ingestion",
        description: "Our proprietary bots crawl the web across 50+ specialized sources, collecting billions of raw data points from LinkedIn, Google Maps, and niche directories.",
        icon: <Database className="w-8 h-8" />,
        color: "blue",
        gradient: "from-blue-500 to-cyan-400",
        stats: "50+ Sources",
        pill: "Crawl Engine v4.2"
    },
    {
        id: "extraction",
        title: "AI-Powered Extraction",
        description: "Raw noise is passed through our proprietary AI lens. We extract names, validated emails, social profiles, and company insights with 99.8% precision.",
        icon: <Cpu className="w-8 h-8" />,
        color: "indigo",
        gradient: "from-indigo-500 to-purple-400",
        stats: "99.8% Precision",
        pill: "LLM Processing"
    },
    {
        id: "enrichment",
        title: "Intelligent Enrichment",
        description: "The AI Researcher visits every prospect's website to find recent news, products, and challenges, crafting a unique fingerprint for every lead.",
        icon: <Zap className="w-8 h-8" />,
        color: "purple",
        gradient: "from-purple-500 to-pink-400",
        stats: "Real-time Research",
        pill: "Deep Insights"
    },
    {
        id: "outreach",
        title: "Autonomous Outreach",
        description: "Outrelix auto-connects to your Gmail or Workspace, sending personalized follow-ups that land in the primary inbox, booking meetings while you sleep.",
        icon: <Mail className="w-8 h-8" />,
        color: "blue",
        gradient: "from-blue-600 to-indigo-500",
        stats: "Primary Inbox",
        pill: "Auto-Pilot"
    }
];

const PipelineCard = ({ stage, index }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, x: isEven ? -20 : 20 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-32 last:mb-0 ${!isEven ? 'md:flex-row-reverse' : ''}`}
        >
            {/* Visual Side */}
            <div className="flex-1 w-full max-w-xl relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${stage.gradient} opacity-[0.05] blur-3xl group-hover:opacity-10 transition-opacity duration-700 rounded-[3rem]`} />
                <div className="relative bg-obsidian-800/10 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 lg:p-12 shadow-2xl hover:border-white/10 transition-all duration-700 overflow-hidden">
                    <div className="flex items-start justify-between mb-10">
                        <div className="w-20 h-20 rounded-3xl bg-obsidian-950 border border-white/5 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-700">
                            {stage.icon}
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.3em] leading-none">
                            {stage.pill}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div className="h-4 w-full bg-obsidian-950 rounded-full overflow-hidden relative border border-white/5">
                            <motion.div
                                initial={{ x: "-100%" }}
                                whileInView={{ x: "0%" }}
                                transition={{ duration: 2, delay: 0.5 }}
                                className={`absolute inset-y-0 left-0 w-full bg-gradient-to-r ${stage.gradient} opacity-40`}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-24 bg-white/[0.02] rounded-3xl border border-white/5 flex flex-col items-center justify-center group-hover:bg-white/[0.04] transition-colors duration-500">
                                <span className="text-xs text-white/20 mb-1 font-bold tracking-widest uppercase">Status</span>
                                <span className="text-base font-bold text-white tracking-tight">Active</span>
                            </div>
                            <div className="h-24 bg-white/[0.02] rounded-3xl border border-white/5 flex flex-col items-center justify-center group-hover:bg-white/[0.04] transition-colors duration-500">
                                <span className="text-xs text-white/20 mb-1 font-bold tracking-widest uppercase">Quality</span>
                                <span className="text-base font-bold text-white tracking-tight">99.8%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Connector Path (for desktop) */}
                {index < STAGES.length - 1 && (
                    <div className="hidden md:block absolute -bottom-20 left-1/2 -translate-x-1/2 text-white/5">
                        <motion.div
                            animate={{ y: [0, 10, 0], opacity: [0.3, 0.8, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                        >
                            <ArrowDown className="w-8 h-8" />
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Content Side */}
            <div className="flex-1 w-full max-w-lg text-left">
                <div className="text-[10px] font-mono tracking-[0.4em] text-blue-400 uppercase mb-6 flex items-center gap-4">
                    <div className="h-px w-8 bg-blue-500/30" />
                    PROTOCOL — 0{index + 1}
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                    {stage.title}
                </h3>
                <p className="text-xl text-white/40 leading-relaxed font-medium mb-10">
                    {stage.description}
                </p>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-2">Key Metric</span>
                        <span className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stage.gradient}`}>
                            {stage.stats}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function InteractivePipeline() {
    return (
        <section id="features" className="relative py-64 sm:py-80 bg-obsidian-950 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[200px] opacity-40" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/5 rounded-full blur-[200px] opacity-40" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-4xl mx-auto mb-64 sm:mb-80">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
                    >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        Autonomous Engine
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-10 tracking-tighter leading-[1.05]"
                    >
                        Cold Data to <br />
                        <span className="text-white/40 italic">Warm Pipelines.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-white/30 font-medium leading-relaxed max-w-3xl mx-auto"
                    >
                        Operating at the intersection of massive industrial scraping and sophisticated AI orchestration.
                    </motion.p>
                </div>

                {/* Steps Container */}
                <div className="relative">
                    {/* Vertical connecting line (Desktop only) */}
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/5" />

                    {/* The Cards */}
                    <div className="flex flex-col">
                        {STAGES.map((stage, i) => (
                            <PipelineCard key={stage.id} stage={stage} index={i} />
                        ))}
                    </div>
                </div>

                {/* Bottom CTA Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-60 p-16 md:p-24 rounded-[4rem] bg-obsidian-800/10 border border-white/5 relative overflow-hidden text-center group shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10 opacity-40" />
                    <div className="absolute -top-32 -right-32 w-1/3 h-1/3 bg-blue-500/10 rounded-full blur-[160px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h3 className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tighter leading-tight">
                            Scale your revenue <br />
                            <span className="text-white/40 italic">without the friction.</span>
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-all hover:-translate-y-1 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                                Initialize System
                            </button>
                            <button className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all hover:-translate-y-1">
                                Technical Briefing
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
