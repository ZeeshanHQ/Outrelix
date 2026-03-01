import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../supabase';
import { SunIcon, MoonIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { RainbowButton } from './ui/rainbow-button';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const profileRef = useRef(null);

  const isDashboard = /^\/dashboard|\/campaigns|\/analytics|\/settings|\/admin/.test(pathname);
  const isLanding = pathname === '/' || pathname === '/landing';

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await auth.getSession();
      setUser(session?.user ?? null);
    };
    initAuth();
    const { data: { subscription } } = auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    setProfileOpen(false);
    try {
      await auth.signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const landingLinks = [
    {
      id: 'platform', label: 'Platform', dropdown: [
        { title: 'AI Lead Scraper', desc: 'Find and verify B2B leads', id: 'ai-lead-scraper', to: '/platform/ai-lead-scraper' },
        { title: 'Outreach Writer', desc: 'Generate hyper-personalized emails', id: 'outreach-writer', to: '/platform/outreach-writer' },
        { title: 'Brand Intelligence', desc: 'Analyze and grow your brand', id: 'brand-intelligence', to: '/platform/brand-intelligence' },
        { title: 'SEO Analytics', desc: 'Optimize your search presence', id: 'seo-analytics', to: '/platform/seo-analytics' }
      ]
    },
    {
      id: 'solutions', label: 'Solutions', dropdown: [
        { title: 'For Sales Teams', desc: 'Automate outreach & close more deals', id: 'sales-teams', to: '/solutions/sales-teams' },
        { title: 'For Marketing', desc: 'Scale personalized campaigns', id: 'marketing-teams', to: '/solutions/marketing-teams' },
        { title: 'For Founders', desc: 'Grow your startup on autopilot', id: 'founders', to: '/solutions/founders' }
      ]
    },
    {
      id: 'resources', label: 'Resources', dropdown: [
        { title: 'Success Stories', desc: 'See how companies scale with us', id: 'success-stories', to: '/resources/success-stories' },
        { title: 'Sales Playbooks', desc: 'Expert strategies for outbound', id: 'sales-playbooks', to: '/resources/sales-playbooks' },
        { title: 'Documentation', desc: 'Learn how to use Outrelix', id: 'documentation', to: '/resources/documentation' },
        { title: 'API Reference', desc: 'Integrate our core engine', id: 'api-reference', to: '/resources/api-reference' }
      ]
    },
    {
      id: 'company', label: 'Company', dropdown: [
        { title: 'About Us', desc: 'Our mission and team', id: 'about-us', to: '/about' },
        { title: 'Contact Sales', desc: 'Get in touch with us', id: 'contact', to: '/contact' },
        { title: 'Privacy Center', desc: 'How we protect your data', id: 'privacy', to: '/privacy' },
        { title: 'Security', desc: 'Enterprise-grade security', id: 'security', to: '/terms' }
      ]
    },
    { id: 'pricing', label: 'Pricing', to: '/pricing-payment' }
  ];
  const dashboardLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Campaigns', to: '/campaigns' },
    { label: 'Analytics', to: '/analytics' },
    { label: 'Settings', to: '/settings' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-3'
          : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <img src="/outrelix.png" alt="Outrelix Logo" className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Outrelix<span className="text-blue-600">.</span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center justify-center space-x-1">
              {isDashboard
                ? dashboardLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2 rounded-full text-sm tracking-wide transition-all duration-200 ${pathname === link.to
                      ? 'bg-slate-100/80 text-blue-600 font-semibold shadow-sm'
                      : 'text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))
                : landingLinks.map((link) => (
                  <div
                    key={link.id}
                    className="relative"
                    onMouseEnter={() => link.dropdown && setActiveDropdown(link.id)}
                    onMouseLeave={() => link.dropdown && setActiveDropdown(null)}
                  >
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="inline-flex items-center gap-1 group px-4 py-2 rounded-full text-sm font-medium tracking-wide text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
                    >
                      {link.label}
                      {link.dropdown && <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === link.id ? 'rotate-180 text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />}
                    </button>
                    <AnimatePresence>
                      {activeDropdown === link.id && link.dropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-200/50 p-2 z-50 origin-top"
                        >
                          <div className="flex flex-col gap-1">
                            {link.dropdown.map((item, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  if (item.to) {
                                    navigate(item.to);
                                  } else {
                                    scrollTo(item.id);
                                  }
                                }}
                                className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group/item"
                              >
                                <div className="text-sm font-semibold text-slate-900 group-hover/item:text-blue-600 transition-colors">{item.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Dark mode toggle (Dashboard) */}
              {isDashboard && (
                <button
                  onClick={toggleDark}
                  className="hidden sm:flex p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                >
                  {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                </button>
              )}

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border border-slate-200/60 bg-white/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                  >
                    <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Account'}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                      {user.user_metadata?.avatar_url
                        ? <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                        : (user.email?.[0] || 'U').toUpperCase()
                      }
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-200/50 p-2 z-50 origin-top-right"
                      >
                        <div className="px-3 py-3 mb-2 border-b border-slate-100">
                          <p className="text-sm font-semibold text-slate-900 truncate">{user.user_metadata?.full_name || 'Account'}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                          <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            <span className="text-lg">📊</span> Dashboard
                          </Link>
                          <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            <span className="text-lg">⚙️</span> Settings
                          </Link>
                        </div>
                        <div className="my-2 border-t border-slate-100" />
                        <button onClick={handleSignOut} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                          <span className="text-lg">🚪</span> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center justify-center space-x-6">
                  <Link
                    to="/#login"
                    className="text-slate-600 hover:text-blue-600 text-sm font-semibold transition-colors duration-200"
                  >
                    Log in
                  </Link>
                  <RainbowButton className="px-5 py-2.5 rounded-[11px] text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                    <Link to="/#signup" className="flex items-center justify-center w-full h-full text-white">
                      Start Free Trial
                    </Link>
                  </RainbowButton>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <div className="w-5 flex flex-col gap-1.5">
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-[2px] bg-current rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-6 py-6 overflow-hidden shadow-2xl absolute top-full left-0 right-0 max-h-[85vh] overflow-y-auto"
            >
              <div className="space-y-2">
                {(isDashboard ? dashboardLinks : landingLinks).map((link) =>
                  link.to ? (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-blue-50/50 hover:text-blue-600 transition-colors active:scale-95 origin-left"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      key={link.id}
                      onClick={() => scrollTo(link.id)}
                      className="w-full text-left flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-blue-50/50 hover:text-blue-600 transition-colors active:scale-95 origin-left"
                    >
                      {link.label}
                      <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                    </button>
                  )
                )}

                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/#login" onClick={() => setMobileOpen(false)} className="w-full text-center px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 active:bg-slate-50 transition-colors">
                      Log In
                    </Link>
                    <RainbowButton className="w-full text-center px-4 py-3.5 rounded-[11px] text-sm font-semibold shadow-md active:scale-95 transition-transform">
                      <Link to="/#signup" onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-full h-full text-white">
                        Start Free Trial
                      </Link>
                    </RainbowButton>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;