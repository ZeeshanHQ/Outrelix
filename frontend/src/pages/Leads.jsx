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
  PaperAirplaneIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  TrashIcon
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
  const [initialLoading, setInitialLoading] = useState(true);
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
    loadRuns().finally(() => setInitialLoading(false));
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
      const runsList = Object.entries(runsData).map(([id, run]) => ({
        run_id: id,
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
      setActiveTab('feed');
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
    setLoading(true);
    try {
      const leadsData = await leadEngineService.getLeads(runId);
      setLeads(leadsData.items || []);
    } catch (error) {
      toast.error('Data retrieval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRun = async (e, runId) => {
    e.stopPropagation(); // Don't trigger handleViewLeads
    
    if (!window.confirm("Are you sure you want to delete this mission? This cannot be undone.")) {
      return;
    }

    try {
      await leadEngineService.deleteRun(runId);
      setRuns(prev => prev.filter(r => r.run_id !== runId));
      toast.success("Mission deleted");
      
      // If we're looking at the run we just deleted, clear it
      if (selectedRun?.run_id === runId) {
        setSelectedRun(null);
        setLeads([]);
      }
    } catch (error) {
      toast.error("Failed to delete mission");
      console.error(error);
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

      <main className="p-4 md:p-8 2xl:p-12 min-h-screen bg-white transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-28 scale-[0.90] origin-top">

          <div className="w-full space-y-20 lg:space-y-28">

            {/* 1. The Generative Search Core */}
            <section className="pt-16 lg:pt-24 pb-10 relative">
              <div className="relative z-10 text-center space-y-4 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2.5 px-5 py-2 bg-white border border-slate-100 rounded-full shadow-sm mb-6"
                >
                  <SparklesIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Powered by Outrelix Intelligence 2026</span>
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
              <div className="inline-flex items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                {[
                  { id: 'feed', label: 'Opportunity Feed', icon: FireIcon, badge: leads.length },
                  { id: 'history', label: 'Intelligence History', icon: RectangleStackIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                  >
                    <tab.icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
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
                  {initialLoading || loading || pollingInterval ? (
                    <div className="py-12 text-center space-y-12 relative z-10">
                       <div className="flex justify-center -mb-8 relative z-20">
                         <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_-5px_var(--tw-shadow-color)] shadow-blue-500/40 relative">
                             <div className="absolute inset-0 rounded-full border-[3px] border-white/20 border-t-white animate-spin"></div>
                             <div className="h-[4.5rem] w-[4.5rem] bg-white rounded-full flex items-center justify-center shadow-inner">
                                 <SparklesIcon className="h-8 w-8 text-blue-600 animate-pulse" />
                             </div>
                         </div>
                       </div>
                       <div className="space-y-2 relative z-20 bg-white/80 backdrop-blur-xl inline-block px-10 py-5 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                         <h3 className="text-2xl font-black text-slate-800 tracking-tight animate-pulse">Extracting Opportunities...</h3>
                         <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Analyzing 12k+ data points globally</p>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                          {Array.from({ length: 6 }).map((_, i) => (
                             <div key={i} className="bg-white rounded-[2rem] border border-slate-100 h-[26rem] overflow-hidden flex flex-col relative transition-all">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/30 -z-10" />
                                <div className="h-28 bg-slate-50/50 border-b border-slate-50 relative overflow-hidden">
                                    <div className="absolute -bottom-6 left-8 h-16 w-16 rounded-[1.25rem] bg-white shadow-sm border border-slate-100 animate-pulse" />
                                </div>
                                <div className="p-8 pt-12 flex-1 flex flex-col relative">
                                    <div className="h-6 w-3/4 bg-slate-100 rounded-lg animate-pulse mb-2" />
                                    <div className="h-4 w-1/2 bg-slate-50 rounded-lg animate-pulse" />
                                    <div className="mt-8 mb-4">
                                        <div className="h-24 w-full bg-blue-50/50 rounded-2xl animate-pulse" />
                                    </div>
                                    <div className="mt-auto flex gap-4 pt-6 border-t border-slate-50">
                                        <div className="h-12 flex-1 bg-slate-100 rounded-xl animate-pulse" />
                                        <div className="h-12 w-12 shrink-0 bg-slate-50 rounded-xl animate-pulse" />
                                    </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="py-24 text-center space-y-8 relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-sm">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_70%)]" />
                      <div className="relative z-10">
                        <div className="h-24 w-24 bg-blue-50 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
                          <InboxStackIcon className="h-12 w-12 text-blue-400 opacity-40" />
                        </div>
                        <div className="space-y-4 max-w-md mx-auto">
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your intelligence feed is primed.</h3>
                          <p className="text-slate-500 font-medium px-6 leading-relaxed">
                            No matching signals detected for this specific matrix. Try adjusting your search query or geo-target for broader discovery.
                          </p>
                          <div className="pt-4 flex flex-wrap justify-center gap-3">
                            {['Real Estate in Miami', 'SaaS Founders', 'Web Design Agencies'].map(suggestion => (
                              <button 
                                key={suggestion}
                                onClick={() => setQueryParams(q => ({ ...q, queries: suggestion }))}
                                className="px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-xs font-bold text-slate-500 transition-all border border-slate-100"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-100">
                        <div className="flex items-center gap-5">
                          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight gap-2 flex items-center">
                            <FireIcon className="w-6 h-6 text-blue-600" />
                            Active Opportunities
                          </h2>
                          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100 shadow-sm shadow-emerald-100/50">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Real-time Enrichment Active
                          </div>
                          <span className="text-xs font-bold text-slate-400 opacity-80">{filteredLeads.length} of {leads.length} results</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:shadow-sm transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
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
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-blue-200 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                            title="Push all filtered leads to Campaign"
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                            Push to Campaign
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowFilters(!showFilters)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${showFilters ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-transparent' : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
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
                                  className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-8 z-50 space-y-6"
                                >
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Min Lead Score</p>
                                    <div className="flex gap-2">
                                      {[0, 50, 70, 85].map(s => (
                                        <button
                                          key={s}
                                          onClick={() => { setFilters(f => ({ ...f, minScore: s })); setVisibleCount(8); }}
                                          className={`px-3 py-1.5 flex-1 rounded-lg text-xs font-bold transition-all ${filters.minScore === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800'}`}
                                        >
                                          {s === 0 ? 'All' : `${s}+`}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Industry</p>
                                    <select
                                      value={filters.industry}
                                      onChange={(e) => { setFilters(f => ({ ...f, industry: e.target.value })); setVisibleCount(8); }}
                                      className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                                    >
                                      <option value="all">All Industries</option>
                                      {industries.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => { setFilters({ minScore: 0, industry: 'all' }); setVisibleCount(8); }}
                                    className="w-full text-center text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors pt-2"
                                  >
                                    Reset All Filters
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <div className="flex justify-center pt-12 pb-8">
                          <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setVisibleCount(prev => prev + 8)}
                            className="px-10 py-5 bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-blue-300 text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-all flex items-center gap-3"
                          >
                            <ArrowPathIcon className="h-5 w-5" />
                            Load More ({filteredLeads.length - visibleCount} remaining)
                          </motion.button>
                        </div>
                      )}

                      {leads.length > 0 && leads.length < 10 && (
                        <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] mt-12 text-center group">
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

              {/* 4. History Tab (Elite Grid) */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-6xl mx-auto"
                >
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Intelligence Archive</h2>
                      <p className="text-slate-500 font-medium">Access and analyze your previous discovery missions.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{runs.length} Saved Recon</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {runs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((run) => (
                      <motion.div
                        key={run.run_id}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 flex items-center">
                          <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${run.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                            run.status === 'failed' ? 'bg-rose-50 text-rose-600' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                            {run.status}
                          </div>
                          
                          {/* Delete Action */}
                          <button
                            onClick={(e) => handleDeleteRun(e, run.run_id)}
                            className="ml-2 p-1 text-slate-300 hover:text-rose-500 transition-colors"
                            title="Delete mission history"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border-2 ${run.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                          run.status === 'failed' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                            'bg-blue-50 border-blue-100 text-blue-500'
                          }`}>
                          {run.status === 'completed' ? <SparklesIcon className="h-7 w-7" /> :
                            run.status === 'failed' ? <InboxStackIcon className="h-7 w-7" /> :
                              <ArrowPathIcon className="h-7 w-7 animate-spin" />}
                        </div>

                        <h4 className="text-lg font-black text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors" title={run.queries}>
                          {run.queries || 'Untitled Recon'}
                        </h4>

                        <div className="space-y-3 mb-8">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-slate-300" />
                            <span className="text-xs font-bold text-slate-500">{run.geo || 'Global'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-slate-300" />
                            <span className="text-xs font-bold text-slate-500">{new Date(run.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserGroupIcon className="h-4 w-4 text-slate-300" />
                            <span className="text-xs font-black text-blue-600">{run.leads_count || 0} Matches Found</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleViewLeads(run)}
                          className="w-full py-4 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-transparent hover:shadow-lg hover:shadow-blue-100"
                        >
                          Access Intelligence
                        </button>
                      </motion.div>
                    ))}
                    
                    {runs.length === 0 && (
                      <div className="col-span-full py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 text-center">
                        <div className="h-20 w-20 bg-white rounded-3xl shadow-sm mx-auto flex items-center justify-center mb-6">
                          <InboxIcon className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Archive Empty</h3>
                        <p className="text-slate-400 font-medium mt-2">No intelligence missions have been logged yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. Live Signal Stream (Now at the bottom for full width cards) */}
          <section className="space-y-6 pt-12">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 lg:p-12 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-4 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Live Signal Stream</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Monitoring 12k+ feeds</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {[
                  { company: 'Acme Corp', action: 'Visited pricing page', time: '2m ago', icon: FireIcon, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
                  { company: 'Global Tech', action: 'Clicked "Get Started"', time: '15m ago', icon: SparklesIcon, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                  { company: 'Innovate AI', action: 'Viewing Integrations', time: '45m ago', icon: CpuChipIcon, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
                ].map((sig, i) => (
                  <div key={i} className="flex gap-5 cursor-pointer bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border ${sig.bg}`}>
                      <sig.icon className={`h-6 w-6 ${sig.color}`} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-blue-600 transition-colors">{sig.company}</h4>
                      <p className="text-sm text-slate-500 font-medium mb-1.5">{sig.action}</p>
                      <time className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sig.time}</time>
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
