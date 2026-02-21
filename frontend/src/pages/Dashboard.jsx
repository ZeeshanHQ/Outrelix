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
      <main className="p-4 2xl:p-6">
        <div className="w-full space-y-8">

          {/* 1. Key Metrics Grid */}
          <DashboardMetrics />

          {/* 2. Charts Row (Target + Sales) */}
          <div className="grid grid-cols-12 gap-6 2xl:gap-8">
            <MonthlyTargetChart />
            <MonthlySalesChart />
          </div>

          {/* 3. Statistics Chart (Full Width) */}
          <div className="grid grid-cols-12 gap-6 2xl:gap-8">
            <StatisticsChart />
          </div>

          {/* 4. Neural Feed (List) */}
          <div className="grid grid-cols-12 gap-6 2xl:gap-8">
            <NeuralFeed />
          </div>

        </div>
      </main>
    </>
  );
};

export default Dashboard;