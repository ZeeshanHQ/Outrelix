'use client';
import React from 'react';
import { motion } from 'framer-motion';
import BrandGenerator from '../components/BrandGenerator';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Palette } from 'lucide-react';

const BrandGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-white font-poppins selection:bg-blue-100">
      <DashboardHeader showGreeting={false} title="Brand Generator" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <main className="p-4 md:p-8 2xl:p-12 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-28 scale-[0.90] origin-top">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BrandGenerator />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BrandGeneratorPage;


