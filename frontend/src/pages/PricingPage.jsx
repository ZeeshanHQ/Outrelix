'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Star,
  Globe,
  Mail,
  BarChart3
} from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';

const PricingPage = () => {
  const premiumFeatures = [
    { title: 'Infinite Campaigns', desc: 'Zero limits on active outreach threads', icon: FireIconAlt },
    { title: 'Deep Scrape Intelligence', desc: 'AI-powered prospect research active', icon: Sparkles },
    { title: 'Priority Send Clusters', desc: 'High-performance delivery infrastructure', icon: Zap },
    { title: 'Executive Analytics', desc: 'Real-time intent and conversion tracking', icon: BarChart3 },
    { title: 'Global Multi-Vertical', desc: 'Full access to all 20+ specialized industries', icon: Globe },
    { title: 'Advanced Sequences', desc: 'AI-generated high-conversion sequences', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-white font-poppins selection:bg-blue-100">
      <DashboardHeader showGreeting={false} title="Intelligence Status" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <main className="p-4 md:p-8 2xl:p-12 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-28 scale-[0.85] origin-top">

            {/* Hero Section */}
            <div className="text-center mb-16 space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-800 rounded-full border border-slate-100 shadow-sm mb-4"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active License Verified</span>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight">
                Infinite Intelligence <span className="text-blue-600">Unlocked</span>.
              </h1>
              <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
                Your account has been granted full access to the Outrelix Intelligence Suite. Experience unrestricted growth with no volume caps or feature locks.
              </p>
            </div>

            {/* Premium Card */}
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-xl border-4 border-white rounded-[48px] shadow-2xl shadow-blue-200/50 overflow-hidden"
              >
                <div className="p-10 md:p-16">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
                    <div>
                      <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Infinite Executive Plan</h2>
                      <p className="text-blue-600 font-black text-sm uppercase tracking-widest">All System Limits Removed</p>
                    </div>
                    <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
                      <span className="text-xl font-black">ACTIVE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-16">
                    {premiumFeatures.map((f, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                          <f.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">{f.title}</h4>
                          <p className="text-xs text-slate-400 font-medium">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                        <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">Premium Partner Support</h4>
                        <p className="text-xs text-slate-400">24/7 dedicated engineering queue enabled</p>
                      </div>
                    </div>
                    <button className="px-8 py-4 bg-white border border-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                      Access Support
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Security / Compliance */}
            <div className="mt-16 text-center text-slate-300">
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Enforced with 256-bit AES Intelligence Encryption</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

// Simple icon wrapper to match the context if FireIcon is not imported
const FireIconAlt = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 10 1 15 1 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14c2 0 3-1 3-3 0-2-1-3-3-3m5 8c0-2.5-1-4-3-4" />
  </svg>
);

export default PricingPage;
