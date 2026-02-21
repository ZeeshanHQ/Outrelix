import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Menu, X, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/button'
import { AnimatedGroup } from '../ui/animated-group'
import { cn } from '../../lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(20px)',
            y: 20,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0,
                duration: 1.2,
            },
        },
    },
}

export function HeroSection({ setIsSignupOpen }) {
    return (
        <section className="bg-black min-h-screen flex flex-col pt-24 overflow-hidden">
            <main className="relative flex-1">
                {/* Elite Background Elements: Bioluminescent Glow */}
                <div
                    aria-hidden
                    className="z-[0] absolute inset-0 pointer-events-none isolate opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
                </div>

                <div className="relative pt-12 md:pt-20 z-10">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                            <AnimatedGroup variants={transitionVariants}>
                                <div
                                    className="bg-white/[0.03] hover:bg-white/[0.08] group mx-auto flex w-fit items-center gap-4 rounded-full border border-white/10 p-1 pl-4 transition-all duration-500 backdrop-blur-md">
                                    <span className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        Advanced Neural Outreach v1.4
                                    </span>
                                    <span className="block h-4 w-px bg-white/10"></span>

                                    <div className="bg-white/10 group-hover:bg-blue-600 group-hover:text-white size-6 overflow-hidden rounded-full duration-500 border border-white/10 flex items-center justify-center">
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>

                                <h1 className="mt-10 max-w-5xl mx-auto text-balance text-5xl md:text-7xl lg:text-[100px] font-outfit font-black tracking-[-0.04em] text-white leading-[0.9] uppercase italic">
                                    Scale Your <br />
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#ec4899] drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                        Intelligence
                                    </span>
                                </h1>
                                <p className="mx-auto mt-10 max-w-2xl text-balance text-lg md:text-xl text-white/60 font-inter font-light tracking-wide leading-relaxed">
                                    Outrelix is the elite command center for autonomous lead generation.
                                    Harness neural extraction to find and convert high-value targets at scale.
                                </p>
                            </AnimatedGroup>

                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.1,
                                                delayChildren: 0.5,
                                            },
                                        },
                                    },
                                    ...transitionVariants,
                                }}
                                className="mt-14 flex flex-col items-center justify-center gap-6 md:flex-row">
                                <button
                                    onClick={() => setIsSignupOpen(true)}
                                    className="group relative px-10 py-5 bg-white text-black rounded-full font-outfit font-black text-lg uppercase tracking-wider overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    <span className="relative z-10 group-hover:text-white flex items-center gap-2">
                                        Infiltrate Markets <ArrowRight className="w-5 h-5" />
                                    </span>
                                </button>
                                <button
                                    className="px-10 py-5 rounded-full font-outfit font-bold text-lg text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-400" />
                                    Deep Scan Demo
                                </button>
                            </AnimatedGroup>
                        </div>
                    </div>

                    {/* App Preview: Glassmorphic Display */}
                    <div className="relative mt-20 px-4 max-w-7xl mx-auto">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[60%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
                        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/10 bg-black/50 p-3 shadow-[0_0_80px_rgba(0,0,0,1)] backdrop-blur-2xl">
                            <div className="overflow-hidden rounded-[30px] border border-white/5 bg-[#050505]">
                                <img
                                    className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-700"
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
                                    alt="Outrelix Neural Interface"
                                />
                                {/* Overlay status chip */}
                                <div className="absolute top-8 right-10 bg-black/60 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_10px_#3b82f6] animate-pulse" />
                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Neural Scraper Live</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Trusted By: Cinematic Scroll */}
            <section className="pb-32 pt-20 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-16">
                        Standard Tool for Fortune 500 Outreach Teams
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-10 opacity-30 grayscale invert hover:opacity-100 transition-all duration-700">
                        <img className="h-5 md:h-6" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia" />
                        <img className="h-4 md:h-5" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub" />
                        <img className="h-5 md:h-6" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike" />
                        <img className="h-5 md:h-6" src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg" alt="Lemon Squeezy" />
                        <img className="h-5 md:h-6" src="https://html.tailus.io/blocks/customers/openai.svg" alt="OpenAI" />
                        <img className="h-5 md:h-6" src="https://html.tailus.io/blocks/customers/laravel.svg" alt="Laravel" />
                    </div>
                </div>
            </section>
        </section>
    )
}
