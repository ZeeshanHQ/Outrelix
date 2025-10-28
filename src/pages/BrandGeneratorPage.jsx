import React from 'react';
import BrandGenerator from '../components/BrandGenerator';

const BrandGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <BrandGenerator />
      </div>
    </div>
  );
};

export default BrandGeneratorPage;


