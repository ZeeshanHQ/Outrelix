import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  PenTool,
  Settings,
  Palette,
  Mail,
  BarChart2,
  Users,
  Menu,
  FileText,
  CreditCard,
  Gift,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';

const navSections = [
  {
    title: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: Home, to: '/dashboard' },
      { key: 'leads', label: 'Lead Generation', icon: Users, to: '/leads' },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { key: 'analyzer', label: 'Website Analyzer', icon: Search, to: '/analyze' },
      { key: 'seo', label: 'SEO Optimizer', icon: Settings, to: '/seo-optimizer' },
      { key: 'brand', label: 'Brand Generator', icon: Palette, to: '/brand-generator' },
    ]
  },
  {
    title: 'Execution',
    items: [
      { key: 'campaigns', label: 'Campaigns', icon: Mail, to: '/campaigns' },
      { key: 'analytics', label: 'Analytics', icon: BarChart2, to: '/analytics' },
    ]
  },
  {
    title: 'System',
    items: [
      { key: 'billing', label: 'Billing & Plans', icon: CreditCard, to: '/billing' },
    ]
  },
];

const AppSidebar = () => {
  const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to) => location.pathname.startsWith(to);

  const sidebarWidth = isCollapsed ? 'w-[72px]' : 'w-[280px]';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <motion.div
        className={`fixed left-0 inset-y-0 bg-white border-r border-slate-200/60 shadow-xl z-[90] flex flex-col transition-all duration-300 ease-in-out ${sidebarWidth} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className={`h-[80px] flex items-center border-b border-slate-100 transition-all duration-300 overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          {!isCollapsed ? (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src="/outrelix-light.png"
              alt="Outrelix"
              className="h-9 w-auto object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo192.png'; }}
            />
          ) : (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src="/outrelix.png"
              alt="O"
              className="h-8 w-8 object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = '/logo192.png'; }}
            />
          )}

          {/* Toggle Button (Desktop) */}
          <button
            onClick={toggleCollapse}
            className={`hidden lg:flex absolute -right-3 top-9 bg-white border border-slate-200 p-1 rounded-full shadow-sm hover:shadow-md hover:text-blue-600 transition-all z-50`}
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className={`space-y-6 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-3.5 mb-2"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {section.title}
                    </span>
                  </motion.div>
                )}
                {section.items.map(({ key, label, icon: Icon, to }) => {
                  const active = isActive(to);
                  return (
                    <button
                      key={key}
                      onClick={() => { navigate(to); closeMobile(); }}
                      className={`relative flex items-center transition-all duration-200 group w-full overflow-hidden
                        ${isCollapsed ? 'justify-center h-11 rounded-xl' : 'gap-3 px-3.5 py-2.5 rounded-lg'}
                        ${active
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/50'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                        }`}
                    >
                      <Icon className={`flex-shrink-0 transition-transform duration-300 ${isCollapsed ? 'w-5 h-5 group-hover:scale-110' : 'w-4 h-4'} ${!active && 'text-slate-400 group-hover:text-blue-500'}`} />

                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="font-bold text-xs whitespace-nowrap"
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
                          {label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer / Refer & Earn */}
        <div className={`mt-auto border-t border-slate-50 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <motion.div
            whileHover={{ scale: 1.02, translateY: -2 }}
            className={`relative flex items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100/50 shadow-sm transition-all duration-300 cursor-pointer group ${isCollapsed ? 'justify-center py-3 px-0' : 'gap-3 p-3'}`}
            onClick={() => navigate('/referrals')}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md ring-2 ring-white/50 ${isCollapsed ? '' : 'group-hover:shadow-lg transition-shadow'}`}
            >
              <Gift className="w-4 h-4" />
            </motion.div>

            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden relative z-10">
                <span className="text-xs font-bold text-indigo-900 truncate">Refer & Earn</span>
                <span className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter">Get 1 Month Free</span>
              </div>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
                Refer & Earn
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default AppSidebar;
