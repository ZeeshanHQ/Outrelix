import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';

const DashboardHeader = ({ showGreeting = true, title = '' }) => {
    const [user, setUser] = useState(null);
    const [greeting, setGreeting] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        // 1. Get User Data
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse user data', e);
            }
        }

        // 2. Set Greeting
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        // 3. Set Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString(undefined, options));

    }, []);

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-[80px] flex items-center">
            <div className="flex items-center justify-between px-0 w-full mx-auto"> {/* Removed horizontal padding constraints for parent to handle or flush */}

                {/* Left: Greeting/Title or Empty */}
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

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-6">
                    {/* Search Pill */}
                    <div className="hidden md:block relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-64 pl-10 pr-4 py-2 bg-slate-100/50 border border-transparent rounded-full text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="h-6 w-px bg-slate-200"></div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                        </button>
                    </div>

                    {/* User Profile Dropdown */}
                    <UserProfileDropdown user={user} />
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
