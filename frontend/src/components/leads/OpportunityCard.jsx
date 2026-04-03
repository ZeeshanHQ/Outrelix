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
    PaperAirplaneIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const OpportunityCard = ({ lead, onAction }) => {
    const score = lead.lead_score || 0;
    const signals = [];

    // Logic for mock intent signals based on available data
    if (lead.enrichment_employee_count > 50) signals.push({ icon: BriefcaseIcon, label: 'Scaling', color: 'text-blue-500', bg: 'bg-blue-50' });
    if (lead.enrichment_industry === 'Software') signals.push({ icon: PresentationChartLineIcon, label: 'Tech Intent', color: 'text-purple-500', bg: 'bg-purple-50' });
    if (score > 80) signals.push({ icon: CurrencyDollarIcon, label: 'High Intent', color: 'text-emerald-500', bg: 'bg-emerald-50' });

    const [copiedEmail, setCopiedEmail] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(false);

    const copyEmail = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(lead.primary_email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const copyPhone = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(lead.phone_number);
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 group overflow-hidden flex flex-col h-full"
        >
            {/* Header with Visual Hook */}
            <div className="relative h-28 bg-slate-50/50 overflow-hidden border-b border-slate-50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[calc(100%-80px)]">
                    {signals.map((s, i) => (
                        <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${s.bg} shadow-sm border border-white/20 whitespace-nowrap`}>
                            <s.icon className={`h-3 w-3 ${s.color}`} />
                            <span className={`text-[9px] font-black uppercase tracking-wider ${s.color}`}>{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="absolute -bottom-6 left-8">
                    <div className="h-16 w-16 rounded-[1.25rem] bg-white shadow-md shadow-slate-200/50 border border-slate-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-500">
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
                        <div className={`flex items-center justify-center h-10 w-10 rounded-xl bg-white shadow-md border border-slate-100 text-sm font-black ${score >= 85 ? 'text-rose-600 ring-2 ring-rose-500/20' : score >= 60 ? 'text-amber-600' : 'text-slate-500'
                            }`}>
                            {score}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 pt-12 flex-1 flex flex-col">
                <div className="mb-6">
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
                <div className="bg-blue-50/30 rounded-[1.25rem] p-5 border border-blue-100 mb-8 relative overflow-hidden group-hover:bg-blue-50 transition-colors">
                    <div className="absolute -top-2 -right-2 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
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
                    <div className="flex flex-col gap-3 w-full">
                        {lead.primary_email ? (
                            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50 group/item hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-9 w-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                                        <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Email</div>
                                        <div className="text-xs font-bold text-slate-700 truncate">{lead.primary_email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="hidden sm:inline-block bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter border border-emerald-100/50">Verified</span>
                                    <button 
                                        onClick={copyEmail}
                                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
                                    >
                                        {copiedEmail ? <CheckIcon className="h-4 w-4 text-emerald-500" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                             <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                                <div className="h-9 w-9 rounded-xl bg-white/50 flex items-center justify-center shrink-0 border border-slate-100">
                                    <EnvelopeIcon className="h-5 w-5 text-slate-300" />
                                </div>
                                <div className="text-xs font-bold text-slate-400 italic">Email finding in progress...</div>
                             </div>
                        )}

                        {lead.phone_number ? (
                            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50 group/item hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-9 w-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                                        <PhoneIcon className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Direct Phone</div>
                                        <div className="text-xs font-bold text-slate-700 truncate">{lead.phone_number}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <a 
                                        href={`https://wa.me/${lead.phone_number.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-all"
                                        title="WhatsApp Chat"
                                    >
                                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                    </a>
                                    <button 
                                        onClick={copyPhone}
                                        className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
                                    >
                                        {copiedPhone ? <CheckIcon className="h-4 w-4 text-emerald-500" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => onAction('email')}
                            className="flex-grow bg-blue-600 text-white py-3 px-5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap group/btn"
                        >
                            Draft Email
                            <ArrowRightIcon className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction('push'); }}
                            className="bg-emerald-50 text-emerald-600 p-3 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center justify-center shadow-sm shrink-0"
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
                                    className="p-3 bg-white text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all border border-slate-200 shadow-sm"
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
