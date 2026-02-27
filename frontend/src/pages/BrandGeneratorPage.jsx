'use client';
import React from 'react';
import { motion } from 'framer-motion';
import BrandGenerator from '../components/BrandGenerator';
import AppSidebar from '../components/AppSidebar';
import { Palette } from 'lucide-react';

const BrandGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <AppSidebar />
      <div className="container mx-auto px-6 py-12 lg:pl-[300px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Brand Generator
            </h1>
          </div>

          <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
            Forge a legendary brand identity. Use Llama 3 to craft high-converting names, taglines, and professional landing page blueprints.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BrandGenerator />
        </motion.div>
      </div>
    </div>
  );
};

export default BrandGeneratorPage;


