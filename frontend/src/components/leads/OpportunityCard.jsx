import React from 'react';
import { motion } from 'framer-motion';
import {
    GlobeAltIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    SparklesIcon,
    CheckBadgeIcon,
    ArrowRightIcon,
    BuildingOfficeIcon,
    PresentationChartLineIcon,
    BriefcaseIcon,
    CurrencyDollarIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const OpportunityCard = ({ lead, onAction }) => {
    const score = lead.lead_score || 0;
    const signals = [];

    // Logic for mock intent signals based on available data
    if (lead.enrichment_employee_count > 50) signals.push({ icon: BriefcaseIcon, label: 'Scaling', color: 'text-blue-500', bg: 'bg-blue-50' });
    if (lead.enrichment_industry === 'Software') signals.push({ icon: PresentationChartLineIcon, label: 'Tech Intent', color: 'text-purple-500', bg: 'bg-purple-50' });
    if (score > 80) signals.push({ icon: CurrencyDollarIcon, label: 'High Intent', color: 'text-emerald-500', bg: 'bg-emerald-50' });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] transition-all duration-500 group overflow-hidden flex flex-col h-full"
        >
            {/* Header with Visual Hook */}
            <div className="relative h-24 bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                <div className="absolute top-4 left-4 flex gap-2">
                    {signals.map((s, i) => (
                        <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${s.bg} shadow-sm`}>
                            <s.icon className={`h-3 w-3 ${s.color}`} />
                            <span className={`text-[9px] font-black uppercase tracking-wider ${s.color}`}>{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="absolute -bottom-6 left-6">
                    <div className="h-16 w-16 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-500">
                        {lead.website_url ? (
                            <img
                                src={`https://logo.clearbit.com/${new URL(lead.website_url).hostname}`}
                                alt=""
                                className="w-full h-full object-contain opacity-80"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <BuildingOfficeIcon className="h-8 w-8 text-slate-200 hidden" />
                    </div>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className={`flex flex-col items-end`}>
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${score >= 85 ? 'text-rose-500' : score >= 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                            {score >= 85 ? 'Hot Lead' : score >= 60 ? 'Warm' : 'Cold'}
                        </span>
                        <div className={`flex items-center justify-center h-10 w-10 rounded-xl bg-white shadow-lg border border-slate-100 text-sm font-black ${score >= 85 ? 'text-rose-600 ring-2 ring-rose-500/20' : score >= 60 ? 'text-amber-600' : 'text-slate-500'
                            }`}>
                            {score}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-10 flex-1 flex flex-col">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-blue-600 transition-colors uppercase">{lead.company_name}</h3>
                        {score > 85 && <CheckBadgeIcon className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <MapPinIcon className="h-3 w-3" />
                        {lead.geo || 'Global'}
                        <span className="mx-1">•</span>
                        {lead.enrichment_industry || 'Professional Services'}
                    </div>
                </div>

                {/* Generative UI Snippet */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <SparklesIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <SparklesIcon className="h-3 w-3" />
                        AI Outreach Angle
                    </p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                        "{lead.ai_outreach_line || `Find out how ${lead.company_name} can leverage advanced AI to scale their outbound efforts.`}"
                    </p>
                </div>

                {/* Contact Strip */}
                <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-2 text-slate-500">
                            <EnvelopeIcon className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[120px]">{lead.primary_email || 'Verified on request'}</span>
                        </div>
                        {lead.primary_email && (
                            <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-tighter">Waterfall Verified</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 pt-5 border-t border-slate-50">
                        <button
                            onClick={() => onAction('email')}
                            className="flex-grow bg-blue-600 text-white py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-200 hover:shadow-blue-400 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap group/btn"
                        >
                            Draft Email
                            <ArrowRightIcon className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction('push'); }}
                            className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center justify-center shadow-sm shrink-0"
                            title="Push to Campaign"
                        >
                            <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                        <div className="flex gap-2 shrink-0">
                            {lead.website_url && (
                                <a
                                    href={lead.website_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-slate-200"
                                    title="View Website"
                                >
                                    <GlobeAltIcon className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OpportunityCard;
