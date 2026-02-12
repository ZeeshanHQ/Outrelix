import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend';
import backendManager from '../utils/BackendManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  LockClosedIcon,
  SparklesIcon,
  BoltIcon,
  CheckCircleIcon,
  XMarkIcon,
  RocketLaunchIcon,
  ClockIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  CreditCardIcon,
  CogIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { Dialog } from '@headlessui/react';
import ConnectGmailModal from '../components/ConnectGmailModal';
import { useGmailStatus } from '../utils/GmailStatusContext';
import Analyzer from '../components/Analyzer';
import AppSidebar from '../components/AppSidebar';
import IcebreakerReviewModal from '../components/IcebreakerReviewModal';
import ObjectionHandlerModal from '../components/ObjectionHandlerModal';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Industry options with icons
const industries = [
  { name: 'Technology', icon: '💻', color: 'bg-blue-500' },
  { name: 'Healthcare', icon: '🏥', color: 'bg-green-500' },
  { name: 'Finance', icon: '💰', color: 'bg-yellow-500' },
  { name: 'Education', icon: '📚', color: 'bg-purple-500' },
  { name: 'Real Estate', icon: '🏠', color: 'bg-red-500' },
  { name: 'E-commerce', icon: '🛍️', color: 'bg-pink-500' },
  { name: 'Manufacturing', icon: '🏭', color: 'bg-gray-500' },
  { name: 'Marketing', icon: '📢', color: 'bg-indigo-500' },
];

// Define which industries are open for Starter plan and which are locked
const OPEN_INDUSTRIES = ['Technology', 'Marketing', 'E-commerce', 'Real Estate', 'Education'];
const LOCKED_INDUSTRIES = ['Healthcare', 'Finance', 'Manufacturing'];

// Add shimmer animation CSS
const shimmerStyle = `\n@keyframes shimmer {\n  0% { background-position: -400px 0; }\n  100% { background-position: 400px 0; }\n}\n.animated-gradient-shimmer {\n  background: linear-gradient(90deg, #3b82f6 0%, #a855f7 50%, #ec4899 100%);\n  background-size: 400% 100%;\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n  color: transparent;\n  animation: shimmer 2.5s linear infinite;\n}\n`;

// Helper to split name into animated letters
const AnimatedName = ({ name }) => (
  <span className="flex">
    {name.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 + i * 0.07, type: 'spring', stiffness: 300, damping: 20 }}
        className="animated-gradient-shimmer font-[Poppins,sans-serif]"
        style={{ display: 'inline-block' }}
      >
        {char}
      </motion.span>
    ))}
  </span>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isGmailConnected, gmailEmail, refreshGmailStatus } = useGmailStatus();
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isBackendLoading, setIsBackendLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ isOnline: true, isSleeping: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const handleUserUpdate = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };
    window.addEventListener('user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);
  const [showWelcome, setShowWelcome] = useState(false);
  const [stats, setStats] = useState({
    totalEmails: 0,
    sent: 0,
    replies: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [industries, setIndustries] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [pendingCampaign, setPendingCampaign] = useState(null);
  const [sentData, setSentData] = useState([65, 59, 80, 81, 56, 55, 40]);
  const [repliesData, setRepliesData] = useState([28, 48, 40, 19, 86, 27, 90]);
  const [showConnectGmailModal, setShowConnectGmailModal] = useState(false);
  const [gmailJustConnected, setGmailJustConnected] = useState(false);
  const [showIcebreakerModal, setShowIcebreakerModal] = useState(false);
  const [showObjectionModal, setShowObjectionModal] = useState(false);
  const [activities, setActivities] = useState([
    { id: 1, type: 'search', message: 'Neural scraper identified 142 technology leads in Dubai', time: 'Just now' },
    { id: 2, type: 'analysis', message: 'Sentiment score for lead j.smith@tech.com: 94% (High Intent)', time: '2m ago' },
    { id: 3, type: 'writing', message: 'Icebreaker generated for Sarah Connor @ Skynet Inc.', time: '5m ago' },
    { id: 4, type: 'system', message: 'RAG Knowledge Vault synchronized with recent objection successes', time: '12m ago' },
  ]);

  // Activity Feed simulation
  useEffect(() => {
    const activityInterval = setInterval(() => {
      const messages = [
        'Scanned LinkedIn for recent posts in Marketing industry',
        'Company news detected for NeoCorp: "New funding round"',
        'Generated personalized intro for Alex Rivera',
        'Objection detected: "Budget constraints" - Counter-argument prepared',
        'Lead score updated for Venture Capital partners',
        'Sentiment trend: 15% increase in "Curious" leads this hour',
        'Neural scraper bypass detected for restricted domain',
        'Icebreaker refined based on recent sentiment pattern'
      ];

      const newActivity = {
        id: Date.now(),
        type: ['search', 'analysis', 'writing', 'system'][Math.floor(Math.random() * 4)],
        message: messages[Math.floor(Math.random() * messages.length)],
        time: 'Just now'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 3)]);
    }, 5000);

    return () => clearInterval(activityInterval);
  }, []);

  // Add this useEffect after sentData/repliesData state declarations:
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates with random data
      setSentData(prev => prev.map(val => Math.max(10, Math.min(90, val + Math.floor(Math.random() * 11 - 5)))));
      setRepliesData(prev => prev.map(val => Math.max(10, Math.min(90, val + Math.floor(Math.random() * 11 - 5)))));
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Function to generate random Google-like colors
  const getRandomColor = () => {
    const colors = [
      'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500',
      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    if (!user) return;
    // Check if user is new
    const isNewUser = localStorage.getItem('isNewUser') === 'true';
    const welcomeKey = `welcomeShown_${user.uid || user.email}`;
    const welcomeShown = localStorage.getItem(welcomeKey) === 'true';

    if (!isNewUser && !welcomeShown) {
      setShowWelcome(true);
      // Hide welcome after 5 seconds and set flag
      const timer = setTimeout(() => {
        setShowWelcome(false);
        localStorage.setItem(welcomeKey, 'true');
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
    }
  }, [user]);

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    try {
      setIsBackendLoading(true);
      console.log('🔄 Loading industries...');

      const response = await backendManager.fetchWithWakeUp(`${BACKEND_URL}/api/industries`);

      // Check if the response status is OK (status in the range 200-299)
      if (!response.ok) {
        const errorText = await response.text(); // Read response as text for better error info
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Industries loaded successfully:', data);
      setIndustries(data.industries || data);
      setBackendStatus({ isOnline: true, isSleeping: false });
    } catch (error) {
      console.error('❌ Error loading industries:', error);
      setBackendStatus({ isOnline: false, isSleeping: true });
      // Silently handle backend issues - don't show user-facing errors
      setError(null);
    } finally {
      setIsBackendLoading(false);
    }
  };

  const handleIndustryChange = (e) => {
    setSelectedIndustry(e.target.value);
  };

  const handleStartCampaign = async ({ campaignName, csvFile, manualEmails, industry, template }) => {
    setFormError("");
    if (!campaignName || !campaignName.trim()) {
      setFormError("Campaign name is required.");
      return;
    }
    if (!csvFile && !manualEmails) {
      setFormError("Please upload a CSV file or enter emails manually.");
      return;
    }
    if (!industry) {
      setFormError("Please select an industry.");
      return;
    }
    setFormError("");
    setLoading(true);
    setError(null);
    // Check Gmail connection before closing modal
    if (!isGmailConnected) {
      setShowConnectGmailModal(true);
      setPendingCampaign({ campaignName, csvFile, manualEmails, industry, template });
      setLoading(false);
      return;
    }
    // Prepare campaign data
    const campaignData = {
      id: Date.now(),
      name: campaignName,
      created: new Date().toLocaleString(),
      scheduled: new Date().toLocaleString(),
      industry,
      industryIcon: 'BriefcaseIcon', // Will be replaced in Campaigns page
      sent: 0,
      replies: 0,
      status: 'Running',
      isPro: false,
      manual: !!manualEmails,
    };
    setShowStartModal(false);
    setLoading(false);
    // Redirect to Campaigns page and trigger highlight, passing full campaign data
    navigate('/campaigns', { state: { highlightCampaign: true, campaign: campaignData } });
  };

  // Sample data for the chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Emails Sent',
        data: sentData,
        borderColor: 'rgba(34,197,94,1)', // green
        backgroundColor: 'rgba(34,197,94,0.1)',
        pointBackgroundColor: 'rgba(34,197,94,1)',
        pointBorderColor: '#fff',
        tension: 0.4,
        fill: true,
        pointStyle: 'circle',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Replies Received',
        data: repliesData,
        borderColor: 'rgba(239,68,68,1)', // red
        backgroundColor: 'rgba(239,68,68,0.1)',
        pointBackgroundColor: 'rgba(239,68,68,1)',
        pointBorderColor: '#fff',
        tension: 0.4,
        fill: true,
        pointStyle: 'rectRot',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          font: { size: 16 },
          // Add icons to legend if desired
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            // Add icons or custom text here
            const icon = context.dataset.label === 'Emails Sent' ? '📤' : '📥';
            return `${icon} ${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
      title: {
        display: true,
        text: 'Email Campaign Performance',
        font: { size: 20 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 10 }
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  // --- Signup Date & Industry Lock Logic ---
  // On first load, store signupDate if not present
  useEffect(() => {
    if (!user) return;
    let signupDate = localStorage.getItem('signupDate');
    if (!signupDate) {
      signupDate = new Date().toISOString();
      localStorage.setItem('signupDate', signupDate);
    }
  }, [user]);

  // Calculate days since signup
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

  // Enhanced industry grid with lock/blur/countdown
  const renderIndustryGrid = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: 'spring' }}
      className="relative z-10"
    >
      <div className="flex items-center mb-6 gap-2">
        <SparklesIcon className="w-7 h-7 text-blue-500 animate-pulse" />
        <h2 className="text-2xl md:text-3xl font-bold font-poppins tracking-tight">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">AI-Powered Industry Selection</span>
        </h2>
        <BoltIcon className="w-6 h-6 text-yellow-400 animate-bounce ml-2" />
      </div>
      <p className="text-gray-500 dark:text-gray-300 mb-4 text-lg font-poppins">
        {daysSinceSignup < 4
          ? `All 5 starter industries are unlocked for your first ${4 - daysSinceSignup} day(s).`
          : 'One industry just locked! Upgrade for full access.'}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {industriesList.map((ind) => {
          const isOpen = OPEN_INDUSTRIES.includes(ind.name);
          const isLocked = lockedIndustries.includes(ind.name);
          const isSelectable = isOpen && !isLocked;
          return (
            <motion.button
              key={ind.name}
              whileHover={isSelectable ? { boxShadow: '0 0 0 4px rgba(59,130,246,0.15), 0 8px 32px 0 rgba(59,130,246,0.10)', filter: 'brightness(1.05)' } : {}}
              whileTap={{}}
              disabled={!isSelectable}
              onClick={() => isSelectable && setSelectedIndustry(ind.name)}
              className={`relative flex flex-col items-center justify-center p-5 rounded-2xl shadow-lg transition-all duration-300 border-2 font-poppins
                ${selectedIndustry === ind.name && isSelectable ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'border-transparent bg-white dark:bg-gray-800'}
                ${isSelectable ? 'cursor-pointer hover:shadow-2xl hover:border-blue-400 hover:ring-2 hover:ring-blue-300' : 'opacity-60 cursor-not-allowed'}
              `}
              style={{ minHeight: 120 }}
            >
              <span className={`text-3xl mb-2 ${isSelectable ? '' : 'opacity-60'}`}>{ind.icon}</span>
              <span className={`text-lg font-semibold ${isSelectable ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{ind.name}</span>
              {/* Countdown for free period for each industry */}
              {isOpen && !isLocked && (() => {
                const idx = LOCK_ORDER.indexOf(ind.name);
                if (idx === -1) return null;
                const lockDay = 1 + idx * 3 + 3; // Day it will lock
                if (daysSinceSignup < lockDay) {
                  const daysLeft = lockDay - daysSinceSignup;
                  return (
                    <span className="absolute top-1 left-1 text-[10px] font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-2 py-0.5 rounded-full shadow-sm border border-white dark:border-gray-900 z-20 select-none">
                      Free for {daysLeft} more day{daysLeft === 1 ? '' : 's'}
                    </span>
                  );
                }
                return null;
              })()}
              {/* Blur overlay and lock for locked industry */}
              {isLocked && (
                <span className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-[2px] rounded-2xl z-10">
                  <LockClosedIcon className="w-8 h-8 text-purple-500 mb-2 animate-pulse" />
                  <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold text-center px-2">
                    This was available in your free access.<br />Upgrade to unlock again + get 10+ premium industries.
                  </span>
                </span>
              )}
              {/* Sparkle for open/selectable */}
              {isSelectable && (
                <span className="absolute top-2 right-2 animate-pulse">
                  <SparklesIcon className="w-5 h-5 text-blue-400" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  // Compose the industry list for display
  const industriesList = [
    { name: 'Technology', icon: '💻', color: 'bg-blue-500' },
    { name: 'Marketing', icon: '📢', color: 'bg-indigo-500' },
    { name: 'E-commerce', icon: '🛍️', color: 'bg-pink-500' },
    { name: 'Real Estate', icon: '🏠', color: 'bg-red-500' },
    { name: 'Education', icon: '📚', color: 'bg-purple-500' },
    { name: 'Healthcare', icon: '🏥', color: 'bg-green-500' },
    { name: 'Finance', icon: '💰', color: 'bg-yellow-500' },
    { name: 'Manufacturing', icon: '🏭', color: 'bg-gray-500' },
  ];

  useEffect(() => {
    const handleUserUpdate = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // If no user in localStorage, try to fetch from Supabase
        try {
          const { supabase } = await import('../supabase');
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userObj = {
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email,
              photoURL: session.user.user_metadata?.avatar_url,
            };
            localStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
          }
        } catch (err) {
          console.error('Failed to fetch user from Supabase:', err);
        }
      }
    };
    window.addEventListener('user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    handleUserUpdate();
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  // If there is a file input for campaign creation, add a handleFileChange function:
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.split('.').pop().toLowerCase() !== 'csv') {
      setFormError('Please upload a CSV file.');
      // Optionally, clear the file input
      return;
    }
    setFormError("");
    // setCsvFile(file); // or whatever state is used
  };

  const handleDashboardStartCampaign = (selectedIndustry) => {
    navigate('/campaigns', { state: { openModal: true, industry: selectedIndustry } });
  };

  useEffect(() => {
    if (gmailJustConnected) {
      toast.success(`Gmail connected: ${gmailEmail || 'Your account'}`, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
      setGmailJustConnected(false);
    }
  }, [gmailJustConnected, gmailEmail]);

  return (
    <div className="min-h-screen w-full font-poppins relative">
      <AppSidebar />
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden fixed top-16 left-6 z-50 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -320, y: 0 }}
        animate={{ x: sidebarOpen ? 0 : -320, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="hidden fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl z-40 border-r border-gray-200/50 dark:border-gray-700/50 rounded-r-3xl overflow-y-auto pb-6"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Navigation</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-3 flex-1">
            <button
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-semibold">Dashboard</span>
            </button>
            <button
              onClick={() => { setActiveTab('analyzer'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analyzer'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-semibold">Website Analyzer</span>
            </button>
            <button
              onClick={() => navigate('/writer')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="font-semibold">Smart Writer</span>
            </button>
            <button
              onClick={() => navigate('/seo-optimizer')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-semibold">SEO Optimizer</span>
            </button>
            <button
              onClick={() => navigate('/brand-generator')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {/* Lucide Palette icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
                <path d="M10 8h.01" />
                <path d="M15 8h.01" />
                <path d="M12 6h.01" />
                <path d="M11 12a4 4 0 0 0 4 4h1a2 2 0 0 0 2-2c0-1.1-.9-2-2-2h-1" />
              </svg>
              <span className="font-semibold">Brand Generator</span>
            </button>
            <button
              onClick={() => navigate('/campaigns')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Campaigns</span>
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-semibold">Analytics</span>
            </button>
          </nav>
        </div>
      </motion.div>

      {/* Fixed full-screen background gradient */}
      <div className="fixed inset-0 w-full h-full z-0 bg-gradient-to-br from-[#e3e9fa] via-[#c7d2fe] to-[#f3e8ff] dark:from-[#0a183d] dark:via-[#1a237e] dark:to-[#4b006e]" aria-hidden="true"></div>
      {/* Scrollable content */}
      <div className="relative min-h-screen w-full flex flex-col px-0 z-10 bg-transparent">
        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'analyzer' ? (
          <div className="pt-20">
            <Analyzer />
          </div>
        ) : (
          <>
            {/* Animated Welcome Message */}
            <div className="flex flex-col items-center justify-center pt-8 pb-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, type: 'spring', bounce: 0.4 }}
                className="mb-2"
              >
                <span
                  className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 drop-shadow-lg font-[Pacifico,cursive]"
                  style={{ letterSpacing: '2px', lineHeight: 1.1 }}
                >
                  Hi{user?.name ? `, ${user.name.split(' ')[0]}!` : user?.displayName ? `, ${user.displayName.split(' ')[0]}!` : user?.email ? `, ${user.email.split('@')[0]}!` : '!'}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8, type: 'spring' }}
                className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 font-poppins"
              >
                AI Command Center
              </motion.div>
            </div>

            {/* NEW: AI COMMAND CENTER GRID */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="max-w-7xl mx-auto w-full px-4 mb-8"
            >
              {/* Neural Activity Feed - The "Pulse" of the Platform */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 border border-white/5 mb-8 shadow-2xl relative overflow-hidden group">
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                <div className="relative z-10 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping absolute inset-0"></div>
                      <div className="w-3 h-3 rounded-full bg-blue-500 relative"></div>
                    </div>
                    <h3 className="text-white font-black tracking-tight text-lg uppercase">Neural Activity Feed</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest bg-white/5 px-3 py-1 rounded-full">Live Orchestration</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-blue-500/40 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                      <div className="w-1 h-3 bg-blue-500/60 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                      <div className="w-1 h-3 bg-blue-500/80 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {activities.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${activity.type === 'search' ? 'bg-blue-500/10 text-blue-400' :
                          activity.type === 'analysis' ? 'bg-purple-500/10 text-purple-400' :
                            activity.type === 'writing' ? 'bg-pink-500/10 text-pink-400' :
                              'bg-indigo-500/10 text-indigo-400'
                          }`}>
                          {activity.type === 'search' && <RocketLaunchIcon className="w-4 h-4" />}
                          {activity.type === 'analysis' && <SparklesIcon className="w-4 h-4" />}
                          {activity.type === 'writing' && <ChatBubbleLeftRightIcon className="w-4 h-4" />}
                          {activity.type === 'system' && <ShieldCheckIcon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-300 font-medium leading-relaxed truncate-2-lines line-clamp-2">
                            {activity.message}
                          </p>
                          <span className="text-[10px] text-gray-500 mt-1 block">{activity.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Premium AI Agent Status Hub */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Lead Engine Agent */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative group overflow-hidden bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 shadow-xl cursor-pointer"
                  onClick={() => navigate('/leads')}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                        <RocketLaunchIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                        <span className="text-[10px] font-bold text-green-400">ACTIVE</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Lead Engine</h3>
                    <p className="text-sm text-gray-400 mb-4">Neural scraping technology</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Today's Finds</span>
                        <span className="text-sm font-bold text-blue-400">2,489</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Accuracy</span>
                        <span className="text-sm font-bold text-green-400">99.2%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Sentiment Scorer Agent */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative group overflow-hidden bg-gradient-to-br from-purple-900/40 to-purple-950/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                        <SparklesIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full">
                        <span className="text-[10px] font-bold text-amber-400">COMING SOON</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Sentiment Scorer</h3>
                    <p className="text-sm text-gray-400 mb-4">AI-powered mood analysis</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Hot Leads</span>
                        <span className="text-sm font-bold text-purple-400">--</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Avg. Temperature</span>
                        <span className="text-sm font-bold text-orange-400">--</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Icebreaker Agent */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => setShowIcebreakerModal(true)}
                  className="relative group overflow-hidden bg-gradient-to-br from-pink-900/40 to-pink-950/60 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/20 shadow-xl cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-pink-500/20 rounded-xl border border-pink-500/30">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-pink-400" />
                      </div>
                      <div className="px-2 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full animate-pulse">
                        <span className="text-[10px] font-bold text-pink-400">REVIEW (3)</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Icebreaker AI</h3>
                    <p className="text-sm text-gray-400 mb-4">Hyper-personalized openers</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Generated</span>
                        <span className="text-sm font-bold text-pink-400">1,204</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Success Rate</span>
                        <span className="text-sm font-bold text-green-400">42%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Objection Handler Agent */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => setShowObjectionModal(true)}
                  className="relative group overflow-hidden bg-gradient-to-br from-indigo-900/40 to-indigo-950/60 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/20 shadow-xl cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                        <ShieldCheckIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-green-400">ONLINE</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Objection Handler</h3>
                    <p className="text-sm text-gray-400 mb-4">RAG-powered responses</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Handled</span>
                        <span className="text-sm font-bold text-indigo-400">--</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Conversion</span>
                        <span className="text-sm font-bold text-green-400">--</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* NEW: LEAD INTELLIGENCE HUB (Sentiment Heat Map) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.8 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
              >
                {/* Sentiment Heat Map Gauge */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">Lead Intelligence Hub</h3>
                        <p className="text-gray-400 text-sm">Real-time sentiment distribution across your funnel</p>
                      </div>
                      <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <SparklesIcon className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-10">
                      {/* Circular Gauge Representation */}
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          {/* Angry / Critical (Red) */}
                          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-red-500/20" />
                          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray="502" strokeDashoffset="450" className="text-red-500" />

                          {/* Cold (Gray/Blue) */}
                          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray="502" strokeDashoffset="350" className="text-slate-600" />

                          {/* Warm / Curious (Yellow) */}
                          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray="502" strokeDashoffset="200" className="text-amber-400" />

                          {/* Hot / Ready (Green) */}
                          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray="502" strokeDashoffset="50" className="text-green-400" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-white">92</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Score</span>
                        </div>
                      </div>

                      {/* Legend & Stats */}
                      <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ready to Buy</span>
                          </div>
                          <div className="text-2xl font-black text-white">42%</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Curious</span>
                          </div>
                          <div className="text-2xl font-black text-white">31%</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cold Leads</span>
                          </div>
                          <div className="text-2xl font-black text-white">18%</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Critical</span>
                          </div>
                          <div className="text-2xl font-black text-white">9%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Opportunity Card */}
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group border-purple-500/30">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-6">Top AI Opportunity</h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🏢</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">TechFlow Solutions</p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">"Interested in scaling but worried about onboarding speed..."</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-[10px] font-bold text-green-400">98% Match</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-400">High Intent</span>
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-white text-black font-black rounded-2xl text-sm shadow-xl shadow-white/10 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                        <SparklesIcon className="w-4 h-4" />
                        Generate AI Response
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Lead Engine Hero Widget - Enhanced for Platform Feel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="mb-8"
              >
                <div className="relative group overflow-hidden bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl transition-all hover:border-blue-500/30">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <RocketLaunchIcon className="w-48 h-48 text-blue-400 rotate-12 transition-transform group-hover:scale-110" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <SparklesIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Core Feature</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                        Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">High-Performance</span> <br />
                        Lead Generation
                      </h2>
                      <p className="text-gray-400 text-lg mb-8 max-w-xl leading-relaxed">
                        Experience our unique neural scraping technology. Find thousands of hyper-targeted leads in minutes, not days.
                      </p>

                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button
                          onClick={() => navigate('/leads')}
                          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
                        >
                          <RocketLaunchIcon className="w-5 h-5" />
                          Launch Lead Engine
                        </button>
                        <div className="flex items-center gap-4 px-6 border-l border-white/10 ml-2">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">50k+</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Leads Found Today</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">99.2%</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Accuracy Rate</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block flex-shrink-0">
                      <div className="relative w-64 h-64">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl rotate-6 blur-xl"></div>
                        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-full">
                          <div className="flex items-center justify-between mb-4">
                            <SparklesIcon className="w-8 h-8 text-blue-400" />
                            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                              <span className="text-xs font-bold text-green-400">LIVE</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-300">
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                              <span className="text-sm">Scanning 1,240 sources</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                              <span className="text-sm">AI filtering active</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                              <span className="text-sm">Quality verified ✓</span>
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/10">
                            <div className="text-3xl font-black text-white mb-1">2,489</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">New Leads This Hour</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI-powered Industry Selection Section */}
              <div className="relative py-10 px-4 md:px-8 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 shadow-xl mb-8 overflow-hidden">
                {/* AI feeling animated background */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: 'radial-gradient(circle at 60% 40%, #3b82f6 0%, #a855f7 40%, transparent 80%)',
                    filter: 'blur(60px)',
                  }}
                />
                {renderIndustryGrid()}
                {/* Highlighted Start Button */}
                <motion.div
                  initial={{ opacity: 0.7 }}
                  animate={selectedIndustry ? { opacity: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex justify-center mt-8 z-10"
                >
                  <button
                    onClick={() => handleDashboardStartCampaign(selectedIndustry)}
                    disabled={!selectedIndustry}
                    className={`px-8 py-3 rounded-full text-lg font-bold font-poppins transition-all duration-300 shadow-lg
              ${selectedIndustry ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white ring-4 ring-blue-300/40 hover:brightness-110 hover:shadow-2xl' : 'bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
                  >
                    {selectedIndustry ? `Start ${selectedIndustry} Campaign` : 'Select Industry to Start'}
                  </button>
                </motion.div>
                {/* Premium Industries Card (moved below industry selection) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, type: 'spring' }}
                  className="mt-10 flex justify-center"
                >
                  <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-xl w-full max-w-xl">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">🌐</span>
                        <div>
                          <div className="text-lg md:text-xl font-bold text-gray-900 dark:text-white font-poppins">Unlock 10+ Premium Industries</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Upgrade to access Healthcare, Finance, Manufacturing, and more!</div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/pricing')}
                        className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:brightness-110 transition-all font-poppins"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
              {/* Stats Cards with Icons */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8 relative"
              >
                {[
                  {
                    label: t('totalEmails'),
                    value: stats.totalEmails,
                    color: 'bg-blue-500 dark:bg-blue-600',
                    icon: <EnvelopeIcon className="h-6 w-6 text-white" />
                  },
                  {
                    label: t('sent'),
                    value: stats.sent,
                    color: 'bg-green-500 dark:bg-green-600',
                    icon: <PaperAirplaneIcon className="h-6 w-6 text-white" />
                  },
                  {
                    label: t('replies'),
                    value: stats.replies,
                    color: 'bg-yellow-500 dark:bg-yellow-600',
                    icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                  },
                  {
                    label: t('successRate'),
                    value: '85%',
                    color: 'bg-purple-500 dark:bg-purple-600',
                    icon: <ChartBarIcon className="h-6 w-6 text-white" />
                  },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-center">
                      <div className={`${stat.color} p-3 rounded-full shadow-md`}>
                        {stat.icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{stat.label}</p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Chart */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300"
                style={{ minHeight: 350, height: 350 }}
              >
                <Line data={chartData} options={chartOptions} />
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300"
              >
                <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('recentActivity')}</h2>
                <div className="space-y-4">
                  {[
                    { type: 'positive', message: t('positiveReply') },
                    { type: 'negative', message: t('negativeReply') },
                    { type: 'neutral', message: t('neutralReply') },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className={`p-4 rounded-lg transition-colors duration-300 ${activity.type === 'positive'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200'
                        : activity.type === 'negative'
                          ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                    >
                      {activity.message}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
        <ConnectGmailModal
          open={showConnectGmailModal}
          onClose={() => setShowConnectGmailModal(false)}
          onConnected={email => {
            setGmailJustConnected(true);
            refreshGmailStatus();
            setShowConnectGmailModal(false);
            // After connecting Gmail, if there was a pending campaign, create it now
            if (pendingCampaign) {
              setShowStartModal(false);
              setLoading(false);
              setPendingCampaign(null);
            }
          }}
          gmailEmail={gmailEmail}
        />
        {/* Upgrade Banner for Real Estate lock (FOMO) */}
        {lockedIndustries.includes('Real Estate') && (
          <div className="max-w-4xl mx-auto w-full mb-8">
            <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg px-6 py-4 gap-3">
              <div className="text-lg font-semibold text-blue-900 dark:text-white font-poppins flex items-center gap-2">
                <span className="mr-2">⏳</span>Real Estate just locked. <span className="font-bold text-purple-700 dark:text-purple-300 ml-1">Upgrade now to unlock it + 10 more premium industries.</span>
              </div>
              <button
                onClick={() => navigate('/pricing-payment')}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow hover:shadow-lg transition-all text-lg font-poppins"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
        {/* Show form error if present */}
        {formError && (
          <div className="w-full mb-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold text-sm text-center shadow font-poppins">
            {formError}
          </div>
        )}
        <div className="mt-auto">
          <Footer />
        </div>

        <IcebreakerReviewModal
          open={showIcebreakerModal}
          onClose={() => setShowIcebreakerModal(false)}
        />
        <ObjectionHandlerModal
          open={showObjectionModal}
          onClose={() => setShowObjectionModal(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard; 