import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, SparklesIcon, CheckCircleIcon, LockClosedIcon, ChevronDownIcon, ChevronUpIcon, PencilSquareIcon, ClockIcon } from '@heroicons/react/24/outline';
import ConnectGmailModal from './ConnectGmailModal';
import Papa from 'papaparse';
import { useGmailStatus } from '../utils/GmailStatusContext';

// Industry options with icons
const industries = [
  { name: 'Technology', icon: '💻', color: 'bg-blue-500' },
  { name: 'Marketing', icon: '📢', color: 'bg-indigo-500' },
  { name: 'E-commerce', icon: '🛍️', color: 'bg-pink-500' },
  { name: 'Real Estate', icon: '🏠', color: 'bg-red-500' },
  { name: 'Education', icon: '📚', color: 'bg-purple-500' },
  { name: 'Healthcare', icon: '🏥', color: 'bg-green-500' },
  { name: 'Finance', icon: '💰', color: 'bg-yellow-500' },
  { name: 'Manufacturing', icon: '🏭', color: 'bg-gray-500' },
  { name: 'Legal', icon: '⚖️', color: 'bg-orange-500' },
  { name: 'Consulting', icon: '💼', color: 'bg-teal-500' },
  { name: 'Non-Profit', icon: '🤝', color: 'bg-emerald-500' },
  { name: 'Government', icon: '🏛️', color: 'bg-slate-500' },
];

// Template options
const templates = [
  { name: 'Basic Template', description: 'Simple and clean email template', isPro: false, icon: '📧' },
  { name: 'Professional Template', description: 'Polished and business-ready', isPro: true, icon: '💼' },
  { name: 'Power Template', description: 'Advanced with dynamic content', isPro: true, icon: '⚡' },
];

const StartCampaignModal = ({ open, onClose, industry = '', onStart, isLoading, formError, setFormError, isGmailConnected }) => {
  console.log('onStart prop:', onStart);
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
    if (!open) return;
    async function fetchStatus() {
      try {
        const res = await fetch('/api/user/gmail-status', { credentials: 'include' });
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
    console.log('StartCampaignModal handleStart called');
    console.log('About to call onStart:', onStart, typeof onStart);
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

  // Add industry locking logic
  const getDaysSinceSignup = () => {
    const signupDate = localStorage.getItem('signupDate');
    if (!signupDate) return 0;
    const ms = new Date().getTime() - new Date(signupDate).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  };
  
  const daysSinceSignup = getDaysSinceSignup();
  
  // Determine which industries are locked (one more every 3 days)
  const LOCK_ORDER = ['Real Estate', 'E-commerce', 'Marketing', 'Education', 'Technology'];
  const getLockedIndustries = () => {
    const lockedCount = Math.max(0, Math.floor((daysSinceSignup - 1) / 3));
    return LOCK_ORDER.slice(0, lockedCount);
  };
  
  const lockedIndustries = getLockedIndustries();
  
  // Define which industries are open for Starter plan and which are locked
  const OPEN_INDUSTRIES = ['Technology', 'Marketing', 'E-commerce', 'Real Estate', 'Education'];
  const LOCKED_INDUSTRIES = ['Healthcare', 'Finance', 'Manufacturing', 'Legal', 'Consulting', 'Non-Profit', 'Government'];
  
  // Dynamic industry filtering based on time-based locking
  const openIndustries = industries.filter(ind => {
    const isOpen = OPEN_INDUSTRIES.includes(ind.name);
    const isLocked = lockedIndustries.includes(ind.name);
    return isOpen && !isLocked;
  });
  
  const premiumIndustries = industries.filter(ind => {
    const isOpen = OPEN_INDUSTRIES.includes(ind.name);
    const isLocked = lockedIndustries.includes(ind.name);
    return !isOpen || isLocked;
  });

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-[100] inset-0 overflow-y-auto font-poppins">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-pink-900/60 backdrop-blur-[6px]" />
        <div className="relative bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl max-w-5xl w-full p-0 z-10 flex flex-row gap-0 overflow-hidden border border-blue-200 dark:border-blue-900 backdrop-blur-xl ring-4 ring-blue-300/10 focus:outline-none focus:ring-4 focus:ring-blue-400/30 animate-fade-in">
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">📝 What do you want to achieve with this campaign?</label>
            <textarea
              className={`w-full h-20 rounded-lg border ${invalidEmails.length > 0 ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white/80 dark:bg-gray-900/80 px-3 py-2 font-poppins text-base mb-1 shadow-sm focus:ring-2 focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none`}
              value={campaignGoal}
              onChange={e => setCampaignGoal(e.target.value)}
              placeholder="[ Write 1–2 lines about your goal ]"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              <p>AI will generate a basic email template based on your goal.</p>
              <p>Upgrade to Pro to upload files for dynamic content.</p>
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
                        <span className="text-lg">{industries.find(ind => ind.name === selectedIndustry)?.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedIndustry}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Select Industry</span>
                    )}
                  </div>
                  {showIndustryDropdown ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
                
                {showIndustryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-30 max-h-80 overflow-y-auto">
                    {/* Free Industries */}
                    <div className="p-2">
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 px-2">Free Industries</div>
                      {openIndustries.map((ind) => {
                        const idx = LOCK_ORDER.indexOf(ind.name);
                        const lockDay = idx !== -1 ? 1 + idx * 3 + 3 : null;
                        const daysLeft = lockDay ? lockDay - daysSinceSignup : null;
                        
                        return (
                        <button
                          key={ind.name}
                          onClick={() => {
                            setSelectedIndustry(ind.name);
                            setShowIndustryDropdown(false);
                          }}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left text-gray-900 dark:text-white relative"
                        >
                          <span className="text-lg">{ind.icon}</span>
                          <span className="font-medium">{ind.name}</span>
                          <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />
                            {daysLeft && daysLeft > 0 && daysLeft <= 3 && (
                              <span className="absolute top-0 right-0 text-[10px] font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 rounded-full shadow-sm">
                                {daysLeft} day{daysLeft === 1 ? '' : 's'} left
                              </span>
                            )}
                        </button>
                        );
                      })}
                    </div>
                    
                    {/* Recently Locked Industries */}
                    {lockedIndustries.length > 0 && (
                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 px-2">Recently Locked</div>
                        {lockedIndustries.map((ind) => (
                          <div
                            key={ind}
                            className="w-full flex items-center gap-3 p-2 rounded-lg opacity-60 cursor-not-allowed text-gray-900 dark:text-gray-300 relative"
                          >
                            <span className="text-lg">{industries.find(i => i.name === ind)?.icon}</span>
                            <span className="font-medium">{ind}</span>
                            <LockClosedIcon className="w-4 h-4 text-orange-400 ml-auto" />
                            <span className="absolute top-0 right-0 text-[10px] font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 rounded-full shadow-sm">
                              Locked
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Premium Industries */}
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 px-2 flex items-center gap-1">
                        Premium Industries <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span>
                      </div>
                      {premiumIndustries.filter(ind => !lockedIndustries.includes(ind.name)).map((ind) => (
                        <div
                          key={ind.name}
                          className="w-full flex items-center gap-3 p-2 rounded-lg opacity-60 cursor-not-allowed text-gray-900 dark:text-gray-300"
                        >
                          <span className="text-lg">{ind.icon}</span>
                          <span className="font-medium">{ind.name}</span>
                          <LockClosedIcon className="w-4 h-4 text-gray-400 ml-auto" />
                        </div>
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
              <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                <LockClosedIcon className="w-4 h-4" />
                <span className="font-semibold">AI Scrape Data <span className="text-xs">(Pro)</span></span>
                <span 
                  className="ml-1 cursor-pointer underline" 
                  onMouseEnter={() => setShowTooltip('ai-scrape')} 
                  onMouseLeave={() => setShowTooltip('')}
                >
                  ?
                </span>
                {showTooltip === 'ai-scrape' && (
                  <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 mt-2 z-50">
                    Upgrade to Pro to use AI-powered data scraping
                  </span>
                )}
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
          
          {/* Right: Features Grid - split into Current and Pro Features */}
          <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/80 dark:from-gray-900/90 dark:via-gray-800/90 dark:to-blue-900/80 min-w-[380px] max-w-[480px] gap-1">
            {/* Current Features */}
            <div>
              <h3 className="text-base font-bold font-poppins mb-3 text-blue-700 dark:text-blue-200">Current Features</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/95 dark:bg-gray-800/95 border border-blue-100 dark:border-blue-800 shadow-sm">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm text-blue-900 dark:text-white">Daily Send Limit</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins">❌ 50/day <span className="ml-1 text-green-600 dark:text-green-300 font-bold">Pro: 500+/day</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/95 dark:bg-gray-800/95 border border-blue-100 dark:border-blue-800 shadow-sm">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm text-blue-900 dark:text-white">Upload CSV for Targeted Emails</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins">Import your own list of leads</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/95 dark:bg-gray-800/95 border border-blue-100 dark:border-blue-800 shadow-sm">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm text-blue-900 dark:text-white">Basic Email Template</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins">Simple and clean design</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/95 dark:bg-gray-800/95 border border-blue-100 dark:border-blue-800 shadow-sm">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm text-blue-900 dark:text-white">{openIndustries.length} Free Industries</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins">
                      {openIndustries.map(ind => ind.name).join(', ')}
                      {lockedIndustries.length > 0 && (
                        <span className="text-orange-600 dark:text-orange-400">
                          {' '}({lockedIndustries.length} recently locked)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="my-3 border-t border-blue-100 dark:border-blue-800 opacity-60" />
            
            {/* Pro Features */}
            <div>
              <h3 className="text-base font-bold font-poppins mb-3 text-purple-700 dark:text-purple-200 flex items-center gap-1">
                Pro Features <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Upgrade</span>
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-blue-800 shadow-sm relative">
                  <LockClosedIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm flex items-center gap-1 text-blue-900 dark:text-white">
                      AI Scrape Data <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins flex items-center gap-1">
                      <span className="opacity-60 dark:text-gray-400">🔒 Locked</span>
                      <span 
                        className="ml-1 cursor-pointer underline text-blue-700 dark:text-blue-200" 
                        onMouseEnter={() => setShowTooltip('ai-scrape')} 
                        onMouseLeave={() => setShowTooltip('')}
                      >
                        ?
                      </span>
                      {showTooltip === 'ai-scrape' && (
                        <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 mt-2 z-50">
                          Upgrade to Pro to use AI-powered data scraping
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 blur-sm select-none pointer-events-none text-xs text-gray-400 dark:text-gray-500">
                      Preview: Automatically find and scrape relevant contact data
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-blue-800 shadow-sm relative">
                  <LockClosedIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm flex items-center gap-1 text-blue-900 dark:text-white">
                      AI Suggestion for Best Send Time <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins flex items-center gap-1">
                      <span className="opacity-60 dark:text-gray-400">🔒 Locked</span>
                      <span 
                        className="ml-1 cursor-pointer underline text-blue-700 dark:text-blue-200" 
                        onMouseEnter={() => setShowTooltip('ai')} 
                        onMouseLeave={() => setShowTooltip('')}
                      >
                        ?
                      </span>
                      {showTooltip === 'ai' && (
                        <span className="absolute bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 mt-2 z-50">
                          Pro users get smart AI timing for better replies!
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 blur-sm select-none pointer-events-none text-xs text-gray-400 dark:text-gray-500">
                      Preview: Best time is 10:32am (AI)
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-blue-800 shadow-sm">
                  <LockClosedIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm flex items-center gap-1 text-blue-900 dark:text-white">
                      Professional & Power Templates <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins flex items-center gap-1">
                      🔒 Locked <span className="ml-1 text-green-600 dark:text-green-300 font-bold">Pro: Advanced templates</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-blue-800 shadow-sm">
                  <LockClosedIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm flex items-center gap-1 text-blue-900 dark:text-white">
                      Follow-up Sequences <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins flex items-center gap-1">
                      🔒 Locked <span className="ml-1 text-green-600 dark:text-green-300 font-bold">Pro: Yes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-blue-100 dark:border-blue-800 shadow-sm">
                  <LockClosedIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold font-poppins text-sm flex items-center gap-1 text-blue-900 dark:text-white">
                      10+ Premium Industries <span className="ml-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs font-bold">Pro</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 font-poppins flex items-center gap-1">
                      🔒 Locked <span className="ml-1 text-green-600 dark:text-green-300 font-bold">Healthcare, Finance, Manufacturing, etc.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      {showManualModal && (
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
      )}
    </Dialog>
  );
};

export default StartCampaignModal; 