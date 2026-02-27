import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../supabase';

const UserProfileDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/'; // Hard reload to clear states
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 pl-3 py-1 pr-2 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
                <div className="text-right hidden lg:block pl-2">
                    <span className="block text-sm font-bold text-slate-700 leading-none group-hover:text-blue-600 transition-colors">
                        {user.displayName || user.name}
                    </span>
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                        Pro Account
                    </span>
                </div>
                <div className="h-9 w-9 rounded-full bg-slate-100 p-0.5 ring-2 ring-transparent group-hover:ring-blue-100 transition-all flex-shrink-0">
                    <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=3C50E0&color=fff`}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover"
                    />
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 origin-top-right"
                    >
                        <div className="px-4 py-3 border-b border-slate-100 mb-2">
                            <p className="text-sm font-bold text-slate-800">Signed in as</p>
                            <p className="text-xs text-slate-500 truncate font-medium">{user.email}</p>
                        </div>

                        <div className="space-y-1 px-2">
                            <button onClick={() => { navigate('/settings'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <Settings className="w-4 h-4" />
                                Account Settings
                            </button>
                            <button onClick={() => { navigate('/billing'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors">
                                <CreditCard className="w-4 h-4" />
                                Billing & Plan
                            </button>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 px-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserProfileDropdown;
