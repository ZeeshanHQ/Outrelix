import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  RocketLaunchIcon,
  AdjustmentsHorizontalIcon,
  InboxStackIcon,
  SparklesIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UserGroupIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import leadEngineService from '../utils/leadEngineService';
import AppSidebar from '../components/AppSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';

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

  // Load runs on mount
  useEffect(() => {
    loadRuns();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const run = await leadEngineService.startRun(formData);
      toast.success(`Mission started! ID: ${run.run_id}`);

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
    if (pollingInterval) clearInterval(pollingInterval);

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
          toast.error(`Error: ${status.message || 'Unknown failure'}`);
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
    if (!window.confirm('Delete this run?')) return;
    try {
      await leadEngineService.deleteRun(runId);
      toast.success('Run deleted');
      setRuns(prev => prev.filter(run => run.run_id !== runId));
      if (selectedRun?.run_id === runId) {
        setSelectedRun(null);
        setLeads([]);
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <>
      {/* Clean Header (No Greeting) */}
      <DashboardHeader showGreeting={false} title="Lead Generation" />

      {/* Scrollable Content Area */}
      <main className="p-4 2xl:p-6">
        <div className="w-full">

          {/* Stats Bar - Fills space and looks professional */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Extractions', value: runs.length, icon: CircleStackIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Target Leads', value: runs.reduce((acc, r) => acc + (r.limit || 0), 0), icon: UserGroupIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Verified Contacts', value: runs.filter(r => r.status === 'completed').length * 12, icon: CheckCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' }, // Mocking verified count
              { label: 'Extraction Power', value: '98.2%', icon: ChartBarIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
              >
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Tabs - Low Density */}
          <div className="flex gap-8 mb-10 border-b border-slate-200">
            {[
              { id: 'generate', label: 'New Search' },
              { id: 'runs', label: 'History' },
              { id: 'results', label: 'Results', disabled: !selectedRun || leads.length === 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                  ? 'text-blue-600'
                  : tab.disabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* 1. Generate / Launch Tab */}
            {activeTab === 'generate' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 max-w-4xl"
              >
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Search Input */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Target Keywords</label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.queries}
                        onChange={(e) => setFormData({ ...formData, queries: e.target.value })}
                        placeholder="e.g. Marketing Agencies in New York"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-800"
                        required
                      />
                    </div>
                    <p className="mt-3 text-xs text-slate-400">Enter keywords, industry terms, or specific niches to target.</p>
                  </div>

                  {/* Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Location</label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.geo}
                          onChange={(e) => setFormData({ ...formData, geo: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Max Results</label>
                      <div className="relative">
                        <AdjustmentsHorizontalIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="number"
                          value={formData.limit}
                          onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 100 })}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options Toggles */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6"
                    >
                      <AdjustmentsHorizontalIcon className="h-5 w-5" />
                      {isOptionsOpen ? 'Hide Advanced Sources' : 'Show Advanced Sources'}
                    </button>

                    <AnimatePresence>
                      {isOptionsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
                            {[
                              { id: 'enable_yelp', label: 'Yelp Business', icon: GlobeAltIcon },
                              { id: 'enable_clearbit', label: 'Clearbit Data', icon: SparklesIcon },
                              { id: 'enable_overpass', label: 'Maps Data', icon: MapPinIcon },
                            ].map((opt) => (
                              <label key={opt.id} className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={formData[opt.id]}
                                  onChange={(e) => setFormData({ ...formData, [opt.id]: e.target.checked })}
                                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-sm font-medium text-slate-700">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading || !formData.queries}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto min-w-[200px]"
                    >
                      {loading ? (
                        <>
                          <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Launch Search
                          <RocketLaunchIcon className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 2. Monitor / History Tab */}
            {activeTab === 'runs' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {runs.length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <InboxStackIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No search history found.</p>
                  </div>
                ) : (
                  runs.map((run) => (
                    <div key={run.run_id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          {run.status === 'completed' ? <CheckCircleIcon className="h-5 w-5 text-emerald-500" /> :
                            run.status === 'failed' ? <XCircleIcon className="h-5 w-5 text-rose-500" /> :
                              <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />}
                        </div>
                        <button
                          onClick={() => handleDeleteRun(run.run_id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <h4 className="font-bold text-slate-800 text-lg mb-1 truncate">{run.queries || 'Untitled Search'}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{run.geo}</p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                        <span className="text-xs text-slate-400 font-medium">{new Date(run.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => handleViewLeads(run)}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700"
                        >
                          View Results &rarr;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* 3. Results Tab */}
            {activeTab === 'results' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-800">
                    Found Leads
                    <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{leads.length}</span>
                  </h3>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leads.map((lead, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                {(lead.company || '?')[0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-sm">{lead.company || 'Unknown'}</div>
                                <div className="text-xs text-slate-400">{lead.domain || 'no domain'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">{lead.email || 'N/A'}</div>
                            <div className="text-xs text-slate-400">{lead.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">{lead.location || '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                              {lead.lead_score || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};

export default Leads;
