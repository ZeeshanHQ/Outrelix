import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Rocket, Target, Globe, Mail as LucideMail, ShieldCheck } from 'lucide-react';
import MissionBuilder from '../components/MissionBuilder';
import ConnectGmailModal from '../components/ConnectGmailModal';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import TagInput from '../components/TagInput';
import NoteInput from '../components/NoteInput';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import {
  ArrowDownTrayIcon,
  AdjustmentsVerticalIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  InboxStackIcon,
  FireIcon,
  RectangleStackIcon,
  SparklesIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EnvelopeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import {
  getUserPlan,
  getCurrentPlanLimits,
  canCreateCampaign,
  updateCampaignStatus,
  getUpgradeMessage,
  getPlanStatusMessage,
  getCampaignStatusInfo
} from '../utils/planManager';
import axios from '../utils/axios';
import { useGmailStatus } from '../utils/GmailStatusContext';
import { useNotifications } from '../contexts/NotificationContext';

const statusColors = {
  Running: 'bg-green-100 text-green-700',
  Paused: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-blue-100 text-blue-700',
  Expired: 'bg-red-100 text-red-700',
  Locked: 'bg-gray-100 text-gray-700',
};

const Campaigns = () => {
  const [expanded, setExpanded] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [showConnectGmailModal, setShowConnectGmailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [checkingGmail, setCheckingGmail] = useState(false);
  const [highlightedCampaignId, setHighlightedCampaignId] = useState(null);
  const { addNotification } = useNotifications();

  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // active, history
  const [filters, setFilters] = useState({ status: '' });
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [campaignTags, setCampaignTags] = useState({});
  const [campaignNotes, setCampaignNotes] = useState({});

  useEffect(() => {
    let signupDate = localStorage.getItem('signupDate');
    if (!signupDate) {
      signupDate = new Date().toISOString();
      localStorage.setItem('signupDate', signupDate);
    }
  }, []);

  useEffect(() => {
    const updatedCampaigns = updateCampaignStatus(campaigns);
    if (JSON.stringify(updatedCampaigns) !== JSON.stringify(campaigns)) {
      setCampaigns(updatedCampaigns);
    }

    const interval = setInterval(() => {
      const updated = updateCampaignStatus(campaigns);
      if (JSON.stringify(updated) !== JSON.stringify(campaigns)) {
        setCampaigns(updated);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [campaigns]);

  const handleNewCampaign = () => {
    if (!isGmailConnected) {
      setShowConnectGmailModal(true);
    } else {
      setShowStartModal(true);
    }
  };

  const { isGmailConnected, gmailEmail, loading: gmailStatusLoading, initialLoading: gmailInitialLoading, refreshGmailStatus } = useGmailStatus();

  const loadCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await axios.get('/api/campaigns');
      if (response.data && response.data.campaigns) {
        const campaignsWithFormattedDates = response.data.campaigns.map(campaign => ({
          ...campaign,
          created: campaign.created_at ? new Date(campaign.created_at).toLocaleString() : 'Unknown',
          scheduled: campaign.created_at ? new Date(campaign.created_at).toLocaleString() : 'Unknown',
          sent: campaign.emails_sent || 0,
          replies: campaign.positive_replies || 0,
          status: campaign.status || 'Ready',
          total_emails: campaign.total_emails || 0,
          goal: campaign.goal || 'General Outreach'
        }));
        setCampaigns(campaignsWithFormattedDates);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleStartCampaign = async ({ campaignName, campaignGoal, emails, industry, template, emailSource, duration }) => {
    setIsLoading(true);
    setFormError("");

    if (!isGmailConnected) {
      setFormError("Gmail is not connected. Please connect your Gmail account first.");
      setIsLoading(false);
      setShowConnectGmailModal(true);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/campaign/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          campaignName,
          campaignGoal,
          emails,
          industry,
          emailSource,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to create campaign.');
      }

      const newCampaign = await res.json();
      await loadCampaigns();
      setIsLoading(false);
      setShowStartModal(false);
      setHighlightedCampaignId(newCampaign.id);
      toast.success('Campaign created and scheduled successfully!');

    } catch (error) {
      console.error('Error creating campaign:', error);
      setIsLoading(false);
      setFormError(error.message);
      toast.error(error.message);
    }
  };

  const handleSeeCampaign = () => {
    setShowConnectGmailModal(false);
    setShowStartModal(false);
    toast.success('Gmail connected! Your campaign is now running.', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    });
  };

  useEffect(() => {
    if (location.state && location.state.highlightCampaign && location.state.campaign) {
      loadCampaigns();
      setTimeout(() => {
        setHighlightedCampaignId(location.state.campaign.id);
        setTimeout(() => setHighlightedCampaignId(null), 1000);
        setTimeout(() => {
          const el = document.getElementById(`campaign-${location.state.campaign.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }, 300);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredCampaigns = campaigns.filter(c => {
    const campaignName = c.name || '';
    const matchesSearch = campaignName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filters.status || c.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (!localStorage.getItem('userTimezone')) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      localStorage.setItem('userTimezone', tz);
    }
  }, []);

  useEffect(() => {
    if (highlightedCampaignId) {
      const el = document.getElementById(`campaign-${highlightedCampaignId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setHighlightedCampaignId(null), 1000);
    }
  }, [highlightedCampaignId]);

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await axios.delete(`/api/campaigns/${campaignId}`);
      await loadCampaigns();
      toast.success('Campaign deleted successfully!');
    } catch (error) {
      console.error('Delete campaign error:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete campaign.';
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="min-h-screen w-full font-poppins relative">
      <div className="fixed inset-0 w-full h-full z-0 bg-slate-50/50 dark:bg-[#0f172a]" aria-hidden="true"></div>

      <div className="relative min-h-screen w-full flex flex-col px-0 z-10 bg-transparent overflow-auto">
        <DashboardHeader showGreeting={false} title="Campaigns" />

        <main className="p-4 2xl:p-6 min-h-screen">
          <div className="max-w-[1800px] mx-auto space-y-12">

            <section className="pt-10 pb-6 relative text-center space-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-4 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-full shadow-sm"
                >
                  <SparklesIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Powered by Outrelix Intelligence 2026</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                  Launch your next <span className="text-blue-600">High-Value Campaign</span>.
                </h1>
                <p className="text-slate-400 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                  Automate your outreach with AI-powered sequencing, smart follow-ups, and <span className="text-slate-600 dark:text-slate-300 font-bold">real-time intent signals</span>.
                </p>
              </div>

              <div className="max-w-3xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-800 p-2 text-left">
                  <div className="flex-1 flex items-center px-4">
                    <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search campaigns by name, status, or goal..."
                      className="w-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-white placeholder-slate-300 dark:placeholder-gray-600 font-medium py-4 px-3"
                    />
                  </div>
                  <button
                    onClick={handleNewCampaign}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                  >
                    <PlusIcon className="h-4 w-4" />
                    New Campaign
                  </button>
                </div>
              </div>
            </section>

            <div className="flex justify-center">
              <div className="inline-flex items-center bg-white dark:bg-gray-950 p-1.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-gray-800">
                {[
                  { id: 'active', label: 'Active Campaigns', icon: FireIcon, badge: campaigns.length },
                  { id: 'history', label: 'Campaign History', icon: RectangleStackIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-900'
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  {activeTab === 'active' ? 'Active Campaigns' : 'Analytics & History'}
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase border border-emerald-100 dark:border-emerald-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time Sequencing Active
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500">{filteredCampaigns.length} of {campaigns.length} campaigns</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadCampaigns}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-400 hover:text-blue-600 hover:border-blue-500 shadow-sm transition-all"
                  title="Refresh campaigns"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loadingCampaigns ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {gmailInitialLoading ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="w-24 h-3 bg-slate-300 dark:bg-slate-700 rounded-md" />
                  </div>
                ) : !isGmailConnected ? (
                  <button
                    onClick={() => setShowConnectGmailModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all shadow-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Connect Gmail
                  </button>
                ) : isGmailConnected ? (
                  <div
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl shadow-sm text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-all cursor-default group"
                    title="Gmail Connected"
                  >
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                    <span className="truncate max-w-[150px] font-semibold">{gmailEmail}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="max-w-4xl mx-auto w-full pb-16 space-y-4">
              {loadingCampaigns ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading campaigns...</span>
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No campaigns found</div>
                  <p className="text-gray-400 dark:text-gray-500">Create your first campaign to get started!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredCampaigns.map(campaign => {
                    const statusInfo = getCampaignStatusInfo(campaign);
                    return (
                      <motion.div
                        key={campaign.id}
                        id={`campaign-${campaign.id}`}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-700/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group ${highlightedCampaignId === campaign.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div
                          className="p-5 cursor-pointer flex items-center justify-between"
                          onClick={() => setExpanded(expanded === campaign.id ? null : campaign.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="hidden sm:flex w-12 h-12 bg-white/30 dark:bg-gray-800/50 rounded-2xl items-center justify-center shadow-inner border border-white/40 dark:border-gray-700/30 group-hover:scale-110 transition-transform duration-300">
                              <BriefcaseIcon className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.name}</h2>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Created: {campaign.created}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[statusInfo.statusText] || statusColors.Completed} shadow-sm`}>
                                  {statusInfo.statusText}
                                </span>
                                {statusInfo.timeText && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <ClockIcon className="w-3 h-3" />
                                    <span>{statusInfo.timeText}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-4 text-sm">
                              <div className="text-center">
                                <p className="font-bold text-gray-800 dark:text-white">{campaign.sent}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold text-gray-800 dark:text-white">{campaign.replies}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Replies</p>
                              </div>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${expanded === campaign.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        <AnimatePresence>
                          {expanded === campaign.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-gray-200 dark:border-gray-700"
                            >
                              <div className="p-5 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Goal</label>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{campaign.goal}</p>
                                  </div>
                                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Prospects</label>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{campaign.total_emails} leads</p>
                                  </div>
                                  <div className="flex items-end justify-end gap-3">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(campaign.id); }}
                                      className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                                      title="Delete Campaign"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); }}
                                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
                                    >
                                      Analytics
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Content Intelligence</h3>
                                    <button className="text-xs font-bold text-blue-600 hover:underline">Edit Sequence</button>
                                  </div>
                                  <div className="space-y-3">
                                    {campaign.email_subject && (
                                      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Subject Line</p>
                                        <p className="text-sm text-slate-600 dark:text-gray-300 italic">"{campaign.email_subject}"</p>
                                      </div>
                                    )}
                                    {campaign.email_template && (
                                      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Sequence Preview</p>
                                        <div className="text-sm text-slate-600 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                          {campaign.email_template}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <TagInput
                                    tags={campaignTags[campaign.id] || []}
                                    onTagsChange={(tags) => setCampaignTags(prev => ({ ...prev, [campaign.id]: tags }))}
                                    placeholder="Add intelligence tags..."
                                  />
                                  <NoteInput
                                    note={campaignNotes[campaign.id] || ''}
                                    onNoteChange={(note) => setCampaignNotes(prev => ({ ...prev, [campaign.id]: note }))}
                                    placeholder="Add intelligence notes..."
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </main>
      </div>

      <MissionBuilder
        open={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStart={handleStartCampaign}
        isLoading={isLoading}
        formError={formError}
        setFormError={setFormError}
        isGmailConnected={isGmailConnected}
      />

      <ConnectGmailModal
        open={showConnectGmailModal}
        onClose={() => setShowConnectGmailModal(false)}
        onConnected={handleSeeCampaign}
        onGmailConnected={refreshGmailStatus}
        gmailEmail={gmailEmail}
        checkingGmail={checkingGmail}
        setCheckingGmail={setCheckingGmail}
      />
    </div>
  );
};

export default Campaigns;