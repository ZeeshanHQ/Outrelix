import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Search, PenTool, Settings as Cog, Palette, Mail, BarChart3, PanelsTopLeft } from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, to: '/dashboard' },
  { key: 'analyzer', label: 'Website Analyzer', icon: Search, to: '/analyze' },
  { key: 'writer', label: 'Smart Writer', icon: PenTool, to: '/writer' },
  { key: 'seo', label: 'SEO Optimizer', icon: Cog, to: '/seo-optimizer' },
  { key: 'brand', label: 'Brand Generator', icon: Palette, to: '/brand-generator' },
  { key: 'campaigns', label: 'Campaigns', icon: Mail, to: '/campaigns' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, to: '/analytics' },
];

const AppSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to) => location.pathname.startsWith(to);

  return (
    <>
      {/* Toggle button - slightly lower */}
      <button
        aria-label="Open navigation"
        onClick={() => setOpen(!open)}
        className="fixed top-16 left-6 z-[60] p-3 rounded-2xl shadow-xl border bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all hover:-translate-y-0.5 backdrop-blur"
      >
        <PanelsTopLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Drawer */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: open ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl z-[55] border-r border-gray-200/50 dark:border-gray-700/50 rounded-r-3xl overflow-y-auto"
      >
        <div className="p-6 pb-4 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Navigation</h2>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="px-4 pb-6 space-y-2">
          {navItems.map(({ key, label, icon: Icon, to }) => (
            <button
              key={key}
              onClick={() => { navigate(to); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(to)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{label}</span>
            </button>
          ))}
        </nav>
      </motion.div>
    </>
  );
};

export default AppSidebar;


