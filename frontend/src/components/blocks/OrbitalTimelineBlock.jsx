import React from "react";
import { Database, Filter, Send, LineChart, Target } from "lucide-react";
import RadialOrbitalTimeline from "../ui/radial-orbital-timeline";
import { motion } from "framer-motion";

const timelineData = [
    {
        id: 1,
        title: "Data Extraction",
        date: "Phase 1",
        content: "Automated scraping of verified B2B contacts across multiple specialized industry channels.",
        category: "Extraction",
        icon: Database,
        relatedIds: [2],
        status: "completed",
        energy: 100,
    },
    {
        id: 2,
        title: "AI Enrichment",
        date: "Phase 2",
        content: "Deep qualification & data enrichment using Outrelix AI engines to ensure 99.8% accuracy.",
        category: "Qualification",
        icon: Filter,
        relatedIds: [1, 3],
        status: "completed",
        energy: 90,
    },
    {
        id: 3,
        title: "Hyper-Personalization",
        date: "Phase 3",
        content: "Generating highly relevant, intent-based messaging sequences based on extracted context.",
        category: "Personalization",
        icon: Target,
        relatedIds: [2, 4],
        status: "in-progress",
        energy: 75,
    },
    {
        id: 4,
        title: "Automated Outreach",
        date: "Phase 4",
        content: "Executing targeted multi-channel cold email campaigns at scale.",
        category: "Outreach",
        icon: Send,
        relatedIds: [3, 5],
        status: "pending",
        energy: 40,
    },
    {
        id: 5,
        title: "Analytics & Scaling",
        date: "Phase 5",
        content: "Tracking conversions, optimizing deliverability, and closing high-tier leads.",
        category: "Analytics",
        icon: LineChart,
        relatedIds: [4],
        status: "pending",
        energy: 20,
    },
];

export default function OrbitalTimelineBlock() {
    return (
        <section className="py-48 relative overflow-hidden bg-obsidian-950">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02),transparent_70%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-label-small mb-6 block text-blue-400/80 tracking-[0.3em]"
                    >
                        THE PROTOCOL — 05
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-10 leading-[1.05]"
                    >
                        The Architecture of <br className="hidden sm:block" />
                        <span className="text-white/40 italic">Autonomous Scale.</span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-white/30 font-medium leading-relaxed max-w-3xl mx-auto"
                    >
                        Visualize the operational lifecycle of an Outrelix node, from initial ingestion to verified conversion metrics.
                    </motion.p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="w-full relative rounded-[3rem] overflow-hidden"
                >
                    <RadialOrbitalTimeline timelineData={timelineData} />
                </motion.div>
                
                {/* Bottom Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32">
                    {[
                        { label: "Uptime", value: "99.99%" },
                        { label: "Throughput", value: "1.2M/day" },
                        { label: "Latency", value: "< 240ms" },
                        { label: "Nodes", value: "15+ Global" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="bg-obsidian-800/10 border border-white/5 p-8 rounded-3xl backdrop-blur-xl group hover:bg-obsidian-800/20 transition-all duration-500"
                        >
                            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                {stat.label}
                            </div>
                            <div className="text-2xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors duration-500">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
