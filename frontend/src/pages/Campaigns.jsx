import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, DocumentDuplicateIcon, LockClosedIcon, ChevronDownIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { EnvelopeIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { BarChart3, Rocket, Target, Globe, Mail as LucideMail, ShieldCheck } from 'lucide-react';
import StartCampaignModal from '../components/StartCampaignModal';
import ConnectGmailModal from '../components/ConnectGmailModal';
import { toast } from 'react-toastify';
import { usePathname, useRouter } from 'next/navigation';
import TagInput from '../components/TagInput';
import NoteInput from '../components/NoteInput';
import SearchFilterBar from '../components/SearchFilterBar';
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [campaignTags, setCampaignTags] = useState({});
  const [campaignNotes, setCampaignNotes] = useState({});

  // Get current plan info
  const userPlan = getUserPlan();
  const currentPlanLimits = getCurrentPlanLimits();
  const planStatus = getPlanStatusMessage();

  // --- Signup Date & Industry Lock Logic ---
  useEffect(() => {
    let signupDate = localStorage.getItem('signupDate');
    if (!signupDate) {
      signupDate = new Date().toISOString();
      localStorage.setItem('signupDate', signupDate);
    }
  }, []);

  // Campaign management functions
  const getActiveCampaigns = () => {
    return campaigns.filter(campaign =>
      campaign.status === 'Running' || campaign.status === 'Paused'
    );
  };

  // Check campaign status every minute
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
    } else if (!canCreateCampaign(campaigns)) {
      setUpgradeReason('campaign_limit');
      setShowUpgradeModal(true);
    } else {
      setShowStartModal(true);
    }
  };

  const { isGmailConnected, gmailEmail, loading: gmailStatusLoading, initialLoading: gmailInitialLoading, refreshGmailStatus } = useGmailStatus();

  // Load campaigns from database
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

    // Re-enable Gmail connection check
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

      // Refresh campaigns from database instead of manually adding
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

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    router.push('/pricing');
  };

  // Note: location.state is not available in Next.js App Router
  // Campaign highlighting is handled via URL params instead
  useEffect(() => {
    // no-op: App Router doesn't support location.state
  }, []);

  // Filtered and searched campaigns
  const filteredCampaigns = campaigns.filter(c => {
    const campaignName = c.name || '';
    const matchesSearch = campaignName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filters.status || c.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  // Detect and store user timezone
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

  const upgradeInfo = getUpgradeMessage(upgradeReason);

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await axios.delete(`/api/campaigns/${campaignId}`);
      // Refresh campaigns from database after deletion
      await loadCampaigns();
      toast.success('Campaign deleted successfully!');
    } catch (error) {
      console.error('Delete campaign error:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to delete campaign.';
      toast.error(errorMessage);
    }
  };

  // Load campaigns on component mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div className="min-h-screen w-full font-poppins relative">
      {/* Fixed full-screen background gradient */}
      <div className="fixed inset-0 w-full h-full z-0 bg-gradient-to-br from-[#e3e9fa] via-[#c7d2fe] to-[#f3e8ff] dark:from-[#0a183d] dark:via-[#1a237e] dark:to-[#4b006e]" aria-hidden="true"></div>

      {/* Scrollable content */}
      <div className="relative min-h-screen w-full flex flex-col px-0 z-10 bg-transparent overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between py-8 max-w-4xl mx-auto w-full">
          <h1 className="text-5xl md:text-6xl font-extrabold flex items-center gap-3 pl-0 text-left w-full" style={{ letterSpacing: '-0.02em' }}>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
              <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg pr-4 leading-tight" style={{ overflow: 'visible', display: 'inline-block' }}>
              Campaigns
            </span>
          </h1>

          <div className="flex flex-col items-end gap-2">
            {/* Gmail Status Label */}
            <div className="flex items-center gap-2">
              {gmailInitialLoading ? (
                <div className="h-7 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">Loading...</div>
              ) : gmailStatusLoading ? (
                <div className="h-7 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">Checking...</div>
              ) : isGmailConnected ? (
                <div className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-full flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Connected: <strong>{gmailEmail}</strong></span>
                </div>
              ) : (
                <div className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 rounded-full flex items-center gap-1.5">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Not Connected</span>
                </div>
              )}

              {/* Manual refresh button */}
              {!gmailInitialLoading && (
                <button
                  onClick={refreshGmailStatus}
                  disabled={gmailStatusLoading}
                  className="flex items-center justify-center w-6 h-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800"
                  title="Refresh Gmail status"
                >
                  <svg className={`w-3 h-3 ${gmailStatusLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>

            {/* Action Button */}
            {isGmailConnected ? (
              <div className="flex gap-3 items-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadCampaigns}
                  disabled={loadingCampaigns}
                  className="flex items-center justify-center w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800"
                  title="Refresh campaigns"
                >
                  <svg className={`w-4 h-4 ${loadingCampaigns ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewCampaign}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
                  disabled={gmailStatusLoading || gmailInitialLoading}
                >
                  <PlusIcon className="w-5 h-5" />
                  New Campaign
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConnectGmailModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
                disabled={gmailStatusLoading || gmailInitialLoading}
              >
                Connect Gmail
              </motion.button>
            )}
          </div>
        </div>

        {/* Plan Status Banner */}
        <div className="max-w-4xl mx-auto w-full mb-4">
          <div className={`flex flex-col md:flex-row items-center justify-between ${currentPlanLimits.bgColor} border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg px-4 py-3 gap-2`}>
            <div className="text-sm md:text-base font-light text-blue-900 dark:text-white font-poppins flex flex-col md:flex-row md:items-center gap-1 md:gap-2 w-full justify-between">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span className="font-medium">{userPlan} Plan Active:</span>
                </div>
                <span className="font-normal text-purple-700 dark:text-purple-300">
                  {currentPlanLimits.activeCampaigns === -1
                    ? `Unlimited campaigns, ${currentPlanLimits.durationPerCampaign} days each, ${currentPlanLimits.emailsPerDay} emails/day`
                    : `Up to ${currentPlanLimits.activeCampaigns} campaigns, ${currentPlanLimits.durationPerCampaign} days each, ${currentPlanLimits.emailsPerDay} emails/day`
                  }
                </span>
              </div>
              {planStatus.showUpgradeButton && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="ml-auto px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:shadow-lg transition-all text-sm font-poppins"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Limits Warning for Free Users */}
        {userPlan === 'Free' && getActiveCampaigns().length >= currentPlanLimits.activeCampaigns && (
          <div className="max-w-4xl mx-auto w-full mb-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="font-semibold">Campaign Limit Reached</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You've used both free campaigns. Upgrade to Pro or Power to create more campaigns and unlock advanced features.
              </p>
            </div>
          </div>
        )}

        {/* Search/Filter Bar and Bulk Actions */}
        <div className="max-w-4xl mx-auto w-full mt-2 mb-2">
          <SearchFilterBar
            search={search}
            setSearch={setSearch}
            filters={filters}
            setFilters={setFilters}
            campaigns={campaigns}
            selectedCampaigns={selectedCampaigns}
            setSelectedCampaigns={setSelectedCampaigns}
          />
          {selectedCampaigns.length > 0 && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-light text-blue-900 dark:text-blue-100">
              <span>{selectedCampaigns.length} selected</span>
              <button className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600" onClick={() => {/* bulk delete logic */ }}>Delete</button>
              <button className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600" onClick={() => {/* bulk pause logic */ }}>Pause</button>
              <button className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600" onClick={() => {/* bulk resume logic */ }}>Resume</button>
              <button className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600" onClick={() => {/* bulk export logic */ }}>Export</button>
              <button className="ml-auto px-2 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700" onClick={() => setSelectedCampaigns([])}>Clear</button>
            </div>
          )}
        </div>

        {/* Campaigns List */}
        <div className="max-w-4xl mx-auto w-full pb-16 space-y-4 mt-8">
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
                    className={`bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${highlightedCampaignId === campaign.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div
                      className="p-5 cursor-pointer flex items-center justify-between"
                      onClick={() => setExpanded(expanded === campaign.id ? null : campaign.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                          <BriefcaseIcon className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.name}</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Created: {campaign.created}</p>

                          {/* Campaign Status and Timer */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[statusInfo.statusText] || statusColors.Completed}`}>
                              {statusInfo.statusText}
                            </span>

                            {statusInfo.timeText && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <ClockIcon className="w-3 h-3" />
                                <span>{statusInfo.timeText}</span>
                              </div>
                            )}
                          </div>

                          {/* Email Progress */}
                          {campaign.total_emails && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                              <EnvelopeIcon className="w-3 h-3" />
                              <span>{campaign.sent || 0} of {campaign.total_emails} emails sent</span>
                              {(campaign.email_template || campaign.email_subject) && (
                                <span className="ml-2 flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                  <DocumentDuplicateIcon className="w-3 h-3" />
                                  <span>Template</span>
                                  {userPlan === 'Free' && <LockClosedIcon className="w-3 h-3" />}
                                </span>
                              )}
                            </div>
                          )}
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

                        {/* Upgrade Prompt for Expired Campaigns */}
                        {statusInfo.isExpired && userPlan === 'Free' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUpgradeReason('campaign_expired');
                              setShowUpgradeModal(true);
                            }}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                          >
                            Upgrade
                          </button>
                        )}

                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${expanded === campaign.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expanded === campaign.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="p-5 space-y-4">
                            {/* Campaign Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Campaign Info</h3>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-gray-500">Industry:</span> {campaign.industry || 'N/A'}</p>
                                  <p><span className="text-gray-500">Status:</span> {statusInfo.statusText}</p>
                                  {statusInfo.timeText && (
                                    <p><span className="text-gray-500">Time Left:</span> {statusInfo.timeText}</p>
                                  )}
                                  {campaign.goal && (
                                    <p><span className="text-gray-500">Goal:</span> {campaign.goal}</p>
                                  )}
                                </div>
                              </div>

                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h3>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-gray-500">Emails Sent:</span> {campaign.sent || 0}</p>
                                  <p><span className="text-gray-500">Replies:</span> {campaign.replies || 0}</p>
                                  <p><span className="text-gray-500">Open Rate:</span> 24.5%</p>
                                </div>
                              </div>

                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Actions</h3>
                                <div className="space-y-2">
                                  <button className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                    View Analytics
                                  </button>
                                  <button
                                    className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 relative group"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (userPlan === 'Free') {
                                        setUpgradeReason('template_edit');
                                        setShowUpgradeModal(true);
                                      } else {
                                        // TODO: Open template editor for Pro users
                                        toast.info('Template editor coming soon for Pro users!');
                                      }
                                    }}
                                  >
                                    <span>Edit Template</span>
                                    {userPlan === 'Free' && (
                                      <>
                                        <LockClosedIcon className="w-4 h-4" />
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                          Upgrade to Pro to edit templates
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                                        </div>
                                      </>
                                    )}
                                  </button>
                                  <button className="w-full px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors" onClick={() => handleDeleteCampaign(campaign.id)}>
                                    Delete Campaign
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Email Template Display */}
                            {(campaign.email_template || campaign.email_subject) && (
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                                    AI-Generated Email Template
                                  </h3>
                                  <button
                                    className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs hover:bg-purple-600 transition-colors flex items-center gap-1 relative group"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (userPlan === 'Free') {
                                        setUpgradeReason('template_edit');
                                        setShowUpgradeModal(true);
                                      } else {
                                        // TODO: Open template editor for Pro users
                                        toast.info('Template editor coming soon for Pro users!');
                                      }
                                    }}
                                  >
                                    <span>Edit</span>
                                    {userPlan === 'Free' && (
                                      <>
                                        <LockClosedIcon className="w-3 h-3" />
                                        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                          Upgrade to Pro to edit
                                          <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                                        </div>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {campaign.email_subject && (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</label>
                                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-white border">
                                        {campaign.email_subject}
                                      </div>
                                    </div>
                                  )}
                                  {campaign.email_template && (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Body:</label>
                                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-white border max-h-60 overflow-y-auto whitespace-pre-wrap">
                                        {campaign.email_template}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Tags and Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TagInput
                                tags={campaignTags[campaign.id] || []}
                                onTagsChange={(tags) => setCampaignTags(prev => ({ ...prev, [campaign.id]: tags }))}
                                placeholder="Add tags..."
                              />
                              <NoteInput
                                note={campaignNotes[campaign.id] || ''}
                                onNoteChange={(note) => setCampaignNotes(prev => ({ ...prev, [campaign.id]: note }))}
                                placeholder="Add notes..."
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

      {/* Modals */}
      <StartCampaignModal
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

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {upgradeInfo.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {upgradeInfo.message}
                </p>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Upgrade to unlock:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {upgradeInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpgrade}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    Upgrade Now
                  </button>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Campaigns; 