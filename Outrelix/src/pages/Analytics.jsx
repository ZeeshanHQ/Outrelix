import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarIcon, LayersIcon as Dummy, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import AppSidebar from '../components/AppSidebar';
import supabase from '../lib/supabaseClient';

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
        since.setHours(0,0,0,0);

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
        for (let i=0;i<7;i++) {
          const d = new Date(since);
          d.setDate(since.getDate()+i);
          const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          days.push(key);
          byDay[key] = { analyzer: 0, seo: 0, writer: 0, brand: 0, sends: 0, opens: 0, clicks: 0, replies: 0 };
        }

        const bump = (arr, field) => {
          (arr||[]).forEach((r)=>{
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
        (evRes.data||[]).forEach((e)=>{
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
          opens: (evRes.data||[]).filter(e=>((e.event_type||e.type||'').toLowerCase().includes('open'))).length,
          clicks: (evRes.data||[]).filter(e=>((e.event_type||e.type||'').toLowerCase().includes('click'))).length,
          replies: (evRes.data||[]).filter(e=>((e.event_type||e.type||'').toLowerCase().includes('reply')|| (e.event_type||e.type||'').toLowerCase().includes('respond'))).length,
        };
        setTotals(totalsLocal);

        setSeries(days.map((key)=>({ date: key, ...byDay[key] })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateRange]);

  return (
    <div className="min-h-screen w-full font-poppins relative">
      <AppSidebar />
      {/* Fixed full-screen background gradient */}
      <div className="fixed inset-0 w-full h-full z-0 bg-gradient-to-br from-[#e3e9fa] via-[#c7d2fe] to-[#f3e8ff] dark:from-[#0a183d] dark:via-[#1a237e] dark:to-[#4b006e]" aria-hidden="true"></div>
      {/* Scrollable content */}
      <div className="relative min-h-screen w-full flex flex-col px-0 z-10 bg-transparent">
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-8 max-w-5xl mx-auto gap-4 w-full mt-6 md:mt-10">
          <h1 className="text-5xl md:text-6xl font-extrabold flex items-center gap-2" style={{letterSpacing: '-0.02em'}}>
            <span role="img" aria-label="Analytics">📈</span>
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg pr-4 leading-tight" style={{overflow: 'visible', display: 'inline-block'}}>
              Analytics Dashboard
            </span>
        </h1>
        <div className="flex items-center gap-2">
          <button className={`px-4 py-2 rounded-lg font-semibold text-sm ${dateRange==='7d' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'} transition-all`} onClick={()=>setDateRange('7d')}>Last 7 days</button>
          <button className={`px-4 py-2 rounded-lg font-semibold text-sm ${dateRange==='custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'} transition-all`} onClick={()=>setDateRange('custom')}><CalendarIcon className="w-4 h-4 inline-block mr-1" />Custom</button>
        </div>
      </div>
      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      )}

      {/* Metric Cards (real data) */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
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
            <motion.div key={m.key} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:i*0.05}} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-500 mb-1">{m.label}</div>
              <div className="text-3xl font-extrabold">{m.value}</div>
          </motion.div>
        ))}
      </div>
      {/* Interactive Graph Section */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 w-full">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {['events'].map((k) => (
            <button key={k} className={`px-4 py-2 rounded-lg font-semibold text-sm ${graphMetric===k ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'} transition-all`} onClick={()=>setGraphMetric(k)}>Daily Activity</button>
          ))}
          <button className="ml-auto px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-400 to-purple-400 text-white flex items-center gap-1" title="Export (Pro)"><DocumentArrowDownIcon className="w-4 h-4" /> Export</button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <ReTooltip contentStyle={{ borderRadius: 12, fontFamily: 'Poppins, sans-serif' }} />
            <Legend />
            <Line type="monotone" dataKey="analyzer" stroke="#3b82f6" strokeWidth={3} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="seo" stroke="#22c55e" strokeWidth={3} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="writer" stroke="#a855f7" strokeWidth={3} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="brand" stroke="#f59e0b" strokeWidth={3} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="sends" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="opens" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="clicks" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="replies" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Simple breakdown by feature (last 7 days) */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
          {series.map((d) => (
            <div key={d.date} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 flex items-center justify-between">
              <div className="font-semibold">{d.date}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 flex gap-4">
                <span>Analyzer: {d.analyzer}</span>
                <span>SEO: {d.seo}</span>
                <span>Writer: {d.writer}</span>
                <span>Brand: {d.brand}</span>
                            </div>
                          </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 