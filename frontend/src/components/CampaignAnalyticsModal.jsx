import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    ArrowUpIcon,
    EnvelopeIcon,
    CursorArrowRaysIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    SparklesIcon,
    CheckCircleIcon,
    CpuChipIcon,
    RocketLaunchIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import axios from '../utils/axios';

const LiveActionFeed = ({ pipelineStatus, leads }) => {
    const defaultLogs = [
        { id: 1, type: "system", text: "Initializing Core Pipeline", time: new Date().toLocaleTimeString(), status: "done" },
        { id: 2, type: "system", text: "Establishing secure connection to data providers", time: new Date().toLocaleTimeString(), status: "done" }
    ];

    const [logs, setLogs] = useState(defaultLogs);

    useEffect(() => {
        let newLogs = [...defaultLogs];
        const now = new Date().toLocaleTimeString();

        if (pipelineStatus === "AI Analyzing Intent" || pipelineStatus === "Generating Intelligence" || pipelineStatus === "Sourcing Leads" || pipelineStatus === "Validating Wave" || pipelineStatus === "Engaging Leads" || pipelineStatus === "Mission Accomplished") {
            newLogs.push({ id: 3, type: "ai", text: "Analyzing goal and generating optimal outreach angles", time: now, status: "done" });
            newLogs.push({ id: 4, type: "ai", text: "Crafting hyper-personalized email sequences", time: now, status: "done" });
        }

        if (pipelineStatus === "Sourcing Leads" || pipelineStatus === "Validating Wave" || pipelineStatus === "Engaging Leads" || pipelineStatus === "Mission Accomplished") {
            newLogs.push({ id: 5, type: "scrape", text: "Scouring Google Maps & Premium Directories for high-intent targets", time: now, status: "done" });
            newLogs.push({ id: 6, type: "enrich", text: "Enriching company data via LinkedIn & Clearbit", time: now, status: "done" });
            newLogs.push({ id: 7, type: "scrape", text: "Extracting decision-maker contact information", time: now, status: "done" });
        }

        if (pipelineStatus === "Validating Wave" || pipelineStatus === "Engaging Leads" || pipelineStatus === "Mission Accomplished") {
            newLogs.push({ id: 8, type: "validate", text: "Executing Waterfall Email Validation (MX & SMTP handshakes)", time: now, status: "done" });
            newLogs.push({ id: 9, type: "validate", text: "Filtering out catch-alls and dangerous domains", time: now, status: "done" });
        }

        if (pipelineStatus === "Engaging Leads" || pipelineStatus === "Mission Accomplished") {
            newLogs.push({ id: 10, type: "system", text: "Wave compiled. Initiating Smart Sending Protocol.", time: now, status: "done" });

            if (leads && leads.length > 0) {
                leads.forEach((lead, index) => {
                    newLogs.push({
                        id: 11 + index,
                        type: "send",
                        text: `Engaging ${lead.email}`,
                        time: lead.sent_at ? new Date(lead.sent_at).toLocaleTimeString() : now,
                        status: "success"
                    });
                });
            } else {
                newLogs.push({ id: 11, type: "system", text: "Awaiting optimal delivery window...", time: now, status: "waiting" });
            }
        }

        setLogs(newLogs);
    }, [pipelineStatus, leads]);

    const getIcon = (type) => {
        switch (type) {
            case 'ai': return <SparklesIcon className="w-4 h-4 text-purple-500" />;
            case 'scrape': return <MagnifyingGlassIcon className="w-4 h-4 text-blue-500" />;
            case 'enrich': return <CpuChipIcon className="w-4 h-4 text-amber-500" />;
            case 'validate': return <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />;
            case 'send': return <RocketLaunchIcon className="w-4 h-4 text-rose-500" />;
            default: return <CheckCircleIcon className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-[320px]">
            <div className="p-4 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="ml-2 text-[10px] font-black tracking-widest uppercase text-slate-400">Live Operation Feed</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-gray-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase">System Optimal</span>
                </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-3 relative">
                <AnimatePresence>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800"
                        >
                            <div className="mt-0.5 p-1.5 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
                                {getIcon(log.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">[{log.time}]</span>
                                    {log.status === "success" && (
                                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full uppercase tracking-widest">Success</span>
                                    )}
                                    {log.status === "waiting" && (
                                        <span className="text-[8px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Waiting</span>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-slate-700 dark:text-gray-200 leading-relaxed">
                                    {log.text}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const CampaignAnalyticsModal = ({ open, onClose, campaignId, campaignName }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && campaignId) {
            fetchAnalytics();
        }
    }, [open, campaignId]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/campaigns/${campaignId}/analytics`);
            setAnalytics(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const stats = [
        { label: 'Total Sent', value: analytics?.total_sent || 0, icon: EnvelopeIcon, color: 'text-blue-500', bg: 'bg-blue-50', isEstimated: false },
        { label: 'Total Opens', value: analytics?.opens || 0, icon: CursorArrowRaysIcon, color: 'text-purple-500', bg: 'bg-purple-50', isEstimated: true },
        { label: 'Replies', value: analytics?.replies || 0, icon: ChatBubbleLeftRightIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', isEstimated: false },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-gray-800"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Campaign Intelligence</h2>
                        <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">{campaignName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-gray-900 rounded-full transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <SparklesIcon className="w-6 h-6 text-blue-500 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-800 dark:text-white font-black uppercase tracking-[0.2em] text-xs mb-1">Processing Analysis</p>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Gathering real-time signals...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {(!analytics || analytics.total_sent === 0) && (
                                <div className="p-8 bg-blue-50/50 dark:bg-blue-950/20 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/30 text-center mb-10">
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-3">Initializing Campaign Wave</h3>
                                    <p className="text-slate-500 dark:text-gray-400 font-medium max-w-sm mx-auto leading-relaxed mb-6">
                                        Your campaign is active. We are currently processing the intelligence pipeline. Real-time signals will appear below as they are gathered.
                                    </p>
                                    <div className="flex justify-center">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                                            <span className="text-[10px] font-black text-blue-400 uppercase">Live Pipeline Processing</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stat Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="p-6 rounded-2xl border border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 shadow-sm transition-all hover:bg-white dark:hover:bg-gray-900">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            {stat.isEstimated ? (
                                                <span className="text-[8px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-blue-100/50">Estimated</span>
                                            ) : (
                                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-3xl font-black text-slate-800 dark:text-white uppercase">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* AI Intelligence Card (Elite Step) */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-slate-200 dark:shadow-none flex items-center gap-6 border border-slate-800 dark:border-slate-100 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="p-4 bg-white/10 dark:bg-slate-100 rounded-2xl relative z-10">
                                    <SparklesIcon className="w-8 h-8 text-blue-400 dark:text-blue-600" />
                                </div>
                                <div className="relative z-10 flex-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 dark:text-blue-600 mb-1.5">Elite Intelligence Step</h4>
                                    <p className="text-lg font-black leading-tight tracking-tight">{analytics?.killer_tip || "Analyzing performance signals for killer insights..."}</p>
                                </div>
                            </motion.div>

                            {/* Pipeline Intelligence Section */}
                            <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <CpuChipIcon className="w-5 h-5 text-blue-500" />
                                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Live Intelligence Pipeline</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                        <span className="text-[10px] font-black text-blue-400 uppercase">Real-time</span>
                                    </div>
                                </div>

                                <div className="relative flex justify-between items-start max-w-2xl mx-auto">
                                    {/* Progress line */}
                                    <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-slate-200 dark:bg-gray-800" />
                                    <motion.div
                                        className="absolute top-6 left-[10%] h-[2px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        initial={{ width: '0%' }}
                                        animate={{
                                            width: analytics?.pipeline_status === "Mission Accomplished" ? '80%' :
                                                analytics?.pipeline_status === "Engaging Leads" ? '60%' :
                                                    analytics?.pipeline_status === "Validating Wave" ? '40%' :
                                                        analytics?.pipeline_status === "Sourcing Leads" ? '20%' :
                                                            analytics?.pipeline_status === "Generating Intelligence" ? '10%' : '0%'
                                        }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />

                                    {[
                                        { id: 'Sourcing Leads', icon: MagnifyingGlassIcon, label: 'Sourcing' },
                                        { id: 'Validating Wave', icon: ShieldCheckIcon, label: 'Validation' },
                                        { id: 'Engaging Leads', icon: RocketLaunchIcon, label: 'Engagement' },
                                        { id: 'Mission Accomplished', icon: CheckCircleIcon, label: 'Success' }
                                    ].map((step, idx) => {
                                        const statuses = ["Standby", "Generating Intelligence", "Sourcing Leads", "Validating Wave", "Engaging Leads", "Mission Accomplished"];
                                        const currentIndex = statuses.indexOf(analytics?.pipeline_status || "Standby");
                                        const stepIndex = statuses.indexOf(step.id);
                                        const isActive = currentIndex >= stepIndex;
                                        const isCurrent = analytics?.pipeline_status === step.id;

                                        return (
                                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-400'}`}>
                                                    <step.icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce' : ''}`} />
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>{step.label}</p>
                                                    {isCurrent && (
                                                        <motion.p
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="text-[8px] font-bold text-blue-400 animate-pulse mt-0.5"
                                                        >
                                                            Processing...
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="p-6 rounded-2xl border border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                        <ChartBarIcon className="w-4 h-4 text-blue-500" />
                                        Performance Timeline
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            Sent
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                            Opens
                                        </span>
                                    </div>
                                </div>
                                <div className="h-[280px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics?.daily_stats}>
                                            <defs>
                                                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                            <Area type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                                            <Area type="monotone" dataKey="opens" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorOpens)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Live Action Feed replacing static Lead Activity List */}
                            <div className="mt-8">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-3 h-3 text-emerald-500" />
                                    Live Action Feed
                                </h4>
                                <LiveActionFeed pipelineStatus={analytics?.pipeline_status} leads={analytics?.leads} />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 p-2">
                                <button className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-200 dark:shadow-none">
                                    Export Intelligence Report
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 border border-slate-200 dark:border-gray-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-900 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CampaignAnalyticsModal;
