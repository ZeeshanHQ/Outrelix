'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Analyzer from '../components/Analyzer';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { analyzerApi } from '../utils/supabaseHelpers';
import { toast } from 'react-toastify';
import { Search, Trash2, Eye, Mail, X, ExternalLink, RefreshCw } from 'lucide-react';
import EmailGenerator from '../components/EmailGenerator';
import { AnimatePresence } from 'framer-motion';

const AnalyzePage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);

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
    <div className="min-h-screen bg-white font-poppins selection:bg-blue-100">
      <DashboardHeader showGreeting={false} title="Website Analyzer" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <main className="p-4 md:p-8 2xl:p-12 transition-all duration-500">
          <div className="max-w-[1400px] mx-auto space-y-20 lg:space-y-28 scale-[0.90] origin-top">
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
              <div className="mt-24">
                <div className="flex items-center justify-between mb-10 pt-20">
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    Intelligence Vault
                  </h2>
                  <div className="h-px flex-1 bg-slate-50 mx-6" />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-20">
                  {results.map((result) => (
                    <motion.div
                      key={result.id}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-white rounded-[24px] border border-slate-200 p-8 hover:border-blue-400/30 hover:shadow-lg transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1 pr-4">
                          <div className="relative z-10">
                            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1">
                              {result.title}
                            </h3>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                              {new URL(result.url).hostname}
                            </p>
                          </div>
                          <div className="flex gap-2 relative z-10 mt-4">
                            <button
                              onClick={() => setSelectedResult(result)}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all text-slate-500 shadow-sm"
                              title="View Intelligence"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedResult(result); setShowEmailGenerator(true); }}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all text-slate-500 shadow-sm"
                              title="Resend Outreach"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResult(result.id)}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-slate-400"
                              title="Delete Analysis"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-3 font-medium relative z-10">
                        {result.summary}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                        {result.suggested_keywords?.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold tracking-wide"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 relative z-10">
                        <button
                          onClick={() => window.open(result.url, '_blank')}
                          className="flex-1 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-100/50 text-blue-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          Audit Website
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {!loading && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-20 py-20 border-2 border-dashed border-slate-200 rounded-[32px] bg-white/50"
              >
                <div className="text-slate-500 font-bold tracking-widest text-sm">
                  Intelligence Vault is Empty
                </div>
                <p className="text-slate-400 text-xs mt-2 font-medium">Generate your first analysis to see it here.</p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Intelligence View Modal */}
      <AnimatePresence>
        {selectedResult && !showEmailGenerator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedResult(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-2 block">
                    Intelligence Report #{selectedResult.id.slice(0, 5)}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {selectedResult.title}
                  </h3>
                  <div className="text-slate-500 text-xs mt-1 font-semibold">{selectedResult.url}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEmailGenerator(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Mail className="w-4 h-4 text-blue-100" />
                    Send Outreach
                  </button>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-10">
                    <section>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Executive Summary
                      </h4>
                      <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
                        {selectedResult.summary}
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        Strategic Improvements
                      </h4>
                      <div className="space-y-4">
                        {selectedResult.improvement_suggestions?.map((item, i) => (
                          <div
                            key={i}
                            className="group flex gap-5 p-5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 shadow-sm shrink-0 group-hover:text-blue-600 transition-colors">
                              {i + 1}
                            </div>
                            <div className="pt-1">
                              <h5 className="font-bold text-slate-800 text-sm mb-1.5">{item.title}</h5>
                              <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 text-slate-800">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                        Target Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResult.suggested_keywords?.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 border border-slate-100 rounded-[24px] bg-white shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Data Points
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-1 border-b border-slate-50">
                          <span className="text-xs font-medium text-slate-500">Type</span>
                          <span className="text-xs font-bold text-slate-800 uppercase">Website Intel</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-xs font-medium text-slate-500">Scan Status</span>
                          <span className="text-xs text-emerald-600 uppercase font-bold">Verified</span>
                        </div>
                        <div className="pt-4 mt-2">
                          <button
                            onClick={() => window.open(selectedResult.url, '_blank')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Visit Original Site
                          </button>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Generator Modal */}
      {selectedResult && (
        <EmailGenerator
          isOpen={showEmailGenerator}
          onClose={() => {
            setShowEmailGenerator(false);
          }}
          analysisData={selectedResult}
        />
      )}
    </div>
  );
};

export default AnalyzePage;
