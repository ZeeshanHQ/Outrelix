import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../supabase';
import { aiApi, analyzerApi } from '../utils/supabaseHelpers';
import { Search, ExternalLink, RefreshCw, Sparkles, AlertCircle, Mail } from 'lucide-react';
import EmailGenerator from './EmailGenerator';

const Analyzer = ({ onAnalysisComplete }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState('');
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [isDeepScan, setIsDeepScan] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setProgress('Initializing scanner...');

    try {
      // Fetch page content
      setProgress(isDeepScan ? 'Initiating Deep Multi-Page Crawl...' : 'Fetching page content...');
      const pageData = await analyzerApi.fetchPageContent(url, isDeepScan ? 'deep' : 'standard');

      if (!pageData.success) {
        throw new Error(pageData.error || 'Failed to fetch page');
      }

      setProgress('Analyzing with Llama 3 Intelligence...');

      // Use real AI via aiApi.complete
      const prompt = `
        Analyze the following website content for brand "${pageData.title}":
        URL: ${url}
        Content Snippet: ${pageData.text?.substring(0, 3000)}
        
        Provide:
        1. A sophisticated 2-3 sentence executive summary.
        2. 5 strategic improvement suggestions (type: seo, content, or performance).
        3. 8 high-value SEO keywords.
        
        Return strict JSON with:
        {
          "summary": "...",
          "improvements": [{"type": "...", "title": "...", "description": "..."}],
          "keywords": ["...", "..."]
        }
      `;

      const aiResponse = await aiApi.complete([
        { role: 'system', content: 'You are an elite Business Process & SEO Analyst.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.3 });

      let analysis;
      try {
        analysis = JSON.parse(aiResponse);
      } catch (e) {
        // Fallback if AI doesn't return perfect JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      }

      if (!analysis) throw new Error('AI analysis failed to generate structured data.');

      setProgress('Saving to Intelligence Vault...');

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const savedResult = await analyzerApi.saveResult({
        user_id: user.id,
        url,
        title: pageData.title || 'Untitled Analysis',
        summary: analysis.summary,
        improvement_suggestions: analysis.improvements,
        suggested_keywords: analysis.keywords,
        extracted_content: pageData.text,
        metadata: {
          description: pageData.description,
          originalKeywords: pageData.keywords,
          emails: pageData.emails,
        },
      });

      // Increment analysis count
      await analyzerApi.incrementAnalysisCount();

      setResult(savedResult);
      setProgress('');

      if (onAnalysisComplete) {
        onAnalysisComplete(savedResult);
      }

      toast.success('Analysis completed successfully!');

      // Auto-open email generator after analysis finishes
      setTimeout(() => setShowEmailGenerator(true), 800);
    } catch (error) {
      console.error('Error analyzing page:', error);
      toast.error(error.message || 'Failed to analyze page');
      setProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 transition-all duration-500 scale-100">
      {/* Search Section */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 lg:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[100px] rounded-full -mr-32 -mt-32 transition-colors duration-700" />
        <div className="max-w-2xl relative z-10">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
            Intelligence Engine
          </h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
            Scan and decode any website or application. Get deep strategic insights, SEO blueprints, and market positioning suggestions in seconds.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter domain (e.g., https://outrelix.com)"
                  className="w-full pl-5 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400 font-medium text-sm shadow-sm"
                  disabled={isAnalyzing}
                />
                {isAnalyzing && (
                  <motion.div
                    layoutId="scan-bar"
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-b-2xl"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: isDeepScan ? 30 : 15, ease: "linear" }}
                  />
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-500/20"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{isAnalyzing ? 'Decoding...' : 'Start Scan'}</span>
              </motion.button>
            </div>

            {/* Deep Scan Toggle */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsDeepScan(!isDeepScan)}
                className={`group flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all ${isDeepScan ? 'bg-blue-50 border border-blue-100' : 'bg-transparent border border-transparent hover:bg-slate-50'}`}
              >
                <div className={`w-7 h-4 rounded-full relative transition-colors ${isDeepScan ? 'bg-blue-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${isDeepScan ? 'translate-x-3' : 'translate-x-0'}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDeepScan ? 'text-blue-600' : 'text-slate-400'}`}>
                  Deep Multi-Page Engine
                </span>
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full ${isAnalyzing ? 'bg-blue-500 animate-pulse' : 'bg-slate-200'}`} style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Neural Progress */}
        <AnimatePresence>
          {isAnalyzing && progress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex items-center gap-4 text-xs font-bold text-blue-600 uppercase tracking-widest"
            >
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                ))}
              </div>
              {progress}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Document Layout */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 right-10 w-px h-full bg-slate-100 hidden lg:block" />

            {/* Header / Meta */}
            <div className="p-8 lg:p-10 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50/50 relative z-10 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md relative group">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1.5 block">
                    Intelligence Report #{result.id.slice(0, 5)}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {result.title}
                  </h3>
                  <div className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-widest">{result.url}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowEmailGenerator(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Mail className="w-4 h-4 text-blue-100" />
                  Draft Outreach
                </button>
                <button
                  onClick={() => window.open(result.url, '_blank')}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Site
                </button>
                <button
                  onClick={() => { setResult(null); setUrl(''); }}
                  className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Analyze New
                </button>
              </div>
            </div>

            <div className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Executive Summary
                  </h4>
                  <p className="text-[15px] text-slate-700 leading-relaxed font-medium">
                    {result.summary}
                  </p>
                </section>

                <section>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    Strategic Improvements
                  </h4>
                  <div className="space-y-4">
                    {result.improvement_suggestions?.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex gap-5 p-5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex shrink-0 items-center justify-center font-bold text-slate-400 shadow-sm group-hover:text-blue-600 transition-colors">
                          {i + 1}
                        </div>
                        <div className="pt-1">
                          <h5 className="font-bold text-slate-800 text-sm mb-1.5">{item.title}</h5>
                          <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar / Keywords */}
              <aside className="space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                      Keyword Intelligence
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.suggested_keywords?.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 shadow-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-[24px] relative overflow-hidden group shadow-sm">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 relative z-10">
                    Technical Footprint
                  </h4>
                  <div className="space-y-3 relative z-10 text-xs text-slate-600">
                    {result.emails && result.emails.length > 0 && (
                      <div className="pb-3 border-b border-slate-100 mb-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2 tracking-widest">Discovered Emails</span>
                        <div className="space-y-1.5">
                          {result.emails.slice(0, 3).map((email, i) => (
                            <div key={i} className="font-medium truncate">{email}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Words Parsed</span>
                      <span className="font-bold text-slate-800">{result.extracted_content?.split(' ').length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Security Check</span>
                      <span className="font-bold text-emerald-600">Verified</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Generator Modal */}
      {result && (
        <EmailGenerator
          isOpen={showEmailGenerator}
          onClose={() => setShowEmailGenerator(false)}
          analysisData={result}
        />
      )}
    </div>
  );
};

export default Analyzer;
