import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CalendarIcon, ArrowTrendingUpIcon, EnvelopeIcon, CheckCircleIcon, LockClosedIcon, ArrowDownRightIcon, ArrowUpRightIcon, ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const mockMetrics = [
  {
    label: 'Total Emails Sent',
    value: 1200,
    change: 8.2,
    icon: <EnvelopeIcon className="w-7 h-7 text-blue-500" />, 
    tooltip: 'Total number of emails sent in the selected period.'
  },
  {
    label: 'Open Rate',
    value: '62%',
    change: -2.1,
    icon: <ArrowTrendingUpIcon className="w-7 h-7 text-green-500" />, 
    tooltip: 'Percentage of sent emails that were opened.'
  },
  {
    label: 'Click-through Rate',
    value: '18%',
    change: 1.5,
    icon: <ChartBarIcon className="w-7 h-7 text-purple-500" />, 
    tooltip: 'Percentage of opened emails that were clicked.'
  },
  {
    label: 'Positive Reply Rate',
    value: '9%',
    change: 0.7,
    icon: <CheckCircleIcon className="w-7 h-7 text-yellow-500" />, 
    tooltip: 'Percentage of emails that received a positive reply.'
  },
];

const mockGraphData = [
  { date: 'Mon', sent: 200, opened: 120, clicked: 40, replied: 18 },
  { date: 'Tue', sent: 180, opened: 110, clicked: 35, replied: 15 },
  { date: 'Wed', sent: 220, opened: 140, clicked: 50, replied: 20 },
  { date: 'Thu', sent: 210, opened: 130, clicked: 45, replied: 19 },
  { date: 'Fri', sent: 190, opened: 100, clicked: 30, replied: 12 },
  { date: 'Sat', sent: 160, opened: 90, clicked: 25, replied: 10 },
  { date: 'Sun', sent: 140, opened: 80, clicked: 20, replied: 8 },
];

const mockCampaigns = [
  {
    id: 1,
    name: 'Real Estate Outreach',
    industry: 'Real Estate',
    sent: 450,
    opened: 320,
    clicked: 90,
    replied: 45,
    status: 'Running',
    topSubjects: ['Grow your real estate business', 'Unlock new leads today'],
    isPro: false,
  },
  {
    id: 2,
    name: 'Tech Companies',
    industry: 'Technology',
    sent: 300,
    opened: 210,
    clicked: 70,
    replied: 35,
    status: 'Completed',
    topSubjects: ['AI for Tech Growth', 'Automate your outreach'],
    isPro: true,
  },
];

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
  const [tab, setTab] = useState('all');
  const [graphMetric, setGraphMetric] = useState('sent');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen w-full font-poppins relative">
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
      {/* Tabs/Filters */}
        <div className="max-w-5xl mx-auto flex gap-2 mb-6 w-full">
        <button className={`px-4 py-2 rounded-lg font-semibold text-sm ${tab==='all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'} transition-all`} onClick={()=>setTab('all')}>All Campaigns</button>
        <button className={`px-4 py-2 rounded-lg font-semibold text-sm ${tab==='industry' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'} transition-all`} onClick={()=>setTab('industry')}>By Industry</button>
        <button className={`px-4 py-2 rounded-lg font-semibold text-sm ${tab==='type' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'} transition-all`} onClick={()=>setTab('type')}>By Email Type</button>
      </div>
      {/* Metric Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
        {mockMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col gap-2 relative"
          >
            <div className="flex items-center gap-2 mb-1">
              {m.icon}
                <span className="text-lg font-bold text-blue-900 dark:text-white">{m.label}</span>
                <span className="ml-1 cursor-pointer text-gray-400 dark:text-gray-300" title={m.tooltip}>?</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-blue-900 dark:text-white">{m.value}</span>
                <span className={`flex items-center text-sm font-bold ${m.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{m.change >= 0 ? <ArrowUpRightIcon className="w-4 h-4" /> : <ArrowDownRightIcon className="w-4 h-4" />} {Math.abs(m.change)}%</span>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Interactive Graph Section */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 w-full">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {metricKeys.map((m) => (
            <button key={m.key} className={`px-4 py-2 rounded-lg font-semibold text-sm ${graphMetric===m.key ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'} transition-all`} onClick={()=>setGraphMetric(m.key)}>{m.label}</button>
          ))}
          <button className="ml-auto px-4 py-2 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-400 to-purple-400 text-white flex items-center gap-1" title="Export (Pro)"><DocumentArrowDownIcon className="w-4 h-4" /> Export</button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={mockGraphData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <ReTooltip contentStyle={{ borderRadius: 12, fontFamily: 'Poppins, sans-serif' }} />
            <Legend />
            <Line type="monotone" dataKey={graphMetric} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey={graphMetric} stroke="#a855f7" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Previous Period" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Campaign Breakdown Table */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-8 overflow-x-auto w-full">
        <table className="min-w-full text-sm font-poppins">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-800">
              <th className="py-2">Campaign Name</th>
              <th className="py-2">Industry</th>
              <th className="py-2">Sent</th>
              <th className="py-2">Opened</th>
              <th className="py-2">Clicked</th>
              <th className="py-2">Replied</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {mockCampaigns.map((c) => (
              <React.Fragment key={c.id}>
                <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-all">
                  <td className="py-2 font-bold text-gray-900 dark:text-white">{c.name}</td>
                  <td className="py-2">{c.industry}</td>
                  <td className="py-2">{c.sent}</td>
                  <td className="py-2">{c.opened}</td>
                  <td className="py-2">{c.clicked}</td>
                  <td className="py-2">{c.replied}</td>
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[c.status]}`}>{c.status}</span></td>
                  <td className="py-2"><button className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold" onClick={()=>setExpanded(expanded===c.id?null:c.id)}>View</button></td>
                </tr>
                <tr>
                  <td colSpan={8} className="p-0">
                    <AnimatePresence>
                      {expanded===c.id && (
                        <motion.td
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 rounded-2xl p-6 border border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden"
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Email Sequence Performance */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold mb-2 text-lg">Email Sequence Performance</h4>
                              <BarChart width={250} height={120} data={[
                                { name: 'Email 1', open: 80, click: 30, reply: 10 },
                                { name: 'Email 2', open: 60, click: 20, reply: 8 },
                                { name: 'Email 3', open: 40, click: 10, reply: 5 },
                              ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Bar dataKey="open" fill="#3b82f6" />
                                <Bar dataKey="click" fill="#a855f7" />
                                <Bar dataKey="reply" fill="#22c55e" />
                              </BarChart>
                            </div>
                            {/* Heatmap & AI Insights (Locked) */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              <div className="flex items-center gap-2 mb-1">
                                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-xs text-gray-500">Engagement Heatmap <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span></span>
                                <span className="ml-1 cursor-pointer underline text-blue-500" title="Unlock with Pro Plan">?</span>
                              </div>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs text-gray-400 blur-sm select-none pointer-events-none mb-2">Upgrade to Pro to see time-based engagement heatmaps!</div>
                              <div className="flex items-center gap-2 mb-1">
                                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-xs text-gray-500">AI Insights <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span></span>
                                <span className="ml-1 cursor-pointer underline text-blue-500" title="Unlock with Pro Plan">?</span>
                              </div>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs text-gray-400 blur-sm select-none pointer-events-none mb-2">AI-powered insights and recommendations available in Pro.</div>
                              <div className="flex items-center gap-2 mb-1">
                                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-xs text-gray-500">Best Send Time Predictor <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span></span>
                                <span className="ml-1 cursor-pointer underline text-blue-500" title="Unlock with Pro Plan">?</span>
                              </div>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs text-gray-400 blur-sm select-none pointer-events-none mb-2">Unlock Pro to get AI-powered send time recommendations.</div>
                              <div className="flex items-center gap-2 mb-1">
                                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-xs text-gray-500">Industry Benchmark Comparison <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span></span>
                                <span className="ml-1 cursor-pointer underline text-blue-500" title="Unlock with Pro Plan">?</span>
                              </div>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs text-gray-400 blur-sm select-none pointer-events-none mb-2">Compare your results to industry benchmarks with Pro.</div>
                              <div className="flex items-center gap-2 mb-1">
                                <LockClosedIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-xs text-gray-500">Conversion Score & Recommendations <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span></span>
                                <span className="ml-1 cursor-pointer underline text-blue-500" title="Unlock with Pro Plan">?</span>
                              </div>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs text-gray-400 blur-sm select-none pointer-events-none mb-2">Unlock Pro to get conversion scoring and actionable recommendations.</div>
                            </div>
                            {/* Top Subject Lines */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold mb-2 text-lg">Top Subject Lines</h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                {c.topSubjects.map((s, i) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.td>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 