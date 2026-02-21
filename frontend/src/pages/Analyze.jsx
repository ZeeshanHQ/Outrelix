import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Analyzer from '../components/Analyzer';
import AppSidebar from '../components/AppSidebar';
import { analyzerApi } from '../lib/supabaseClient';
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
              <Search className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Website Analyzer
            </h1>
          </div>

          <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
            Harness the power of Llama 3 to decode business strategies and SEO blueprints from any URL.
          </p>

          {/* Daily Limit Info */}
          {dailyLimit && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Daily Credits: <span className="text-slate-800">{dailyLimit.max_per_day - dailyLimit.remaining_analyses} used of {dailyLimit.max_per_day}</span>
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
            className="mt-24"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                Intelligence Vault
              </h2>
              <div className="h-px flex-1 bg-slate-100 mx-8" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((result) => (
                <motion.div
                  key={result.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {result.title}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new URL(result.url).hostname}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedResult(result)}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        title="View Intelligence"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedResult(result); setShowEmailGenerator(true); }}
                        className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Resend Outreach"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteResult(result.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Analysis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-3 font-medium">
                    {result.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {result.suggested_keywords?.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-lg text-[10px] font-bold"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(result.url, '_blank')}
                      className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                    >
                      View Site
                    </button>
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
            className="text-center mt-24 py-20 border-2 border-dashed border-slate-100 rounded-[40px]"
          >
            <div className="text-slate-400 font-bold tracking-tight text-lg">
              Vault is empty. Search a domain to begin.
            </div>
          </motion.div>
        )}
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-2 block">
                    Intelligence Report #{selectedResult.id.slice(0, 5)}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {selectedResult.title}
                  </h3>
                  <div className="text-slate-400 text-xs mt-1 font-medium">{selectedResult.url}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEmailGenerator(true)}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Outreach
                  </button>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-12">
                    <section>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        Executive Summary
                      </h4>
                      <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        {selectedResult.summary}
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded-full" />
                        Strategic Improvements
                      </h4>
                      <div className="space-y-4">
                        {selectedResult.improvement_suggestions?.map((item, i) => (
                          <div
                            key={i}
                            className="flex gap-5 p-5 bg-slate-50 border border-transparent rounded-2xl"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-400">
                              {i + 1}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h5>
                              <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-10">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white">
                      <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-6">
                        Target Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResult.suggested_keywords?.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-3.5 py-2 bg-white/10 border border-white/5 rounded-xl text-xs font-bold text-white/90"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 border border-slate-100 rounded-3xl bg-slate-50/30">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Data Points
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">Type</span>
                          <span className="text-slate-800 uppercase">Website Intel</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400">Scan Status</span>
                          <span className="text-emerald-500 uppercase font-black">Verified</span>
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-100">
                          <button
                            onClick={() => window.open(selectedResult.url, '_blank')}
                            className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
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
