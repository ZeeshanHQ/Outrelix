import React from 'react';
import { motion } from 'framer-motion';
import {
    Home, Laptop, ShoppingBag, Hospital, DollarSign, BookOpen,
    Scale, Factory, Megaphone, Car, Hotel, Truck,
    Handshake, Zap, GraduationCap, Building2
} from 'lucide-react';

const scrapers = [
    { icon: <Home />, label: "Real Estate" },
    { icon: <Laptop />, label: "SaaS" },
    { icon: <ShoppingBag />, label: "E-commerce" },
    { icon: <Hospital />, label: "Healthcare" },
    { icon: <DollarSign />, label: "Finance" },
    { icon: <BookOpen />, label: "Education" },
    { icon: <Scale />, label: "Legal" },
    { icon: <Factory />, label: "Manufacturing" },
    { icon: <Megaphone />, label: "Marketing" },
    { icon: <Car />, label: "Automotive" },
    { icon: <Hotel />, label: "Hospitality" },
    { icon: <Truck />, label: "Logistics" },
    { icon: <Handshake />, label: "Consulting" },
    { icon: <Zap />, label: "Energy" },
    { icon: <GraduationCap />, label: "EdTech" },
    { icon: <Building2 />, label: "Construction" }
];

export default function SpecializedScrapers() {
    return (
        <section className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.02),transparent_40%)]" />
            <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
                <div className="text-center mb-20">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                        Industry Specialized
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">
                        Scrapers for <span className="text-blue-600">Every Industry</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Our platform provides tailored data extraction tools optimized for specific sectors to ensure maximum quality.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                    {scrapers.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -8, backgroundColor: '#ffffff', borderColor: '#3b82f633', boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.15)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: (index % 8) * 0.04 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center justify-center p-6 rounded-[1.5rem] border border-slate-200 bg-white/50 backdrop-blur-sm transition-all duration-300"
                        >
                            <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                {React.cloneElement(item.icon, { size: 28, strokeWidth: 1.5 })}
                            </div>
                            <span className="text-xs font-bold text-center text-slate-700 tracking-tight">{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
