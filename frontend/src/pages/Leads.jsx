import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  GlobeAltIcon,
  AdjustmentsHorizontalIcon,
  InboxStackIcon,
  MapPinIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import gsap from 'gsap';
import leadEngineService from '../utils/leadEngineService';
import AppSidebar from '../components/AppSidebar';

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
  const [activeTab, setActiveTab] = useState('generate');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const heroRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load runs on mount
  useEffect(() => {
    loadRuns();
  }, []);

  // GSAP Hero Animation
  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const loadRuns = async () => {
    try {
      const runsData = await leadEngineService.listRuns();
      const runsList = Object.entries(runsData).map(([runId, run]) => ({
        runId,
        ...run,
      }));
      setRuns(runsList.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
    } catch (error) {
      console.error('Failed to load runs:', error);
      // Silently handle if not integrated yet
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Animation trigger on search
      if (searchInputRef.current) {
        gsap.to(searchInputRef.current, {
          scale: 1.02,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
      }

      const run = await leadEngineService.startRun(formData);
      toast.success(`Mission started! Identification: ${run.run_id}`);

      const newRun = { ...run, created_at: new Date().toISOString() };
      setRuns(prev => [newRun, ...prev]);
      setSelectedRun(newRun);
      setRunStatus(newRun);
      setActiveTab('runs');

      startPolling(run.run_id);
    } catch (error) {
      console.error('Failed to start lead generation:', error);
      toast.error(error.message || 'Mission failed to launch');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (runId) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const poll = async () => {
      try {
        const status = await leadEngineService.getRunStatus(runId);
        setRunStatus(status);

        setRuns(prev => prev.map(run =>
          run.run_id === runId ? { ...run, ...status } : run
        ));

        if (status.status === 'completed') {
          clearInterval(intervalId);
          setPollingInterval(null);
          loadLeads(runId);
          toast.success('Lead extraction complete!');
        } else if (status.status === 'failed') {
          clearInterval(intervalId);
          setPollingInterval(null);
          toast.error(`System Error: ${status.message || 'Core failure'}`);
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    };

    const intervalId = setInterval(poll, 3000);
    setPollingInterval(intervalId);
    poll();
  };

  const loadLeads = async (runId) => {
    try {
      const leadsData = await leadEngineService.getLeads(runId);
      setLeads(leadsData.items || []);
    } catch (error) {
      console.error('Failed to load leads:', error);
      toast.error('Data retrieval failed');
    }
  };

  const handleViewLeads = async (run) => {
    setSelectedRun(run);
    setRunStatus(run);

    if (run.status === 'completed') {
      await loadLeads(run.run_id);
      setActiveTab('results');
    } else {
      startPolling(run.run_id);
      setActiveTab('runs');
    }
  };

  const handleDeleteRun = async (runId) => {
    if (!window.confirm('Terminate this run and purge data?')) return;

    try {
      await leadEngineService.deleteRun(runId);
      toast.success('Run purged');
      setRuns(prev => prev.filter(run => run.run_id !== runId));
      if (selectedRun?.run_id === runId) {
        setSelectedRun(null);
        setLeads([]);
      }
    } catch (error) {
      toast.error('Purge failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-poppins selection:bg-blue-500/30">
      <AppSidebar />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 p-4 md:p-8 ml-0 md:ml-0 transition-all duration-300">
        {/* Header Section */}
        <motion.div
          ref={heroRef}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-8 bg-blue-500" />
            <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">Outrelix Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Lead <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Engine</span>
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
            Harness the power of AI-driven web scraping and data enrichment to find your next high-value customers. Perfectly targeted, instantly verified.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/10 overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'generate', label: 'Launch', icon: RocketLaunchIcon },
            { id: 'runs', label: 'Monitor', icon: ChartBarIcon, count: runs.length },
            { id: 'results', label: 'Intelligence', icon: SparklesIcon, count: leads.length, hidden: !selectedRun || leads.length === 0 }
          ].map((tab) => !tab.hidden && (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10 text-gray-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Launch Tab */}
          {activeTab === 'generate' && (
            <motion.div
              layoutId="tab-content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div
                    ref={searchInputRef}
                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 transition-all hover:border-blue-500/50 shadow-2xl"
                  >
                    <div className="absolute top-4 right-6 hidden md:flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      Neural Scanner Ready
                    </div>

                    <label className="block text-sm font-semibold text-gray-400 mb-4">Target Search Queries</label>
                    <div className="relative">
                      <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors ${formData.queries ? 'text-blue-500' : 'text-gray-600'}`} />
                      <input
                        type="text"
                        required
                        value={formData.queries}
                        onChange={(e) => setFormData({ ...formData, queries: e.target.value })}
                        placeholder="e.g. SaaS companies, tech startups, marketing agencies..."
                        className="w-full pl-14 pr-6 py-6 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xl font-medium placeholder:text-gray-700 transition-all focus:bg-white/[0.08]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Geographic Focus</label>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                          <input
                            type="text"
                            required
                            value={formData.geo}
                            onChange={(e) => setFormData({ ...formData, geo: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Volume Limit</label>
                        <div className="relative">
                          <AdjustmentsHorizontalIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                          <input
                            type="number"
                            value={formData.limit}
                            onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 100 })}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <button
                      type="button"
                      onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors px-4 py-2"
                    >
                      <AdjustmentsHorizontalIcon className="h-5 w-5" />
                      Advanced Enrichment Options
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !formData.queries}
                      className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {loading ? (
                        <>
                          <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          Booting...
                        </>
                      ) : (
                        <>
                          Launch Engine
                          <RocketLaunchIcon className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isOptionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[
                            { id: 'enable_yelp', label: 'Yelp Extraction', icon: GlobeAltIcon },
                            { id: 'enable_clearbit', label: 'Clearbit Enrichment', icon: SparklesIcon },
                            { id: 'enable_overpass', label: 'OpenStreetMap Data', icon: MapPinIcon },
                            { id: 'dry_run', label: 'Diagnostic Mode', icon: AdjustmentsHorizontalIcon },
                          ].map(opt => (
                            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={formData[opt.id]}
                                onChange={(e) => setFormData({ ...formData, [opt.id]: e.target.checked })}
                                className="hidden"
                              />
                              <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${formData[opt.id] ? 'bg-blue-600 border-blue-500' : 'border-white/20 bg-white/5'}`}>
                                {formData[opt.id] && <CheckCircleIcon className="h-4 w-4" />}
                              </div>
                              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <SparklesIcon className="h-8 w-8 text-blue-400/20" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Intelligence Report
                  </h3>
                  <p className="text-gray-400 text-sm leading-loose">
                    Our lead engine performs <span className="text-white font-medium">deep neural validation</span>. By cross-referencing multiple data providers, we eliminate dead ends and outdated entries.
                  </p>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">98%</div>
                      <div className="text-xs text-gray-400">Data Reliability</div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">12x</div>
                      <div className="text-xs text-gray-400">Faster Extraction</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Monitor Tab */}
          {activeTab === 'runs' && (
            <motion.div
              layoutId="tab-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                  <InboxStackIcon className="h-16 w-16 text-gray-700 mb-4" />
                  <p className="text-gray-500 font-medium">No missions active.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {runs.map((run) => (
                    <motion.div
                      key={run.run_id}
                      layout
                      className="group bg-white/5 hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-2 rounded-xl ${run.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                            run.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                              'bg-blue-500/20 text-blue-500'
                          }`}>
                          {run.status === 'completed' ? <CheckCircleIcon className="h-6 w-6" /> :
                            run.status === 'failed' ? <XCircleIcon className="h-6 w-6" /> :
                              <ArrowPathIcon className="h-6 w-6 animate-spin" />}
                        </div>
                        <button
                          onClick={() => handleDeleteRun(run.run_id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-500 transition-all z-20"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <h3 className="text-lg font-bold truncate mb-1">{run.queries || 'Extraction Session'}</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">{run.geo || 'Global Scope'}</p>

                      {run.status === 'running' && (
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                            <span>Processing</span>
                            <span>{Math.round((run.progress || 0) * 100)}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(run.progress || 0) * 100}%` }}
                              className="bg-blue-500 h-full rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <span className="text-[10px] text-gray-600 font-bold tracking-tighter">
                          {new Date(run.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleViewLeads(run)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${run.status === 'completed'
                              ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white'
                              : 'text-gray-500 cursor-not-allowed opacity-50'
                            }`}
                        >
                          {run.status === 'completed' ? 'View Intel' : 'Working...'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Intelligence Tab */}
          {activeTab === 'results' && (
            <motion.div
              layoutId="tab-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Verified Units
                    <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">{leads.length}</span>
                  </h2>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold border border-white/10 transition-all">
                    Export Data
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white/[0.01]">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10">Target Entity</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10">Channel Control</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10">Location</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10">Sentiment</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 text-right">Neural Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {leads.map((lead, index) => {
                      // Mock Sentiment Data for Demo (Randomized based on score)
                      const score = lead.lead_score || Math.floor(Math.random() * 40) + 60;
                      const sentiment = score > 85 ? 'hot' : score > 70 ? 'warm' : 'neutral';

                      return (
                        <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold border border-blue-500/20">
                                {(lead.company || '?')[0]}
                              </div>
                              <div>
                                <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{lead.company || 'Unknown Entity'}</div>
                                <div className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{lead.domain || 'direct_entry'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                {lead.email || 'N/A'}
                                {lead.email_valid && <span className="text-[8px] bg-green-500/20 text-green-500 border border-green-500/30 px-1 rounded">SECURE</span>}
                              </div>
                              <div className="text-[10px] text-gray-600 font-bold tracking-widest">{lead.phone || 'NO COORDS'}</div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-sm text-gray-400">{lead.location || 'Universal'}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${sentiment === 'hot' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                sentiment === 'warm' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                  'bg-slate-500/10 border-slate-500/20 text-slate-400'
                              }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sentiment === 'hot' ? 'bg-red-500 animate-pulse' :
                                  sentiment === 'warm' ? 'bg-amber-500' :
                                    'bg-slate-500'
                                }`} />
                              <span className="text-[10px] font-bold uppercase tracking-wide">
                                {sentiment === 'hot' ? 'Ready to Buy' : sentiment === 'warm' ? 'Curious' : 'Passive'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <div className="flex flex-col items-end gap-1">
                                <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${score > 80 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                                        score > 50 ? 'bg-blue-500' : 'bg-slate-600'
                                      }`}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                              <span className={`text-lg font-black font-mono ${score > 80 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-gray-500'
                                }`}>{score}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx="true">{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Leads;
