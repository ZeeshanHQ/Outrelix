'use client';
import React from 'react';
import Writer from '../components/Writer';
import AppSidebar from '../components/AppSidebar';

const WriterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e3e9fa] via-[#c7d2fe] to-[#f3e8ff] dark:from-[#0a183d] dark:via-[#1a237e] dark:to-[#4b006e]">
      <AppSidebar />
      <div className="pt-24 pb-8">
        <Writer />
      </div>
    </div>
  );
};

export default WriterPage;
