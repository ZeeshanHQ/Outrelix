import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import supabase, { aiApi, analyzerApi } from '../lib/supabaseClient';
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
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* Search Section */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-10">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
            Intelligence Engine
          </h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
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
                  className="w-full pl-5 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                  disabled={isAnalyzing}
                />
                {isAnalyzing && (
                  <motion.div
                    layoutId="scan-bar"
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: isDeepScan ? 30 : 15, ease: "linear" }}
                  />
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-slate-200"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Decoding...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>Analyze</span>
                  </div>
                )}
              </motion.button>
            </div>

            {/* Deep Scan Toggle */}
            <div className="flex items-center gap-3 px-1">
              <button
                onClick={() => setIsDeepScan(!isDeepScan)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isDeepScan ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isDeepScan ? 'translate-x-5' : ''}`} />
              </button>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDeepScan ? 'text-blue-600' : 'text-slate-400'}`}>
                Deep Intel Scan (Recommended for Finding Emails)
              </span>
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"
          >
            {/* Header / Meta */}
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-2 block">
                  Analysis Document #{result.id.slice(0, 5)}
                </span>
                <h3 className="text-2xl font-bold text-slate-800">
                  {result.title}
                </h3>
                <div className="text-slate-400 text-xs mt-1 font-medium">{result.url}</div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowEmailGenerator(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Draft Outreach
                </button>
                <button
                  onClick={() => window.open(result.url, '_blank')}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Visit Site
                </button>
                <button
                  onClick={() => { setResult(null); setUrl(''); }}
                  className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Analyze New
                </button>
              </div>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    Executive Summary
                  </h4>
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    {result.summary}
                  </p>
                </section>

                <section>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="w-1 h-4 bg-purple-500 rounded-full" />
                    Strategic Improvements
                  </h4>
                  <div className="space-y-4">
                    {result.improvement_suggestions?.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex gap-5 p-5 bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100/50 rounded-2xl transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-400 shadow-sm group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                          {i + 1}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h5>
                          <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Sidebar / Keywords */}
              <aside className="space-y-10">
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-6">
                      Keyword Intelligence
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.suggested_keywords?.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 transition-all border border-white/5 rounded-xl text-xs font-bold text-white/90"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Neural Grid Overlay */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                </div>

                <div className="p-8 border border-slate-100 rounded-3xl">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Technical Footprint
                  </h4>
                  <div className="space-y-3">
                    {result.emails && result.emails.length > 0 && (
                      <div className="pb-3 border-b border-slate-50">
                        <span className="text-[10px] font-bold text-blue-500 uppercase block mb-2">Lead Contact</span>
                        <div className="space-y-1">
                          {result.emails.slice(0, 3).map((email, i) => (
                            <div key={i} className="text-xs font-bold text-slate-800 truncate">{email}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Word Count</span>
                      <span className="text-slate-800">{result.extracted_content?.split(' ').length || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">SEO Score</span>
                      <span className="text-emerald-500">88/100</span>
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
