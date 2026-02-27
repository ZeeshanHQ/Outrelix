import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { XMarkIcon, SparklesIcon, CheckCircleIcon, LockClosedIcon, ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import { Mail as LucideMail, ShieldCheck, Globe } from 'lucide-react';
import ConnectGmailModal from './ConnectGmailModal';
import Papa from 'papaparse';
import { useGmailStatus } from '../utils/GmailStatusContext';

// Industry options with icons
const industries = [
  { name: 'Technology', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, color: 'bg-blue-500' },
  { name: 'Marketing', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 0113 11z" /></svg>, color: 'bg-indigo-500' },
  { name: 'E-commerce', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>, color: 'bg-pink-500' },
  { name: 'Real Estate', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, color: 'bg-red-500' },
  { name: 'Education', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, color: 'bg-purple-500' },
  { name: 'Healthcare', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>, color: 'bg-green-500' },
  { name: 'Finance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-13a9 9 0 110 18 9 9 0 010-18zm0 0V3m0 18v-3" /></svg>, color: 'bg-yellow-500' },
  { name: 'Manufacturing', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, color: 'bg-gray-500' },
  { name: 'Legal', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>, color: 'bg-orange-500' },
  { name: 'Consulting', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, color: 'bg-teal-500' },
  { name: 'Non-Profit', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, color: 'bg-emerald-500' },
  { name: 'Government', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, color: 'bg-slate-500' },
];

const templates = [
  { name: 'Professional Intelligence Template', description: 'Advanced AI-powered composition', icon: <SparklesIcon className="w-5 h-5" /> },
  { name: 'Hyper-Personalized Sequence', description: 'High-conversion dynamic content', icon: <LucideMail className="w-5 h-5" /> },
];

const StartCampaignModal = ({ open, onClose, industry = '', onStart, isLoading, formError, setFormError, isGmailConnected, manualEmails: initialEmails = '' }) => {
  const [campaignName, setCampaignName] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [manualEmails, setManualEmails] = useState('');
  const [invalidEmails, setInvalidEmails] = useState([]);
  const [validManualEmails, setValidManualEmails] = useState([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(industry || '');
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [gmailEmail, setGmailEmail] = useState('');
  const [showConnectGmailModal, setShowConnectGmailModal] = useState(false);

  useEffect(() => {
    setSelectedIndustry(industry || '');
  }, [industry, open]);

  useEffect(() => {
    if (open && initialEmails) {
      setManualEmails(initialEmails);
    }
  }, [open, initialEmails]);

  useEffect(() => {
    if (!open) return;
    async function fetchStatus() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/gmail-status`, { credentials: 'include' });
        const data = await res.json();
        setGmailEmail(data.email || '');
      } catch (e) {
        setGmailEmail('');
      }
    }
    fetchStatus();
  }, [open]);

  // Email validation regex
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  // Live validation for manual emails
  const handleManualEmailsChange = (e) => {
    const value = e.target.value;
    setManualEmails(value); // Keep the raw text for the textarea

    if (!value.trim()) {
      setInvalidEmails([]);
      setValidManualEmails([]);
      return;
    }

    const emails = value
      .split(/[ ,;\n\t]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    const valids = [];
    const invalids = [];

    emails.forEach(email => {
      if (emailRegex.test(email)) {
        valids.push(email);
      } else {
        invalids.push(email);
      }
    });

    setValidManualEmails(valids);
    setInvalidEmails(invalids);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormError(""); // Clear any previous errors
    if (file) {
      if (file.name.split('.').pop().toLowerCase() !== 'csv') {
        setFormError('Please upload a valid CSV file.');
        setCsvFile(null);
        return;
      }
      setCsvFile(file);
      setManualEmails(""); // Clear manual emails
      setInvalidEmails([]);
    } else {
      setCsvFile(null);
    }
  };

  const handleManualEmailsSave = () => {
    setShowManualModal(false);
    // If manual emails are saved, ensure CSV is cleared
    if (manualEmails.trim()) {
      setCsvFile(null);
    }
  };

  const handleStart = () => {
    // BYPASS ALL VALIDATION FOR TESTING
    onStart && onStart({
      campaignName: campaignName || 'Test Campaign',
      campaignGoal: campaignGoal || 'Test Goal',
      emails: validManualEmails.length > 0 ? validManualEmails : ['test@example.com'],
      industry: selectedIndustry || 'Technology',
      emailSource: csvFile ? 'csv' : 'manual',
      template: 'Basic Template',
      duration: 7
    });
  };

  // Add this effect to clear error when valid emails or CSV are present
  useEffect(() => {
    if ((validManualEmails.length > 0 || csvFile) && formError) {
      setFormError("");
    }
  }, [validManualEmails, csvFile, formError]);

  // All industries are unlocked in the premium version
  const availableIndustries = industries;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[100] font-poppins">
      <DialogBackdrop className="fixed inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-pink-900/60 backdrop-blur-[6px] transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto flex items-center justify-center p-4 text-center">
        <DialogPanel className="relative bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl max-w-5xl w-full p-0 z-10 flex flex-row gap-0 overflow-hidden border border-blue-200 dark:border-blue-900 backdrop-blur-xl ring-4 ring-blue-300/10 focus:outline-none focus:ring-4 focus:ring-blue-400/30 animate-fade-in text-left">
          {/* Close button absolutely at top right of modal container */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 bg-white/70 dark:bg-gray-800/70 rounded-full p-2 shadow-md z-20 border border-blue-100 dark:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <XMarkIcon className="w-7 h-7" />
          </button>

          {/* Left: Campaign Info */}
          <div className="flex-1 flex flex-col pt-10 pb-8 px-8 gap-4 min-w-[380px] max-w-[480px] relative" style={{ justifyContent: 'flex-start' }}>
            {/* Decorative gradient at the top */}
            <div className="absolute left-0 top-0 w-full h-20 bg-gradient-to-r from-blue-100/60 via-purple-100/50 to-pink-100/60 dark:from-blue-900/40 dark:via-purple-900/30 dark:to-pink-900/40 rounded-t-3xl pointer-events-none z-0" />
            <div className="flex items-center gap-2 mb-1 z-10">
              <SparklesIcon className="w-7 h-7 text-blue-500" />
              <h2 className="text-2xl font-extrabold text-left bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-poppins dark:from-blue-300 dark:via-purple-300 dark:to-pink-300">Start Your Campaign</h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-300 font-poppins mb-6 z-10">Launch a powerful campaign with advanced features and beautiful emails.</div>

            {/* Show form error if present */}
            {formError && (
              <div className="w-full mb-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold text-sm text-center shadow font-poppins">
                {formError}
              </div>
            )}

            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">Campaign Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 px-3 py-2 font-poppins text-base mb-1 shadow-sm focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="e.g. Tech Outreach Q2"
            />

            {/* Campaign Goal Input */}
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">What do you want to achieve with this campaign?</label>
            <textarea
              className={`w-full h-20 rounded-lg border ${invalidEmails.length > 0 ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white/80 dark:bg-gray-900/80 px-3 py-2 font-poppins text-base mb-1 shadow-sm focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none`}
              value={campaignGoal}
              onChange={e => setCampaignGoal(e.target.value)}
              placeholder="[ Write 1–2 lines about your goal ]"
            />
            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-4 flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4" />
              Intelligence will generate a hyper-personalized sequence based on your goal.
            </div>

            {/* Industry Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200">Industry</label>
              <div className="relative">
                <button
                  onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 font-poppins text-left shadow-sm focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    {selectedIndustry ? (
                      <>
                        <span className="text-blue-500">{industries.find(ind => ind.name === selectedIndustry)?.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedIndustry}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Select Industry</span>
                    )}
                  </div>
                  {showIndustryDropdown ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>

                {showIndustryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-950 rounded-xl border border-blue-100 dark:border-gray-800 shadow-xl z-30 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 px-2 py-1">All Industries Unlocked</div>
                      {availableIndustries.map((ind) => (
                        <button
                          key={ind.name}
                          onClick={() => {
                            setSelectedIndustry(ind.name);
                            setShowIndustryDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left transition-all ${selectedIndustry === ind.name ? 'bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          <span className="text-blue-500">{ind.icon}</span>
                          <span className="font-bold text-sm">{ind.name}</span>
                          {selectedIndustry === ind.name && <CheckCircleIcon className="w-4 h-4 text-blue-500 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Upload Targeted Emails (CSV)</label>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center">
                  <input
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                    disabled={!!manualEmails.trim()}
                  />
                  <span className={`px-4 py-1.5 rounded-lg border border-blue-400 bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900 text-blue-700 dark:text-blue-200 font-semibold text-sm shadow-sm transition-all duration-150 cursor-pointer min-w-[120px] text-center font-poppins ${manualEmails.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {csvFile ? 'Change File' : 'Choose File'}
                  </span>
                </label>
                <span className="text-xs text-gray-500 truncate max-w-[140px] font-poppins">
                  {csvFile ? csvFile.name : 'No file chosen'}
                </span>
                {csvFile && (
                  <button onClick={() => setCsvFile(null)} className="ml-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">Clear</button>
                )}
                {/* Manual entry icon */}
                <button
                  type="button"
                  className={`ml-2 flex items-center gap-1 p-2 rounded-lg border border-blue-400 bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900 text-blue-700 dark:text-blue-200 hover:bg-blue-100 transition-all duration-150 shadow-sm ${csvFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setShowManualModal(true)}
                  title="Manual email entry"
                  disabled={!!csvFile}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  <span className="text-xs font-semibold">Manual</span>
                </button>
              </div>
              {/* Show manual emails summary if present */}
              {manualEmails.trim() && (
                <div className="mt-2 text-xs text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30 rounded p-2 font-mono max-h-20 overflow-y-auto flex items-center justify-between">
                  <span>Manual entry: {manualEmails.split(/[ ,;\n\t]+/).filter(e => e.trim()).length} email(s)</span>
                  <button onClick={() => { setManualEmails(""); setInvalidEmails([]); setValidManualEmails([]); }} className="ml-2 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">Clear</button>
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-2 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Premium Intelligence Enabled</span>
              </div>
            </div>

            <button
              onClick={() => { console.log('Start button clicked'); handleStart(); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold font-poppins text-base shadow-lg hover:shadow-2xl transition-all duration-200 tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2"
              disabled={false}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Start Campaign</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="w-px bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 opacity-60 mx-0" />

          {/* Right: Premium Value Section */}
          <div className="flex-1 flex flex-col p-8 bg-slate-50 dark:bg-[#0f172a] min-w-[380px] max-w-[480px] gap-6 relative">
            <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Premium Outreach Unlocked</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Unlimited Campaigns', desc: 'No more limits on active outreach', icon: FireIcon },
                    { title: 'Smart Intelligence Scrape', desc: 'Deep prospect research enabled', icon: SparklesIcon },
                    { title: 'High-Value Sequencing', desc: 'Advanced AI followup logic active', icon: LucideMail },
                    { title: 'Global Industry Access', desc: 'All 20+ specialized verticals open', icon: Globe },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-tight">{feature.title}</p>
                        <p className="text-xs text-slate-400 dark:text-gray-400 font-medium">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Intelligence</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-emerald-200/60 leading-relaxed font-medium">
                  Your account is currently operating in <strong>Premium Deep-Intelligence Mode</strong>. All sequences are processed via high-performance AI clusters for maximum deliverability.
                </p>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
      <ConnectGmailModal
        open={showConnectGmailModal}
        onClose={() => setShowConnectGmailModal(false)}
        onConnected={email => {
          setGmailEmail(email);
          setShowConnectGmailModal(false);
          // Optionally, show a toast or redirect to campaign page
        }}
        gmailEmail={gmailEmail}
      />
      {/* Manual Email Entry Modal */}
      {
        showManualModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
              <button onClick={() => setShowManualModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 bg-white/70 dark:bg-gray-800/70 rounded-full p-2 shadow-md z-20 border border-blue-100 dark:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-200 font-poppins flex items-center gap-2"><PencilSquareIcon className="w-6 h-6" /> Enter Emails Manually</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">Paste or type one email per line. These will be used instead of a CSV file.</p>
              <textarea
                className={`w-full min-h-[120px] max-h-60 rounded-lg border ${invalidEmails.length > 0 ? 'border-red-500' : 'border-blue-300 dark:border-blue-700'} bg-white/90 dark:bg-gray-900/80 px-3 py-2 font-mono text-base mb-2 shadow-sm focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white`}
                value={manualEmails}
                onChange={handleManualEmailsChange}
                placeholder="user1@example.com\nuser2@example.com\n..."
              />
              {invalidEmails.length > 0 && (
                <div className="text-xs text-red-600 mb-2">
                  Invalid emails: {invalidEmails.join(', ')}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setShowManualModal(false)}
                >Cancel</button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  onClick={handleManualEmailsSave}
                  disabled={invalidEmails.length > 0}
                >Save Emails</button>
              </div>
            </div>
          </div>
        )
      }
    </Dialog >
  );
};

export default StartCampaignModal; 