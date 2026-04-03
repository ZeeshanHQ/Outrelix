import React, { useState, useEffect, useRef } from 'react';
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
import { Menu, Transition } from '@headlessui/react';
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
  BriefcaseIcon,
  TrashIcon,
  PencilSquareIcon,
  PresentationChartBarIcon,
  CpuChipIcon
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
  Running: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Expired: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Locked: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  Processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 animate-pulse',
  Ready: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 animate-pulse',
  ready: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  'AI Initializing': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 animate-pulse',
};

const Campaigns = () => {
  const [expanded, setExpanded] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConnectGmailModal, setShowConnectGmailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [checkingGmail, setCheckingGmail] = useState(false);
  const [highlightedCampaignId, setHighlightedCampaignId] = useState(null);
  const [showGmailMenu, setShowGmailMenu] = useState(false);
  const gmailMenuRef = useRef(null);

  // New states for Delete and Edit
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const { addNotification } = useNotifications();
  const { isGmailConnected, gmailEmail, isValid, needsReauth, refreshGmailStatus, initialLoading: gmailInitialLoading } = useGmailStatus();

  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // active, history
  const [filters, setFilters] = useState({ status: '' });
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [campaignTags, setCampaignTags] = useState({});
  const [campaignNotes, setCampaignNotes] = useState({});

  // Close Gmail menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (gmailMenuRef.current && !gmailMenuRef.current.contains(event.target)) {
        setShowGmailMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDisconnectGmail = async () => {
    try {
      await axios.post('/api/user/gmail-disconnect');
      await refreshGmailStatus();
      setShowGmailMenu(false);
      toast.success('Gmail disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect Gmail');
    }
  };

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
    setSelectedCampaign(null); // Clear selection for new campaign
    if (!isGmailConnected) {
      setShowConnectGmailModal(true);
    } else {
      setShowStartModal(true);
    }
  };

  const loadCampaigns = async (silent = false) => {
    try {
      if (!silent) setLoadingCampaigns(true);
      else setIsRefreshing(true);

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
          goal: campaign.description || 'General Outreach' // Use description as goal
        }));
        setCampaigns(campaignsWithFormattedDates);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
      setIsRefreshing(false);
    }
  };

  const handleStartCampaign = async ({ id, campaignName, campaignGoal, emails, industry, template, emailSource, scheduling }) => {
    setIsLoading(true);
    setFormError("");

    if (!isGmailConnected) {
      setFormError("Gmail is not connected. Please connect your Gmail account first.");
      setIsLoading(false);
      setShowConnectGmailModal(true);
      return;
    }

    try {
      if (id) {
        // Handle Update (PATCH)
        await axios.patch(`/api/campaigns/${id}`, {
          name: campaignName,
          description: campaignGoal,
          industry: industry,
          emailSource: emailSource,
          scheduling: scheduling,
        });
        toast.success('Campaign updated successfully!');
      } else {
        // Handle Creation (POST)
        const res = await axios.post('/api/campaign/start', {
          campaignName,
          campaignGoal,
          emails,
          industry,
          emailSource,
          scheduling: scheduling,
        });
        setHighlightedCampaignId(res.data.id);
        toast.success('Campaign created and scheduled successfully!');
      }

      await loadCampaigns();
      setIsLoading(false);
      setShowStartModal(false);
      setSelectedCampaign(null);

    } catch (error) {
      console.error('Error starting/updating campaign:', error);
      setIsLoading(false);
      setFormError(error.message);
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    // Optimistic UI Update
    const previousCampaigns = [...campaigns];
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: newStatus } : c));

    try {
      await axios.patch(`/api/campaigns/${campaignId}`, { status: newStatus });
      toast.success(`Success! Status calibrated to ${newStatus.toUpperCase()}`, {
        icon: <SparklesIcon className="w-5 h-5 text-blue-500" />,
        className: 'bg-white dark:bg-gray-900 font-bold text-[11px] uppercase tracking-widest'
      });
      // Silent reload to sync any background automation state
      await loadCampaigns(true);
    } catch (error) {
      // Revert if API fails
      setCampaigns(previousCampaigns);
      console.error('Status change error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await axios.delete(`/api/campaigns/${campaignId}`);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      toast.success('Campaign vaporized successfully', {
        icon: <TrashIcon className="w-5 h-5 text-rose-500" />
      });
      setShowDeleteModal(false);
      setCampaignToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete campaign');
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
    const matchesTab = activeTab === 'active' ? c.status === 'active' : c.status !== 'active';
    const matchesStatus = !filters.status || c.status === filters.status;
    return matchesSearch && matchesStatus && matchesTab;
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


  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="min-h-screen w-full font-poppins relative">
      <div className="min-h-screen bg-white font-poppins selection:bg-blue-100">
        <DashboardHeader showGreeting={false} title="Campaign Architect" />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <main className="p-4 md:p-8 2xl:p-12 transition-all duration-500">
            <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-28 scale-[0.90] origin-top">
              <section className="text-center space-y-12">
                <div className="space-y-6">
                </div>
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
                        onFocus={(e) => {
                          // Prevent focus stealing from status dropdowns
                          if (document.activeElement?.closest('[role="menu"]')) {
                            e.target.blur();
                          }
                        }}
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

              <div className="flex justify-center pt-8">
                <div className="inline-flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                  {[
                    { id: 'active', label: 'Active Campaigns', icon: FireIcon, badge: campaigns.filter(c => c.status === 'active').length },
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
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-50 text-slate-500'}`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pb-6 border-b border-slate-50">
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
                    <div className="relative" ref={gmailMenuRef}>
                      <button
                        onClick={() => setShowGmailMenu(!showGmailMenu)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl shadow-sm text-xs font-bold transition-all hover:shadow-md ${needsReauth
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'}`}
                        title={needsReauth ? "Action Required: Token Expired" : "Gmail Connected"}
                      >
                        <div className="relative flex h-2.5 w-2.5">
                          {needsReauth ? (
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                          ) : (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </>
                          )}
                        </div>
                        <span className="truncate max-w-[150px] font-semibold">{gmailEmail}</span>
                        <ChevronDownIcon className={`w-3 h-3 transition-transform ${showGmailMenu ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showGmailMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 z-50 overflow-hidden"
                          >
                            <div className="p-2 space-y-1">
                              {needsReauth && (
                                <button
                                  onClick={() => { setShowConnectGmailModal(true); setShowGmailMenu(false); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                                >
                                  <ArrowPathIcon className="w-4 h-4" />
                                  Reconnect Gmail
                                </button>
                              )}
                              <button
                                onClick={handleDisconnectGmail}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Disconnect Gmail
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                          initial={{ opacity: 0, y: 20, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.98 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className={`bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border border-slate-200/60 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${highlightedCampaignId === campaign.id ? 'ring-2 ring-blue-500' : ''}`}
                        >
                          <div
                            className="p-3.5 cursor-pointer flex items-center justify-between"
                            onClick={() => setExpanded(expanded === campaign.id ? null : campaign.id)}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="hidden sm:flex w-10 h-10 bg-slate-50 dark:bg-gray-900 rounded-xl items-center justify-center border border-slate-100 dark:border-gray-800 group-hover:scale-105 transition-transform duration-300">
                                <BriefcaseIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                              </div>
                              <div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{campaign.name}</h2>
                                <div className="flex items-center gap-2.5 mt-1">
                                  <Menu as="div" className="relative inline-block text-left">
                                    <Menu.Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        (campaign.status === 'draft' || (campaign.status === 'active' && campaign.settings?.pipeline_status === 'Operation Initializing')) 
                                          ? statusColors['AI Initializing'] 
                                          : (statusColors[campaign.status] || statusColors.active)
                                      } shadow-sm flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all border border-white/20 dark:border-gray-800/50`}
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'active' ? 'bg-white animate-pulse' : 'bg-current opacity-40'}`} />
                                      { (campaign.status === 'draft' || (campaign.status === 'active' && campaign.settings?.pipeline_status === 'Operation Initializing')) ? 'AI Initializing' : campaign.status }
                                      <ChevronDownIcon className="w-3 h-3 opacity-60" />
                                    </Menu.Button>
                                    <Transition
                                      as={React.Fragment}
                                      enter="transition ease-out duration-100"
                                      enterFrom="transform opacity-0 scale-95"
                                      enterTo="transform opacity-100 scale-100"
                                      leave="transition ease-in duration-75"
                                      leaveFrom="transform opacity-100 scale-100"
                                      leaveTo="transform opacity-0 scale-95"
                                    >
                                      <Menu.Items className="absolute left-0 mt-1 w-32 origin-top-left bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-slate-100 dark:border-gray-800 z-[60] focus:outline-none overflow-hidden">
                                        <div className="py-1">
                                          {['active', 'paused', 'completed', 'draft'].map((status) => (
                                            <Menu.Item key={status}>
                                              {({ active }) => (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleStatusChange(campaign.id, status);
                                                  }}
                                                  className={`${active ? 'bg-slate-50 dark:bg-gray-800 text-blue-600' : 'text-slate-600 dark:text-gray-400'} group flex w-full items-center px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors`}
                                                >
                                                  {status}
                                                </button>
                                              )}
                                            </Menu.Item>
                                          ))}
                                        </div>
                                      </Menu.Items>
                                    </Transition>
                                  </Menu>

                                  <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 border-l border-slate-200 dark:border-gray-800 pl-2.5">
                                    {campaign.created}
                                  </span>
                                  {campaign.status === 'active' && campaign.sent === 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-100 animate-pulse">
                                      <CpuChipIcon className="w-3 h-3" />
                                      Pipeline Active
                                    </div>
                                  )}
                                  {campaign.settings?.email_source === 'ai' && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-indigo-100">
                                      <SparklesIcon className="w-3 h-3" />
                                      AI Lead Engine
                                    </div>
                                  )}
                                  {(campaign.settings?.email_source === 'manual' || campaign.settings?.email_source === 'csv') && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                                      <DocumentArrowUpIcon className="w-3 h-3" />
                                      Direct Audience
                                    </div>
                                  )}
                                  {statusInfo.timeText && (
                                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                                      <ClockIcon className="w-3 h-3" />
                                      <span>{statusInfo.timeText}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="hidden md:flex items-center gap-6">
                                <div className="text-center">
                                  <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{campaign.sent}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Sent</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{campaign.replies}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Replies</p>
                                </div>
                              </div>
                              <div className="h-8 w-px bg-slate-100 dark:bg-gray-800" />

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCampaignToDelete(campaign);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
                                  title="Quick Delete"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                                <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expanded === campaign.id ? 'rotate-180 text-blue-500' : ''}`} />
                              </div>
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
                                    <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-800 transition-all hover:bg-slate-50 dark:hover:bg-gray-900 group/card relative">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Goal</label>
                                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">{campaign.goal}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-gray-900/50 border border-slate-100 dark:border-gray-800 transition-all hover:bg-slate-50 dark:hover:bg-gray-900 group/card">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Prospects</label>
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{campaign.total_emails} <span className="text-slate-400 text-[10px] uppercase ml-1">leads</span></p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col justify-end gap-3">
                                      <div className="flex gap-3 h-11 items-center">
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${campaign.id}/analytics`); }}
                                          className="h-full flex items-center gap-2 px-5 bg-white dark:bg-gray-950/40 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 dark:hover:bg-gray-900 transition-all shadow-sm hover:shadow-md active:scale-95 backdrop-blur-md"
                                        >
                                          <PresentationChartBarIcon className="w-4 h-4 text-blue-500" />
                                          <span>Analytics</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setSelectedCampaign(campaign); setShowStartModal(true); }}
                                          className="h-full flex items-center gap-2 px-5 bg-blue-600 dark:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-400 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                                        >
                                          <PencilSquareIcon className="w-4 h-4" />
                                          <span>Edit Campaign</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sequence Intelligence</h3>
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
          onClose={() => { setShowStartModal(false); setSelectedCampaign(null); }}
          onStart={handleStartCampaign}
          isLoading={isLoading}
          formError={formError}
          setFormError={setFormError}
          isGmailConnected={isGmailConnected}
          initialData={selectedCampaign}
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

        {/* Premium Delete Confirmation Modal */}
        <Transition.Root show={showDeleteModal} as={React.Fragment}>
          <Menu as="div" className="relative z-[200]">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <div className="relative transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-950 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-8 border border-slate-100 dark:border-gray-800">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-900/20 sm:mx-0">
                        <ExclamationTriangleIcon className="h-8 w-8 text-rose-600 dark:text-rose-500" aria-hidden="true" />
                      </div>
                      <div className="mt-5 text-center sm:ml-6 sm:mt-0 sm:text-left">
                        <h3 className="text-xl font-black leading-6 text-slate-800 dark:text-white uppercase tracking-tight">
                          Terminate Campaign?
                        </h3>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-slate-500 dark:text-gray-400 leading-relaxed">
                            You are about to permanently delete <span className="font-bold text-slate-800 dark:text-white">"{campaignToDelete?.name}"</span>.
                            This action is irreversible and all campaign intelligence will be lost.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-2xl bg-rose-600 px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700 hover:scale-[1.02] active:scale-95 transition-all"
                        onClick={() => handleDeleteCampaign(campaignToDelete?.id)}
                      >
                        Confirm Deletion
                      </button>
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-2xl bg-slate-50 dark:bg-gray-900 px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-100 dark:border-gray-800 transition-all sm:mt-0"
                        onClick={() => { setShowDeleteModal(false); setCampaignToDelete(null); }}
                      >
                        Keep Campaign
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </div>
          </Menu>
        </Transition.Root>
      </div>
    </div>
  );
};

export default Campaigns;