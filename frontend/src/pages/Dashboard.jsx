'use client';
import React from 'react';
import AppSidebar from '../components/AppSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import MonthlyTargetChart from '../components/dashboard/MonthlyTargetChart';
import MonthlySalesChart from '../components/dashboard/MonthlySalesChart';
import StatisticsChart from '../components/dashboard/StatisticsChart';
import NeuralFeed from '../components/dashboard/NeuralFeed';

const Dashboard = () => {
  return (
    <>
      <DashboardHeader showGreeting={true} />
      {/* Scrollable Content Area */}
      <main className="p-4 md:p-8 2xl:p-12 min-h-screen bg-white transition-colors duration-500">
        <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-24 scale-[0.90] origin-top">
          {/* 1. Key Metrics Grid */}
          <DashboardMetrics />

          {/* 2. Charts Row (Target + Sales) */}
          <div className="grid grid-cols-12 gap-10 2xl:gap-12">
            <MonthlyTargetChart />
            <MonthlySalesChart />
          </div>

          {/* 3. Statistics Chart (Full Width) */}
          <div className="grid grid-cols-12 gap-10 2xl:gap-12">
            <StatisticsChart />
          </div>

          {/* 4. Neural Feed (List) */}
          <div className="grid grid-cols-12 gap-10 2xl:gap-12">
            <NeuralFeed />
          </div>

        </div>
      </main>
    </>
  );
};

export default Dashboard;