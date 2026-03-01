import React from "react";
import { Database, Filter, Send, LineChart, Target } from "lucide-react";
import RadialOrbitalTimeline from "../ui/radial-orbital-timeline";

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
        content: "Deep qualification & data enrichment using Outrelix AI engines to ensure 99% accuracy.",
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
        <section className="py-24 relative overflow-hidden bg-slate-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_50%)]" />
            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
                        The Outrelix Protocol
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        How our <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">AI Engine</span> operates
                    </h2>
                    <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                        Watch real-time data flow through our high-performance architecture, from extraction to automated outreach.
                    </p>
                </div>

                <div className="w-full relative">
                    <RadialOrbitalTimeline timelineData={timelineData} />
                </div>
            </div>
        </section>
    );
}
