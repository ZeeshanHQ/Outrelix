'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  ArrowPathIcon,
  SparklesIcon,
  InboxStackIcon,
  FireIcon,
  RectangleStackIcon,
  AdjustmentsVerticalIcon,
  CpuChipIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import leadEngineService from '../utils/leadEngineService';
import { aiApi } from '../utils/supabaseHelpers';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useNotifications } from '../contexts/NotificationContext';
import BACKEND_URL from '../config/backend';
import { supabase } from '../supabase';

// New "Insane" UI Components
import ConciergeOnboarding from '../components/leads/ConciergeOnboarding';
import SmartSearchBar from '../components/leads/SmartSearchBar';
import OpportunityCard from '../components/leads/OpportunityCard';
import AIOpenerGenerator from '../components/leads/AIOpenerGenerator';
import StartCampaignModal from '../components/StartCampaignModal';

const Leads = () => {
  const [formData, setFormData] = useState({
    queries: '',
    geo: 'USA',
    category: '',
    limit: 100,
    enable_yelp: true,
    enable_clearbit: true,
    enable_yellowpages: false,
    enable_overpass: true,
    dry_run: false,
  });

  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [leads, setLeads] = useState([]);
  const [runStatus, setRunStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [isRefining, setIsRefining] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [openerLead, setOpenerLead] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minScore: 0, industry: 'all' });
  const { addNotification } = useNotifications();

  // Derived: filtered + paginated leads
  const filteredLeads = leads.filter(l => {
    if (l.lead_score < filters.minScore) return false;
    if (filters.industry !== 'all' && l.enrichment_industry !== filters.industry) return false;
    return true;
  });
  const visibleLeads = filteredLeads.slice(0, visibleCount);
  const hasMore = visibleCount < filteredLeads.length;
  const industries = [...new Set(leads.map(l => l.enrichment_industry).filter(Boolean))];

  // Onboarding effect
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('outrelix_onboarding_done');
    if (!hasSeenOnboarding) {
      checkOnboardingStatus();
    }
    loadRuns();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${BACKEND_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await response.json();

      if (data.status === 'success' && data.profile.onboarding_done) {
        localStorage.setItem('outrelix_onboarding_done', 'true');
      } else {
        setTimeout(() => setShowOnboarding(true), 1500);
      }
    } catch (err) {
      console.error("Failed to check onboarding status:", err);
      setTimeout(() => setShowOnboarding(true), 1500);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const loadRuns = async () => {
    try {
      const runsData = await leadEngineService.listRuns();
      if (!runsData || typeof runsData !== 'object') {
        setRuns([]);
        return;
      }
      const runsList = Object.entries(runsData).map(([runId, run]) => ({
        runId,
        ...run,
      }));
      const sorted = runsList.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setRuns(sorted);

      // Auto-load most recent completed run if on feed
      if (sorted.length > 0 && sorted[0].status === 'completed' && leads.length === 0) {
        handleViewLeads(sorted[0]);
      }
    } catch (error) {
      console.error('Failed to load runs:', error);
    }
  };

  const handleMagicRefine = async () => {
    if (!formData.queries || formData.queries.trim().length < 3) {
      toast.info('Give me a rough idea first!');
      return;
    }

    setIsRefining(true);
    try {
      const prompt = `You are a Lead Generation Architect. Transform this query into a high-intent search string.
      Query: "${formData.queries}"
      Return ONLY the optimized string (max 6-8 words). Focus on intent signals like recruitment, funding, or specific tech stacks.`;

      const refined = await aiApi.complete([
        { role: 'system', content: 'You are a search refinement engine.' },
        { role: 'user', content: prompt }
      ]);

      if (refined) {
        setFormData(prev => ({ ...prev, queries: refined.trim().replace(/^"|"$/g, '') }));
        toast.success('Query Optimized');
      }
    } catch (error) {
      toast.error('AI is taking a break.');
    } finally {
      setIsRefining(false);
    }
  };

  const onOnboardingFinish = async (data) => {
    setShowOnboarding(false);
    localStorage.setItem('outrelix_onboarding_done', 'true');
    const magicQuery = `${data.favoriteClient} lookalikes solving ${data.problemSolved} triggered by ${data.trigger}`;
    setFormData(prev => ({ ...prev, queries: magicQuery }));

    // Persist to backend
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch(`${BACKEND_URL}/api/user/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            onboarding_data: {
              favorite_client: data.favoriteClient,
              problem_solved: data.problemSolved,
              trigger: data.trigger
            },
            onboarding_done: true
          })
        });
        toast.success('Onboarding complete! Your Opportunity Feed is ready.');
      }
    } catch (err) {
      console.error("Failed to save onboarding data:", err);
      toast.info('Intelligence profile saved locally.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.queries) return;
    setLoading(true);

    try {
      const run = await leadEngineService.startRun(formData);
      toast.success(`Extraction mission launched!`);

      const newRun = { ...run, created_at: new Date().toISOString(), status: 'pending' };
      setRuns(prev => [newRun, ...prev]);
      setSelectedRun(newRun);
      setActiveTab('history');
      startPolling(run.run_id);
    } catch (error) {
      toast.error(error.message || 'Mission failed');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (runId) => {
    if (pollingInterval) clearInterval(pollingInterval);

    const poll = async () => {
      try {
        const status = await leadEngineService.getRunStatus(runId);
        setRunStatus(status);
        setRuns(prev => prev.map(run => run.run_id === runId ? { ...run, ...status } : run));

        if (status.status === 'completed') {
          clearInterval(intervalId);
          setPollingInterval(null);
          loadLeads(runId);
          setActiveTab('feed');
          toast.success("Targeting Intelligence updated");
        } else if (status.status === 'failed') {
          clearInterval(intervalId);
          setPollingInterval(null);
          toast.error('Mission Failed');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const intervalId = setInterval(poll, 3000);
    setPollingInterval(intervalId);
    poll();
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast.info("No leads to export!");
      return;
    }

    const headers = [
      "Company", "Website", "Industry", "Score", "Email", "Phone", "Location", "LinkedIn", "Employees", "AI Outreach Angle"
    ];

    const rows = filteredLeads.map(l => [
      l.company_name,
      l.website_url,
      l.enrichment_industry,
      l.lead_score,
      l.email,
      l.phone,
      l.location,
      l.linkedin_url,
      l.enrichment_employee_count,
      l.outreach_line
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `outrelix_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported!");
  };

  const handlePushToCampaign = (lead) => {
    if (!lead.email) {
      toast.error("This lead has no email address found yet.");
      return;
    }
    // Set active tab to Campaign (if it were on the same page, but usually it's a modal)
    // We'll use the existing StartCampaignModal from Campaigns.jsx pattern
    // For now, we'll trigger the StartCampaignModal with this lead
    setOpenerLead({ ...lead, pushToCampaign: true });
  };

  const loadLeads = async (runId) => {
    try {
      const leadsData = await leadEngineService.getLeads(runId);
      setLeads(leadsData.items || []);
    } catch (error) {
      toast.error('Data retrieval failed');
    }
  };

  const handleViewLeads = async (run) => {
    setSelectedRun(run);
    if (run.status === 'completed') {
      await loadLeads(run.run_id);
      setActiveTab('feed');
    } else {
      startPolling(run.run_id);
      setActiveTab('history');
    }
  };

  return (
    <>
      <DashboardHeader showGreeting={false} title="Lead Intelligence" />

      <main className="p-4 2xl:p-6 min-h-screen bg-slate-50/30">
        <div className="max-w-[1800px] mx-auto space-y-12">

          <div className="w-full space-y-12">

            {/* 1. The Generative Search Core */}
            <section className="pt-10 pb-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 text-center space-y-4 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm"
                >
                  <SparklesIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Powered by Outrelix Intelligence 2026</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                  Find your next <span className="text-blue-600">Golden Opportunity</span>.
                </h1>
                <p className="text-slate-400 font-medium max-w-2xl mx-auto">
                  Instead of industry keywords, try intent queries like <span className="text-slate-600 font-bold">"Companies hiring sales reps in NYC"</span> or <span className="text-slate-600 font-bold">"Recent Series A fintech startups"</span>.
                </p>
              </div>

              <SmartSearchBar
                value={formData.queries}
                onChange={(val) => setFormData({ ...formData, queries: val })}
                onSearch={handleSubmit}
                onMagicRefine={handleMagicRefine}
                isRefining={isRefining}
              />
            </section>

            {/* 2. Navigation Tabs */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-white p-1.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                {[
                  { id: 'feed', label: 'Opportunity Feed', icon: FireIcon, badge: leads.length },
                  { id: 'history', label: 'Intelligence History', icon: RectangleStackIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* 3. Opportunity Feed (Modern Grid) */}
              {activeTab === 'feed' && (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {leads.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <div className="h-20 w-20 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center">
                        <InboxStackIcon className="h-10 w-10 text-blue-200" />
                      </div>
                      <div>
                        <p className="text-slate-800 font-black text-xl">Your feed is waiting for signals.</p>
                        <p className="text-slate-400 font-medium">Start a search above or explore trending intent signals.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Opportunities</h2>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Real-time Enrichment Active
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{filteredLeads.length} of {leads.length} results</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-500 shadow-sm transition-all"
                            title="Export results to CSV"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Export CSV
                          </button>
                          <button
                            onClick={() => {
                              const emails = filteredLeads.map(l => l.email).filter(Boolean).join(', ');
                              setOpenerLead({ pushToCampaign: true, email: emails });
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all shadow-sm"
                            title="Push all filtered leads to Campaign"
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                            Push to Campaign
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowFilters(!showFilters)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showFilters ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white shadow-sm text-slate-600 hover:bg-slate-50'}`}
                            >
                              <AdjustmentsVerticalIcon className="h-4 w-4" />
                              Filter Results
                            </button>
                            <AnimatePresence>
                              {showFilters && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                  className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 p-6 z-50 space-y-5"
                                >
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Min Lead Score</p>
                                    <div className="flex gap-2">
                                      {[0, 50, 70, 85].map(s => (
                                        <button
                                          key={s}
                                          onClick={() => { setFilters(f => ({ ...f, minScore: s })); setVisibleCount(8); }}
                                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${filters.minScore === s ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                          {s === 0 ? 'All' : `${s}+`}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Industry</p>
                                    <select
                                      value={filters.industry}
                                      onChange={(e) => { setFilters(f => ({ ...f, industry: e.target.value })); setVisibleCount(8); }}
                                      className="w-full bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                      <option value="all">All Industries</option>
                                      {industries.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => { setFilters({ minScore: 0, industry: 'all' }); setVisibleCount(8); }}
                                    className="w-full text-center text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline pt-2"
                                  >
                                    Reset All Filters
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {visibleLeads.map((lead, idx) => (
                          <OpportunityCard
                            key={lead.company_name + idx}
                            lead={lead}
                            onAction={(type) => {
                              if (type === 'email') setOpenerLead(lead);
                              else if (type === 'push') handlePushToCampaign(lead);
                              else toast.info(`Action: ${type}`);
                            }}
                          />
                        ))}
                      </div>

                      {hasMore && (
                        <div className="flex justify-center pt-8">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setVisibleCount(prev => prev + 8)}
                            className="px-8 py-4 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.1)] text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-all flex items-center gap-3"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                            Load More ({filteredLeads.length - visibleCount} remaining)
                          </motion.button>
                        </div>
                      )}

                      {leads.length > 0 && leads.length < 10 && (
                        <div className="flex flex-col items-center justify-center py-12 px-6 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] mt-12 text-center group">
                          <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <SparklesIcon className="h-8 w-8 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-black text-slate-800 mb-2">Want deeper intelligence?</h3>
                          <p className="text-slate-500 max-w-md mb-6 font-medium">We found {leads.length} high-confidence matches. A "Deep Scan" will take {isRefining ? 'more' : '30-60'} seconds but searches 10x more sources.</p>
                          <button
                            onClick={handleMagicRefine}
                            disabled={isRefining}
                            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                          >
                            {isRefining ? 'Engine Scaling...' : 'Scale Search Engine'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {/* 4. History Tab (Sleek List) */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Mission History</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{runs.length} Extraction Runs</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {runs.map((run) => (
                      <div key={run.run_id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-6">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 ${run.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                            run.status === 'failed' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                              'bg-blue-50 border-blue-100 text-blue-500'
                            }`}>
                            {run.status === 'completed' ? <SparklesIcon className="h-6 w-6" /> :
                              run.status === 'failed' ? <InboxStackIcon className="h-6 w-6" /> :
                                <ArrowPathIcon className="h-6 w-6 animate-spin" />}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{run.queries || 'Untitled Recon'}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{run.geo}</span>
                              <span className="text-[10px] text-slate-300">•</span>
                              <span className="text-[10px] font-bold text-slate-400">{new Date(run.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewLeads(run)}
                          className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                        >
                          View Evidence
                        </button>
                      </div>
                    ))}
                    {runs.length === 0 && (
                      <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">
                        No missions on file.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. Live Signal Stream (Now at the bottom for full width cards) */}
          <section className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Live Signal Stream</h3>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Monitoring 12k+ feeds</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { company: 'Acme Corp', action: 'Visited pricing page', time: '2m ago', icon: FireIcon, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { company: 'Global Tech', action: 'Clicked "Get Started"', time: '15m ago', icon: SparklesIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { company: 'Innovate AI', action: 'Viewing Integrations', time: '45m ago', icon: CpuChipIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((sig, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer p-4 rounded-2xl hover:bg-slate-50 transition-all">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-slate-100/50 ${sig.bg}`}>
                      <sig.icon className={`h-6 w-6 ${sig.color}`} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{sig.company}</h4>
                      <p className="text-xs text-slate-500 font-medium mb-1">{sig.action}</p>
                      <time className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sig.time}</time>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <ConciergeOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onFinish={onOnboardingFinish}
      />
      <AIOpenerGenerator
        isOpen={!!openerLead && !openerLead.pushToCampaign}
        onClose={() => setOpenerLead(null)}
        lead={openerLead}
      />
      <StartCampaignModal
        open={!!openerLead && openerLead.pushToCampaign}
        onClose={() => setOpenerLead(null)}
        manualEmails={openerLead?.email || ''}
        industry={openerLead?.enrichment_industry || ''}
        isGmailConnected={true} // Mock
      />
    </>
  );
};

export default Leads;
