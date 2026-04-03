'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarIcon, LayersIcon as Dummy, DocumentArrowDownIcon, SparklesIcon } from '@heroicons/react/24/outline';
import AppSidebar from '../components/AppSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { supabase } from '../supabase';

const statusColors = {
  Running: 'bg-green-100 text-green-700',
  Paused: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-blue-100 text-blue-700',
};

const metricKeys = [
  { key: 'sent', label: 'Emails Sent' },
  { key: 'opened', label: 'Opens' },
  { key: 'clicked', label: 'Clicks' },
  { key: 'replied', label: 'Replies' },
];

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [graphMetric, setGraphMetric] = useState('events');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [series, setSeries] = useState([]); // [{date, analyzer, seo, writer, brand}]
  const [totals, setTotals] = useState({ analyzer: 0, seo: 0, writer: 0, brand: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        setUserId(user.id);

        const since = new Date();
        since.setDate(since.getDate() - 6); // last 7 days incl. today
        since.setHours(0, 0, 0, 0);

        // Fetch all feature rows
        const [anRes, seoRes, wrRes, brRes, sendRes, evRes] = await Promise.all([
          supabase.from('analyzer_results').select('id, created_at').eq('user_id', user.id).gte('created_at', since.toISOString()),
          supabase.from('seo_optimizations').select('id, created_at').eq('user_id', user.id).gte('created_at', since.toISOString()),
          supabase.from('writer_sessions').select('id, created_at').eq('user_id', user.id).gte('created_at', since.toISOString()),
          supabase.from('brand_generations').select('id, created_at').eq('user_id', user.id).gte('created_at', since.toISOString()),
          supabase.from('email_sends').select('id, created_at').eq('user_id', user.id).gte('created_at', since.toISOString()),
          supabase.from('email_events').select('event_type, type, created_at, user_id').eq('user_id', user.id).gte('created_at', since.toISOString()),
        ]);

        const byDay = {};
        const days = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(since);
          d.setDate(since.getDate() + i);
          const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          days.push(key);
          byDay[key] = { analyzer: 0, seo: 0, writer: 0, brand: 0, sends: 0, opens: 0, clicks: 0, replies: 0 };
        }

        const bump = (arr, field) => {
          (arr || []).forEach((r) => {
            const d = new Date(r.created_at);
            const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (byDay[key]) byDay[key][field] += 1;
          });
        };

        bump(anRes.data, 'analyzer');
        bump(seoRes.data, 'seo');
        bump(wrRes.data, 'writer');
        bump(brRes.data, 'brand');
        bump(sendRes.data, 'sends');

        // Map events; support either 'event_type' or 'type'
        (evRes.data || []).forEach((e) => {
          const kind = (e.event_type || e.type || '').toLowerCase();
          const d = new Date(e.created_at);
          const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (!byDay[key]) return;
          if (kind.includes('open')) byDay[key].opens += 1;
          else if (kind.includes('click')) byDay[key].clicks += 1;
          else if (kind.includes('reply') || kind.includes('respond')) byDay[key].replies += 1;
        });

        const totalsLocal = {
          analyzer: anRes.data?.length || 0,
          seo: seoRes.data?.length || 0,
          writer: wrRes.data?.length || 0,
          brand: brRes.data?.length || 0,
          sends: sendRes.data?.length || 0,
          opens: (evRes.data || []).filter(e => ((e.event_type || e.type || '').toLowerCase().includes('open'))).length,
          clicks: (evRes.data || []).filter(e => ((e.event_type || e.type || '').toLowerCase().includes('click'))).length,
          replies: (evRes.data || []).filter(e => ((e.event_type || e.type || '').toLowerCase().includes('reply') || (e.event_type || e.type || '').toLowerCase().includes('respond'))).length,
        };
        setTotals(totalsLocal);

        setSeries(days.map((key) => ({ date: key, ...byDay[key] })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateRange]);

  return (
    <div className="min-h-screen w-full font-poppins bg-white selection:bg-blue-100">
      <DashboardHeader showGreeting={false} title="System Analytics" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <main className="p-4 md:p-8 2xl:p-12 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-28 scale-[0.90] origin-top">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-12 border-b border-slate-50">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                  <SparklesIcon className="h-3 w-3" />
                  Fleet Intelligence
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                  Performance <span className="text-blue-600">Overview</span>.
                </h1>
                <p className="text-slate-400 font-medium max-w-xl">
                  Analyze your outreach efficiency, conversion velocity, and platform-wide growth metrics in real-time.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${dateRange === '7d' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`} onClick={() => setDateRange('7d')}>Last 7 days</button>
                <button className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${dateRange === 'custom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`} onClick={() => setDateRange('custom')}>Custom Range</button>
              </div>
            </div>
            {/* Loading */}
            {loading && (
              <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { key: 'analyzer', label: 'Analyses', value: totals.analyzer },
                { key: 'seo', label: 'SEO Optimizations', value: totals.seo },
                { key: 'writer', label: 'Writer Sessions', value: totals.writer },
                { key: 'brand', label: 'Brand Generations', value: totals.brand },
                { key: 'sends', label: 'Emails Sent', value: totals.sends || 0 },
                { key: 'opens', label: 'Opens', value: totals.opens || 0 },
                { key: 'clicks', label: 'Clicks', value: totals.clicks || 0 },
                { key: 'replies', label: 'Replies', value: totals.replies || 0 },
              ].map((m, i) => (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 group-hover:text-blue-500 transition-colors">{m.label}</div>
                  <div className="text-4xl font-black text-slate-800 tracking-tight">{m.value}</div>
                </motion.div>
              ))}
            </div>
            {/* Interactive Graph Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 lg:p-12">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-2">
                  {['events'].map((k) => (
                    <button key={k} className="px-6 py-3 rounded-xl bg-white text-slate-800 font-black text-[10px] uppercase tracking-widest border border-slate-100">Daily Activity Flow</button>
                  ))}
                </div>
                <button className="px-8 py-4 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2">
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  Export Premium Intel
                </button>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                    <ReTooltip
                      contentStyle={{ borderRadius: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', padding: '1.25rem', fontFamily: 'Poppins, sans-serif' }}
                      itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '2rem', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                    <Line type="monotone" dataKey="analyzer" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="seo" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="writer" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="brand" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Day-by-Day Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {series.map((d) => (
                <div key={d.date} className="bg-white rounded-3xl shadow-sm border border-slate-50 p-6 flex items-center justify-between hover:border-slate-200 transition-all">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-widest">{d.date}</div>
                  <div className="flex gap-4">
                    {[
                      { label: 'AN', val: d.analyzer, color: 'text-blue-500' },
                      { label: 'SEO', val: d.seo, color: 'text-emerald-500' },
                      { label: 'WR', val: d.writer, color: 'text-purple-500' },
                      { label: 'BR', val: d.brand, color: 'text-amber-500' },
                    ].map(stat => (
                      <div key={stat.label} className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-400">{stat.label}:</span>
                        <span className={`text-[10px] font-black ${stat.color}`}>{stat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics; 