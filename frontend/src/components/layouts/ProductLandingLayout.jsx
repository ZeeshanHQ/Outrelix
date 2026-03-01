import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, ChevronRight } from 'lucide-react';
import { RainbowButton } from '../ui/rainbow-button';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        viewport={{ once: true }}
        className="group relative p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:border-blue-100 transition-all duration-300"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 pointer-events-none" />
        <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Icon strokeWidth={1.5} className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {title}
            </h3>
            <p className="text-slate-500 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    </motion.div>
);

export default function ProductLandingLayout({
    badgeText,
    titleHighlight,
    titleSuffix,
    description,
    primaryCtaText = "Start Free Trial",
    secondaryCtaText = "View Documentation",
    heroImage,
    stats = [],
    painPoints = { title: "", items: [] },
    features = [],
    howItWorks = [],
    faqs = []
}) {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden pt-20">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
                            {badgeText}
                        </span>

                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                {titleHighlight}
                            </span>{" "}
                            {titleSuffix}
                        </h1>

                        <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
                            {description}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <RainbowButton className="px-8 py-5 text-base shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] relative">
                                <Link to="/#signup" className="flex items-center gap-2 text-white">
                                    {primaryCtaText} <ArrowRight className="w-4 h-4" />
                                </Link>
                            </RainbowButton>

                            <button className="px-8 py-5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-base hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600 transition-all shadow-sm">
                                {secondaryCtaText}
                            </button>
                        </div>

                        {/* Optional Fast Stats below Hero */}
                        {stats.length > 0 && (
                            <div className="mt-16 pt-10 border-t border-slate-200/60 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <span className="text-3xl font-black text-slate-900 mb-1">{stat.value}</span>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* PAIN POINTS SECTION (Problem -> Solution) */}
            {painPoints.items.length > 0 && (
                <section className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                                {painPoints.title}
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {painPoints.items.map((item, i) => (
                                <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-6 font-bold">✕</div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.problem}</h3>
                                    <p className="text-slate-500 text-sm mb-6">{item.problemDesc}</p>

                                    <div className="h-px bg-slate-200 w-full mb-6" />

                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 font-bold">✓</div>
                                    <h3 className="text-lg font-bold text-emerald-700 mb-2">{item.solution}</h3>
                                    <p className="text-slate-600 text-sm font-medium">{item.solutionDesc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CORE FEATURES */}
            {features.length > 0 && (
                <section className="py-24 relative bg-slate-50">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <div className="text-center mb-20">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
                                Core Capabilities
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                                Everything you need to scale
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, i) => (
                                <FeatureCard key={i} {...feature} delay={i * 0.1} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FINAL CTA */}
            <section className="py-24 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.3),transparent_70%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
                        Ready to dominate your market?
                    </h2>
                    <p className="text-xl text-slate-300 font-medium mb-10 max-w-2xl mx-auto">
                        Stop wasting time on manual processes. Join thousand of elite growth teams already using Outrelix to automate their revenue.
                    </p>
                    <RainbowButton className="px-10 py-5 text-lg">
                        <Link to="/#signup" className="flex items-center gap-2 text-white">
                            Get Started Instantly
                        </Link>
                    </RainbowButton>
                    <p className="mt-6 text-sm text-slate-400 font-medium">14-day free trial. No credit card required.</p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
