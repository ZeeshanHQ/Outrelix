import React from 'react';
import { motion } from 'framer-motion';
import { Search, Database, Mail, Zap, Users, Shield, Cpu, ArrowDown } from 'lucide-react';

const STAGES = [
    {
        id: "ingestion",
        title: "Massive Data Ingestion",
        description: "Our proprietary bots crawl the web across 50+ specialized sources, collecting billions of raw data points from LinkedIn, Google Maps, and niche directories.",
        icon: <Database className="w-6 h-6" />,
        color: "blue",
        gradient: "from-blue-600 to-cyan-500",
        stats: "50+ Sources",
        pill: "Crawl Engine v4.2"
    },
    {
        id: "extraction",
        title: "AI-Powered Extraction",
        description: "Raw noise is passed through our proprietary AI lens. We extract names, validated emails, social profiles, and company insights with 99.8% precision.",
        icon: <Cpu className="w-6 h-6" />,
        color: "indigo",
        gradient: "from-indigo-600 to-purple-500",
        stats: "99.8% Precision",
        pill: "LLM Processing"
    },
    {
        id: "enrichment",
        title: "Intelligent Enrichment",
        description: "The AI Researcher visits every prospect's website to find recent news, products, and challenges, crafting a unique fingerprint for every lead.",
        icon: <Zap className="w-6 h-6" />,
        color: "purple",
        gradient: "from-purple-600 to-pink-500",
        stats: "Real-time Research",
        pill: "Deep Insights"
    },
    {
        id: "outreach",
        title: "Autonomous Outreach",
        description: "Outrelix auto-connects to your Gmail or Workspace, sending personalized follow-ups that land in the primary inbox, booking meetings while you sleep.",
        icon: <Mail className="w-6 h-6" />,
        color: "blue",
        gradient: "from-blue-700 to-indigo-600",
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
            transition={{ duration: 0.7, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-24 last:mb-0 ${!isEven ? 'md:flex-row-reverse' : ''}`}
        >
            {/* Visual Side */}
            <div className="flex-1 w-full max-w-lg relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${stage.gradient} opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />
                <div className="relative bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden">
                    <div className="flex items-start justify-between mb-8">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center text-white shadow-lg shadow-blue-500/10`}>
                            {stage.icon}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {stage.pill}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="h-4 w-3/4 bg-slate-100 rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ x: "-100%" }}
                                whileInView={{ x: "0%" }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className={`absolute inset-y-0 left-0 w-full bg-gradient-to-r ${stage.gradient} opacity-20`}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-20 bg-slate-50/50 rounded-2xl border border-slate-100/50 flex flex-col items-center justify-center">
                                <span className="text-xs text-slate-400 mb-1">Status</span>
                                <span className="text-sm font-bold text-slate-800">Optimizing...</span>
                            </div>
                            <div className="h-20 bg-slate-50/50 rounded-2xl border border-slate-100/50 flex flex-col items-center justify-center">
                                <span className="text-xs text-slate-400 mb-1">Efficiency</span>
                                <span className="text-sm font-bold text-slate-800">99.8%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vertical Connector Path (for desktop) */}
                {index < STAGES.length - 1 && (
                    <div className="hidden md:block absolute -bottom-16 left-1/2 -translate-x-1/2 text-slate-200">
                        <motion.div
                            animate={{ y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <ArrowDown className="w-6 h-6" />
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Content Side */}
            <div className="flex-1 w-full max-w-lg text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
                    <Shield className="w-3 h-3" />
                    Phase 0{index + 1}
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                    {stage.title}
                </h3>
                <p className="text-lg text-slate-500 leading-relaxed font-medium mb-8">
                    {stage.description}
                </p>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Key Performance</span>
                        <span className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stage.gradient}`}>
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
        <section id="features" className="relative py-32 bg-white overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="absolute inset-0 opacity-[0.4]"
                    style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-50 rounded-full blur-[160px] opacity-40" />
                <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-50 rounded-full blur-[160px] opacity-40" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
                    >
                        <Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        The Autonomous Engine
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1.05]"
                    >
                        From Raw Data to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic font-medium">Booked Appointments.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed"
                    >
                        Our end-to-end pipeline handles the heavy lifting, from massive industrial scraping
                        to AI-enriched personalized outreach. Zero manual work required.
                    </motion.p>
                </div>

                {/* Steps Container */}
                <div className="relative">
                    {/* Vertical connecting line (Desktop only) */}
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-100" />

                    {/* The Cards */}
                    <div className="flex flex-col">
                        {STAGES.map((stage, i) => (
                            <PipelineCard key={stage.id} stage={stage} index={i} />
                        ))}
                    </div>
                </div>

                {/* Bottom CTA Gradient */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-40 p-12 md:p-16 rounded-[40px] bg-slate-900 relative overflow-hidden text-center group"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20 opacity-40" />
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 group-hover:opacity-30 transition-opacity duration-700" />

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                            Ready to automate your <br />
                            pipeline today?
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40 hover:-translate-y-0.5 active:translate-y-0">
                                Get Started Free
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                                Talk to an Expert
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
