'use client';

import React from 'react';
import AppSidebar from '../../components/AppSidebar';
import { useSidebar } from '../../contexts/SidebarContext';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { isCollapsed, toggleMobileCursor } = useSidebar();

    return (
        <div className="min-h-screen bg-slate-50 flex text-sm font-['Outfit']">
            {/* Sidebar (Fixed) */}
            <AppSidebar />

            {/* Mobile Header Trigger (Only visible on mobile) */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 lg:hidden flex items-center px-4">
                <button onClick={toggleMobileCursor} className="p-2 text-slate-600">
                    <Menu className="w-6 h-6" />
                </button>
                <img src="/outrelix-light.png" alt="Logo" className="h-8 ml-4" />
            </div>

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 w-full transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[280px]'} pt-16 lg:pt-0`}
            >
                {children}
            </div>
        </div>
    );
}
