import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Send, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: <Target className="h-7 w-7 text-blue-600" />,
        number: "01",
        title: "Define Target",
        description: "Pick your industry, geography, and lead criteria. Our AI understands your ideal customer profile instantly.",
        gradient: "from-blue-500 to-cyan-400",
        shadow: "shadow-blue-500/20"
    },
    {
        icon: <Zap className="h-7 w-7 text-indigo-600" />,
        number: "02",
        title: "Scrape & Verify",
        description: "Outrelix extracts leads from 50+ sources, verifies emails, and enriches contact data — all in real-time.",
        gradient: "from-indigo-500 to-purple-400",
        shadow: "shadow-indigo-500/20"
    },
    {
        icon: <Send className="h-7 w-7 text-purple-600" />,
        number: "03",
        title: "Launch & Convert",
        description: "AI writes personalized emails and sends via Gmail. Follow-ups run automatically while you close deals.",
        gradient: "from-purple-500 to-pink-400",
        shadow: "shadow-purple-500/20"
    }
];

export default function ProcessSection() {
    return (
        <section id="how-it-works" className="py-32 relative bg-white overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[#F8FAFC]" />
                <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-blue-50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute left-0 bottom-0 w-1/3 h-1/2 bg-indigo-50 rounded-full blur-[120px] opacity-60" />
                {/* Subtle Grid overlay */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        Our Workflow
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]"
                    >
                        Three Steps to <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Exponential Growth</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
                    >
                        We've engineered a seamless pipeline that transforms raw internet data into booked meetings on your calendar.
                    </motion.p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
                            className="relative z-10 group"
                        >
                            {/* Connector Arrow (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:flex absolute top-9 -right-6 lg:-right-8 w-12 h-12 items-center justify-center z-20 text-slate-300">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            )}

                            {/* Card */}
                            <div className="h-full bg-white/60 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 p-8 lg:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:border-slate-300 transition-all duration-500 relative overflow-hidden group-hover:-translate-y-1">

                                {/* Background Large Number */}
                                <div className="absolute -right-4 -top-8 text-[120px] font-black text-slate-900/[0.03] select-none group-hover:text-slate-900/[0.05] transition-colors duration-500">
                                    {step.number}
                                </div>

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-xl ${step.shadow} flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500`}>
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-10`} />
                                    {step.icon}
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Subtle Bottom Glow */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Optional Bottom Visual Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 flex justify-center hidden"
                >
                    <div className="w-px h-24 bg-gradient-to-b from-slate-200 to-transparent" />
                </motion.div>
            </div>
        </section>
    );
}
