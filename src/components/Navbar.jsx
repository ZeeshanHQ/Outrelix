import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon, SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '/flags/us.png', fallback: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '/flags/es.png', fallback: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '/flags/cn.png', fallback: '🇨🇳' },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(window.scrollY);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  // Determine if we are on a dashboard-related route
  const isDashboardRoute = [
    '/dashboard',
    '/campaigns',
    '/analytics',
    '/settings',
  ].some((route) => location.pathname.startsWith(route));

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 40) {
        setShowNavbar(true);
        lastScrollY.current = window.scrollY;
        return;
      }
      if (window.scrollY > lastScrollY.current) {
        setShowNavbar(false); // scrolling down
      } else {
        setShowNavbar(true); // scrolling up
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleUserUpdate = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };
    window.addEventListener('user-updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    handleUserUpdate();
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  return (
    <nav
      className={`fixed w-full z-[100] transition-transform duration-300 ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center h-full mr-6 pl-2">
            <img 
              src="/outrelix-light.png" 
              alt="Outrelix Logo" 
              className="h-36 w-auto object-contain drop-shadow-sm dark:hidden" 
              onError={e => { e.target.onerror = null; e.target.src = '/logo192.png'; }}
            />
            <img 
              src="/outrelix-dark.png" 
              alt="Outrelix Logo" 
              className="h-36 w-auto object-contain drop-shadow-sm hidden dark:block" 
              onError={e => { e.target.onerror = null; e.target.src = '/outrelix-light.png'; }}
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {isDashboardRoute ? (
              [
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/campaigns', label: 'Campaigns' },
                { to: '/analytics', label: 'Analytics' },
                { to: '/settings', label: 'Settings' },
              ].map((nav, idx) => (
                <Link
                  key={nav.to}
                  to={nav.to}
                  className="relative px-4 py-2 rounded-full font-light text-sm tracking-wide font-poppins text-gray-900 dark:text-white transition-all duration-300 group hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                >
                  <span className="z-10 relative">{nav.label}</span>
                  <span className="absolute left-4 right-4 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-center"></span>
                  <span className="absolute inset-0 rounded-full bg-primary-50 dark:bg-primary-900 opacity-0 group-hover:opacity-15 transition-all duration-300"></span>
                </Link>
              ))
            ) : (
              [
                { to: '/#features', label: 'Features', sectionId: 'features' },
                { to: '/pricing-page', label: 'Pricing' },
                { to: '/faq', label: 'FAQ' },
                { to: '/contact', label: 'Contact' },
              ].map((nav, idx) => (
                nav.sectionId ? (
                  <button
                    key={nav.to}
                    onClick={() => {
                      const element = document.getElementById(nav.sectionId);
                      if (element) {
                        element.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    className="relative px-4 py-2 rounded-full font-light text-sm tracking-wide font-poppins text-gray-900 dark:text-white transition-all duration-300 group hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                  >
                    <span className="z-10 relative">{nav.label}</span>
                    <span className="absolute left-4 right-4 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-center"></span>
                    <span className="absolute inset-0 rounded-full bg-primary-50 dark:bg-primary-900 opacity-0 group-hover:opacity-15 transition-all duration-300"></span>
                  </button>
                ) : (
                  <Link
                    key={nav.to}
                    to={nav.to}
                    className="relative px-4 py-2 rounded-full font-light text-sm tracking-wide font-poppins text-gray-900 dark:text-white transition-all duration-300 group hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                  >
                    <span className="z-10 relative">{nav.label}</span>
                    <span className="absolute left-4 right-4 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-center"></span>
                    <span className="absolute inset-0 rounded-full bg-primary-50 dark:bg-primary-900 opacity-0 group-hover:opacity-15 transition-all duration-300"></span>
                  </Link>
                )
              ))
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-3 sm:space-x-4 pr-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-700/30 transition-colors duration-200"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? (
                <SunIcon className="w-5 h-5 text-yellow-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-900 dark:text-white" />
              )}
            </button>

            {/* Enhanced Language Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center focus:outline-none px-3 py-2 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-700/30 transition-colors duration-200 border border-gray-200/50 dark:border-gray-600/50"
                onClick={() => setDropdownOpen((open) => !open)}
                aria-label="Change language"
              >
                <img
                  src={currentLang.flag}
                  alt={currentLang.label}
                  className="rounded-full mr-2"
                  style={{ width: '18px', height: '18px', objectFit: 'cover' }}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentLang.code === 'en' ? 'EN' : currentLang.code === 'zh' ? 'CN' : currentLang.code.toUpperCase()}
                </span>
                <svg className="w-4 h-4 ml-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-32 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 border border-gray-200 dark:border-gray-600"
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { i18n.changeLanguage(lang.code); setDropdownOpen(false); }}
                        className={`w-full flex items-center px-4 py-3 text-gray-900 dark:text-white hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors ${i18n.language === lang.code ? 'font-bold bg-primary-100 dark:bg-primary-800' : ''}`}
                      >
                        <img
                          src={lang.flag}
                          alt={lang.label}
                          className="rounded-full mr-3"
                          style={{ width: '18px', height: '18px', objectFit: 'cover' }}
                        />
                        <span className="text-sm">{lang.code === 'en' ? 'English' : lang.code === 'zh' ? '中文' : 'Español'}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            {user && (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none px-2 py-1 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-700/30 transition-colors duration-200"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name || user.displayName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'User')}
                  </span>
                </button>
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          {t('nav_dashboard')}
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          {t('nav_settings')}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t('nav_signout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 