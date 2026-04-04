import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Send, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: <Target className="h-8 w-8 text-blue-400" />,
        number: "01",
        title: "Define Target",
        description: "Specify your industry, geography, and ideal lead criteria. Our AI engine processes the landscape instantly.",
        glow: "shadow-blue-500/20"
    },
    {
        icon: <Zap className="h-8 w-8 text-indigo-400" />,
        number: "02",
        title: "Scrape & Verify",
        description: "Outrelix extracts data from 50+ sources, performs real-time verification, and enriches contact profiles.",
        glow: "shadow-indigo-500/20"
    },
    {
        icon: <Send className="h-8 w-8 text-purple-400" />,
        number: "03",
        title: "Launch & Convert",
        description: "Automated sequence deployment with AI-personalized outreach. We manage the pipeline while you close.",
        glow: "shadow-purple-500/20"
    }
];

export default function ProcessSection() {
    return (
        <section id="how-it-works" className="py-48 relative bg-obsidian-950 overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-blue-500/5 rounded-full blur-[120px] opacity-40" />
                <div className="absolute left-0 bottom-0 w-1/3 h-1/2 bg-indigo-500/5 rounded-full blur-[120px] opacity-40" />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-4xl mx-auto mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-label-small mb-6 block text-blue-400/80 tracking-[0.3em]"
                    >
                        PIPELINE — 02
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-8 leading-[1.1]"
                    >
                        Engineered for <br className="hidden sm:block" />
                        <span className="text-white/40 italic">Asymmetric Scaling.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/40 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        Turning cold data into warm leads through a sophisticated three-stage extraction and outreach protocol.
                    </motion.p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-3 gap-8 lg:gap-16 relative">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="relative z-10 group"
                        >
                            {/* Card */}
                            <div className="h-full bg-obsidian-800/10 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-10 lg:p-12 hover:bg-obsidian-800/20 hover:border-white/10 transition-all duration-500 relative overflow-hidden group-hover:-translate-y-2">
                                
                                {/* Background Large Number */}
                                <div className="absolute -right-6 -top-10 text-[140px] font-bold text-white/[0.02] select-none group-hover:text-white/[0.04] transition-colors duration-700 italic">
                                    {step.number}
                                </div>

                                {/* Icon Layer */}
                                <div className="relative mb-12">
                                    <div className="w-20 h-20 rounded-3xl bg-obsidian-950 border border-white/5 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                                        {step.icon}
                                    </div>
                                    <div className={`absolute -inset-4 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/40 leading-relaxed font-medium text-lg">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Subtle Status Orb */}
                                <div className="absolute top-10 right-10 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Active</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
