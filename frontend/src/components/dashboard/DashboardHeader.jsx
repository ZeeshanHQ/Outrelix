import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Calendar, Inbox, Check, Trash2, X } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ showGreeting = true, title = '' }) => {
    const [user, setUser] = useState(null);
    const [greeting, setGreeting] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const navigate = useNavigate();
    const notifRef = useRef(null);

    const appPages = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Analyze', path: '/analyze' },
        { name: 'Writer', path: '/writer' },
        { name: 'Brand Generator', path: '/brand-generator' },
        { name: 'SEO Optimizer', path: '/seo-optimizer' },
        { name: 'Campaigns', path: '/campaigns' },
        { name: 'Leads', path: '/leads' },
        { name: 'Analytics', path: '/analytics' },
        { name: 'Settings', path: '/settings' },
        { name: 'Billing', path: '/billing' },
    ];

    useEffect(() => {
        const loadUser = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (e) {
                    console.error('Failed to parse user data', e);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        // 1. Initial load + re-load on any account switch event
        loadUser();
        window.addEventListener('user-updated', loadUser);

        // 2. Set Greeting
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        // 3. Set Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString(undefined, options));

        // Click outside listener for notifications
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        // Listen for new notifications to shake the bell
        const handleNewNotif = () => {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        };
        window.addEventListener('new-notification', handleNewNotif);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('new-notification', handleNewNotif);
            window.removeEventListener('user-updated', loadUser);
        };

    }, []);

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const targetPage = appPages.find(p => p.name.toLowerCase().includes(query));
            if (targetPage) {
                navigate(targetPage.path);
            } else {
                navigate(`/leads?q=${encodeURIComponent(searchQuery)}`);
            }
            setSearchQuery('');
        }
    };

    const bellVariants = {
        shake: {
            rotate: [0, -15, 15, -15, 15, 0],
            transition: { duration: 0.5 }
        },
        idle: { rotate: 0 }
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-[80px] flex items-center">
            <div className="flex items-center justify-between px-0 w-full mx-auto">
                <div className="pl-12 lg:pl-20 transition-all duration-300">
                    {showGreeting ? (
                        <>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                                {greeting}, {user?.displayName ? user.displayName.split(' ')[0] : 'Legend'} <span className="text-2xl">👋</span>
                            </h1>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-wider">
                                <Calendar className="w-3 h-3" />
                                {currentDate}
                            </div>
                        </>
                    ) : (
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            {title}
                        </h1>
                    )}
                </div>

                <div className="flex items-center gap-6 pr-6 lg:pr-12">
                    <div className="hidden md:block relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Type 'Leads', 'Writer' or search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                            className="w-64 pl-10 pr-4 py-2 bg-slate-100/50 border border-transparent rounded-full text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="h-6 w-px bg-slate-200"></div>

                    <div className="relative" ref={notifRef}>
                        <motion.button
                            variants={bellVariants}
                            animate={isShaking ? "shake" : "idle"}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-500 hover:text-blue-600'}`}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden outline-none"
                                >
                                    <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                        <div className="flex gap-2">
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-600 hover:underline">Mark read</button>
                                            )}
                                            <button onClick={clearNotifications} className="text-slate-400 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                                                <Inbox className="w-8 h-8 opacity-20 mb-2" />
                                                <p className="text-xs font-medium">All caught up!</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => !n.read && markAsRead(n.id)}
                                                    className={`px-5 py-4 border-b border-slate-50 cursor-pointer transition-colors ${n.read ? 'opacity-60 bg-white' : 'bg-blue-50/30 hover:bg-blue-50'}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1 p-1.5 rounded-lg ${n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {n.type === 'success' ? <Check className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-xs leading-relaxed ${n.read ? 'text-slate-600' : 'text-slate-800 font-bold'}`}>
                                                                {n.message}
                                                            </p>
                                                            <span className="text-[10px] text-slate-400 mt-1 block">
                                                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 self-center"></div>}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                                        <button onClick={() => setIsNotifOpen(false)} className="text-[10px] font-bold text-slate-500 hover:text-slate-800">Close</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <UserProfileDropdown user={user} />
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
