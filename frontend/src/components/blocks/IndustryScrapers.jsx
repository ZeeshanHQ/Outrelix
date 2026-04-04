import React from "react";
import { TestimonialsColumn } from "../ui/testimonials-columns-1";
import { motion } from "framer-motion";
import {
    Building2, Cloud, ShoppingCart, HeartPulse,
    Coins, GraduationCap, Scale, Factory,
    Megaphone, CarFront, Hotel, Truck,
    Briefcase, Zap, Laptop, HardHat
} from "lucide-react";

const industries = [
    {
        title: "Real Estate",
        description: "Extract property listings, agent details, and market trends with pinpoint accuracy.",
        icon: Building2,
    },
    {
        title: "SaaS",
        description: "Identify tech stacks, funding rounds, and key decision-makers seamlessly.",
        icon: Cloud,
    },
    {
        title: "E-commerce",
        description: "Scrape product catalogs, pricing data, and customer sentiment instantly.",
        icon: ShoppingCart,
    },
    {
        title: "Healthcare",
        description: "Source verified medical professionals, clinics, and health tech providers.",
        icon: HeartPulse,
    },
    {
        title: "Finance",
        description: "Aggregate financial advisors, fintech startups, and investment firm data.",
        icon: Coins,
    },
    {
        title: "Education",
        description: "Gather contact info for district leaders, university departments, and academics.",
        icon: GraduationCap,
    },
    {
        title: "Legal",
        description: "Build lists of law firms, practicing attorneys, and legal tech partners.",
        icon: Scale,
    },
    {
        title: "Manufacturing",
        description: "Extract supplier directories, plant managers, and industrial equipment data.",
        icon: Factory,
    },
    {
        title: "Marketing",
        description: "Source creative agencies, marketing directors, and active brand advertisers.",
        icon: Megaphone,
    },
    {
        title: "Automotive",
        description: "Scrape dealership networks, automotive suppliers, and aftermarket providers.",
        icon: CarFront,
    },
    {
        title: "Hospitality",
        description: "Extract data on hotel chains, restaurant owners, and travel agencies.",
        icon: Hotel,
    },
    {
        title: "Logistics",
        description: "Source trucking companies, supply chain managers, and fulfillment centers.",
        icon: Truck,
    },
    {
        title: "Consulting",
        description: "Gather intelligence on management consultants and specialized advisory firms.",
        icon: Briefcase,
    },
    {
        title: "Energy",
        description: "Aggregate data on renewable energy providers, oil & gas contractors, and utilities.",
        icon: Zap,
    },
    {
        title: "EdTech",
        description: "Find educational technology platforms, course creators, and e-learning admins.",
        icon: Laptop,
    },
    {
        title: "Construction",
        description: "Source general contractors, architectural firms, and building material suppliers.",
        icon: HardHat,
    },
];

const firstColumn = industries.slice(0, 5);
const secondColumn = industries.slice(5, 11);
const thirdColumn = industries.slice(11, 16);

export default function IndustryScrapers() {
    return (
        <section className="bg-obsidian-950 py-48 relative overflow-hidden" id="industries">
            {/* Background aesthetics */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1200px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] opacity-40" />
            </div>

            <div className="max-w-7xl relative z-10 mx-auto px-6 sm:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center max-w-4xl mx-auto text-center mb-32"
                >
                    <div className="text-label-small mb-6 block text-blue-400/80 tracking-[0.3em]">
                        SCALABILITY — 03
                    </div>

                    <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter leading-[1.1] mb-8">
                        Optimized for <br className="md:hidden" />
                        <span className="text-white/40 italic">Every Sector.</span>
                    </h2>
                    <p className="text-xl text-white/40 font-medium leading-relaxed max-w-2xl">
                        Our platform provides specialized extraction protocols optimized for specific industries, doubling down on data relevance.
                    </p>
                </motion.div>

                {/* The Animated Columns */}
                <div className="flex justify-center gap-8 lg:gap-12 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[850px] overflow-hidden relative">
                    <TestimonialsColumn testimonials={firstColumn} duration={35} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={45} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={40} />
                </div>
            </div>
        </section>
    );
}
