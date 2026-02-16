import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Analyzer from '../components/Analyzer';
import AppSidebar from '../components/AppSidebar';
import { analyzerApi } from '../lib/supabaseClient';
import { toast } from 'react-toastify';

const AnalyzePage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(null);

  useEffect(() => {
    loadResults();
    checkDailyLimit();
  }, []);

  const loadResults = async () => {
    try {
      const data = await analyzerApi.getResults();
      setResults(data || []);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load previous analyses');
    } finally {
      setLoading(false);
    }
  };

  const checkDailyLimit = async () => {
    try {
      const limit = await analyzerApi.checkDailyLimit();
      setDailyLimit(limit);
    } catch (error) {
      console.error('Error checking daily limit:', error);
    }
  };

  const handleAnalysisComplete = (newResult) => {
    setResults(prev => [newResult, ...prev]);
    checkDailyLimit(); // Refresh limit info
  };

  const handleDeleteResult = async (resultId) => {
    try {
      await analyzerApi.deleteResult(resultId);
      setResults(prev => prev.filter(r => r.id !== resultId));
      toast.success('Analysis deleted successfully');
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete analysis');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <AppSidebar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🔍 Website & App Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Analyze any website or app to get insights, improvement suggestions, and keyword recommendations
          </p>
          
          {/* Daily Limit Info */}
          {dailyLimit && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                Daily analyses: {dailyLimit.max_per_day - dailyLimit.remaining_analyses}/{dailyLimit.max_per_day}
              </span>
            </div>
          )}
        </motion.div>

        {/* Analyzer Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Analyzer onAnalysisComplete={handleAnalysisComplete} />
        </motion.div>

        {/* Previous Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Previous Analyses
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <motion.div
                  key={result.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {result.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {result.url}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteResult(result.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {result.summary}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {result.suggested_keywords?.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(result.url, '_blank')}
                      className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Visit
                    </button>
                    <span className="text-xs text-gray-400 self-center">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <div className="text-gray-400 dark:text-gray-500 text-lg">
              No analyses yet. Start by analyzing your first website above!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;
