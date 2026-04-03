'use client';
import React from 'react';
import Writer from '../components/Writer';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { SparklesIcon } from '@heroicons/react/24/outline';

const WriterPage = () => {
  return (
    <div className="min-h-screen bg-white font-poppins selection:bg-blue-100">
      <DashboardHeader showGreeting={false} title="Outreach Writer" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <main className="p-4 md:p-8 2xl:p-12 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-28 scale-[0.90] origin-top">
            <div className="pt-10">
              <Writer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WriterPage;
