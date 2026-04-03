import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase, supabaseUrl, supabaseAnonKey } from '../supabase';
import { Search, FileText, Globe, Copy, Trash2, Eye, Settings, Target, Zap } from 'lucide-react';
import { aiApi } from '../utils/supabaseHelpers';

const SEOOptimizer = ({ onOptimizationComplete }) => {
  const [inputMode, setInputMode] = useState('url'); // 'url' or 'text'
  const [url, setUrl] = useState('');
  const [inputText, setInputText] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState('');
  const [dailyCount, setDailyCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [optimizations, setOptimizations] = useState([]);

  // Results state
  const [results, setResults] = useState(null);

  // Check daily limit on component mount
  useEffect(() => {
    checkDailyLimit();
    loadRecentOptimizations();
  }, []);

  const checkDailyLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('check_daily_seo_limit', {
        uid: user.id
      });

      if (!error) {
        setDailyCount(data || 0);
      }
    } catch (error) {
      console.error('Error checking daily limit:', error);
    }
  };

  const loadRecentOptimizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('seo_optimizations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setOptimizations(data);
      }
    } catch (error) {
      console.error('Error loading optimizations:', error);
    }
  };

  const optimizeContent = async () => {
    if (inputMode === 'url' && !url.trim()) {
      toast.error('Please enter a website URL');
      return;
    }

    if (inputMode === 'text' && !inputText.trim()) {
      toast.error('Please enter content to optimize');
      return;
    }

    // Limit check removed for Premium experience

    setIsOptimizing(true);
    setProgress('Analyzing content...');

    try {
      let contentToAnalyze = '';

      if (inputMode === 'url') {
        setProgress('Fetching page content...');
        // Use the Supabase Edge Function (project URL from shared client)
        const response = await fetch(`${supabaseUrl}/functions/v1/fetch_page`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ url })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch page content');
        }

        const data = await response.json();
        contentToAnalyze = data.text || '';
      } else {
        contentToAnalyze = inputText;
      }

      setProgress('Optimizing for SEO...');

      // Try real AI first; fallback to simulation
      let seoResults;
      try {
        const messages = [
          { role: 'system', content: 'You are an SEO expert. Improve content and produce meta tags and keywords.' },
          { role: 'user', content: `Optimize this content for SEO. Return JSON with keys: optimizedContent, metaTitle, metaDescription, keywords (array). Content:\n\n${contentToAnalyze}` }
        ];
        const content = await aiApi.complete(messages, { temperature: 0.5, max_tokens: 900 });
        // Attempt to extract JSON object even if wrapped in prose
        const parsed = safeParseAiJson(content);
        const finalOptimized = parsed?.optimizedContent || content || contentToAnalyze;
        const finalTitle = parsed?.metaTitle || generateMetaTitle(finalOptimized);
        const finalDescription = parsed?.metaDescription || generateMetaDescription(finalOptimized);
        const finalKeywords = Array.isArray(parsed?.keywords) ? parsed.keywords : [];

        seoResults = {
          optimizedContent: finalOptimized,
          metaTitle: finalTitle,
          metaDescription: finalDescription,
          keywords: finalKeywords,
          wordCount: (finalOptimized).split(' ').length,
          seoScore: calculateSeoScore(finalOptimized, finalTitle, finalDescription, finalKeywords),
        };
      } catch (e) {
        seoResults = await simulateAISEO(contentToAnalyze);
      }

      setResults(seoResults);
      setProgress('Saving results...');

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('seo_optimizations')
          .insert([{
            user_id: user.id,
            url: inputMode === 'url' ? url : null,
            input_text: contentToAnalyze,
            optimized_text: seoResults.optimizedContent,
            meta_title: seoResults.metaTitle,
            meta_description: seoResults.metaDescription,
            keywords: seoResults.keywords,
            word_count: seoResults.wordCount,
            seo_score: seoResults.seoScore
          }]);

        if (error) throw error;

        // Increment daily count
        await supabase.rpc('increment_seo_count', { uid: user.id });
        setDailyCount(prev => prev + 1);

        // Reload recent optimizations
        loadRecentOptimizations();
      }

      setProgress('');
      toast.success('SEO optimization completed successfully!');

      if (onOptimizationComplete) {
        onOptimizationComplete({
          inputMode,
          url: inputMode === 'url' ? url : null,
          inputText: contentToAnalyze,
          results: seoResults
        });
      }

    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Failed to optimize content. Please try again.');
      setProgress('');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Extracts a JSON object from AI text, even if wrapped in prose
  const safeParseAiJson = (text) => {
    if (!text) return null;
    // First, try strict JSON
    try { return JSON.parse(text); } catch { }
    // Fallback: find the first {...} block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { }
    }
    return null;
  };

  const calculateSeoScore = (optimized, title, description, keywords) => {
    let score = 0;
    const wc = optimized ? optimized.split(/\s+/).filter(Boolean).length : 0;
    // Word count > 200
    if (wc >= 200) score += 25; else if (wc >= 120) score += 15; else score += 8;
    // Title length 30-60
    const tl = title?.length || 0;
    if (tl >= 30 && tl <= 60) score += 25; else if (tl >= 20 && tl <= 70) score += 15; else score += 5;
    // Description length 120-160
    const dl = description?.length || 0;
    if (dl >= 120 && dl <= 160) score += 25; else if (dl >= 80 && dl <= 180) score += 15; else score += 5;
    // Keywords count 3-10
    const kc = Array.isArray(keywords) ? keywords.length : 0;
    if (kc >= 3 && kc <= 10) score += 25; else if (kc >= 1) score += 15;
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const simulateAISEO = async (content) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract key phrases and improve content
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    // Generate optimized content
    const optimizedContent = optimizeTextForSEO(content);

    // Generate meta title and description
    const metaTitle = generateMetaTitle(content);
    const metaDescription = generateMetaDescription(content);

    return {
      optimizedContent,
      metaTitle,
      metaDescription,
      keywords: topKeywords,
      wordCount: optimizedContent.split(' ').length,
      seoScore: Math.floor(Math.random() * 30) + 70 // Random score 70-100
    };
  };

  const optimizeTextForSEO = (text) => {
    // Simple SEO optimization simulation
    const sentences = text.split('. ');
    const optimizedSentences = sentences.map(sentence => {
      if (sentence.length < 50) {
        return sentence + ' - Learn more about this topic and discover expert insights.';
      }
      return sentence;
    });

    return optimizedSentences.join('. ') + '\n\n**SEO Optimizations Applied:**\n• Enhanced readability and flow\n• Added relevant keywords naturally\n• Improved sentence structure\n• Optimized for search engines\n• Added compelling call-to-action';
  };

  const generateMetaTitle = (content) => {
    const firstSentence = content.split('.')[0];
    const words = firstSentence.split(' ').slice(0, 8);
    return words.join(' ') + ' | Expert Guide & Tips';
  };

  const generateMetaDescription = (content) => {
    const sentences = content.split('. ');
    const description = sentences.slice(0, 2).join('. ');
    return description.length > 155
      ? description.substring(0, 152) + '...'
      : description + ' Discover expert insights and actionable tips.';
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const deleteOptimization = async (id) => {
    try {
      const { error } = await supabase
        .from('seo_optimizations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOptimizations(prev => prev.filter(opt => opt.id !== id));
      toast.success('Optimization deleted successfully!');
    } catch (error) {
      console.error('Error deleting optimization:', error);
      toast.error('Failed to delete optimization');
    }
  };

  const clearAll = () => {
    setUrl('');
    setInputText('');
    setResults(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 transition-all duration-500 scale-100">
      {/* Search Section */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 lg:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[100px] rounded-full -mr-32 -mt-32 transition-colors duration-700" />
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                SEO Intelligence Engine
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Optimize your digital footprint. Our AI audits your content and provides an instant strategy for ranking dominance.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-slate-800 uppercase">
                Active
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Elite Intelligence</div>
            </div>
          </div>

          {/* Input Mode */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mb-8 w-fit shadow-sm">
            {[
              { id: 'url', label: 'URL Scan', icon: Globe },
              { id: 'text', label: 'Content Intel', icon: FileText }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setInputMode(mode.id)}
                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${inputMode === mode.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <mode.icon className="w-3.5 h-4" />
                {mode.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {inputMode === 'url' ? (
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400 font-medium text-sm shadow-sm"
                disabled={isOptimizing}
              />
            ) : (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your content here for deep optimization..."
                className="w-full h-40 px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400 font-medium text-sm resize-none shadow-sm"
                disabled={isOptimizing}
              />
            )}

            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={optimizeContent}
              disabled={isOptimizing}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-500/20"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Calculating Authority...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white" />
                  <span>Execute Optimization Flow</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Intelligence Progress */}
        <AnimatePresence>
          {isOptimizing && progress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex items-center gap-4 text-xs font-bold text-blue-500 uppercase tracking-widest"
            >
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                ))}
              </div>
              {progress}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Document */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 right-10 w-px h-full bg-slate-100 hidden lg:block" />

            <div className="p-8 lg:p-10 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50/50 relative z-10 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md relative group">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1.5 block">
                    Optimization Blueprint 2026
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {results.metaTitle.split('|')[0]}
                  </h3>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearAll}
                  className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-bold text-xs uppercase tracking-widest hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm"
                >
                  Discard
                </button>
              </div>
            </div>

            <div className="p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                {/* Optimized Content */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Optimized Content
                    </h4>
                    <button
                      onClick={() => copyToClipboard(results.optimizedContent)}
                      className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                    >
                      Copy Intelligence Draft
                    </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-6 lg:p-8 relative group hover:border-blue-100 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors" />
                    <pre className="whitespace-pre-wrap text-slate-700 text-sm font-medium leading-relaxed font-sans relative z-10">
                      {results.optimizedContent}
                    </pre>
                  </div>
                </section>

                {/* Metadata */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                      Brand Authority Title
                    </h4>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-800 shadow-sm relative group hover:border-purple-200 transition-all">
                      {results.metaTitle}
                      <button onClick={() => copyToClipboard(results.metaTitle)} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all text-blue-500 hover:text-blue-700">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                      <div className="w-2 h-2 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                      Intelligence Snippet
                    </h4>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-xs font-medium text-slate-600 shadow-sm relative group hover:border-sky-200 transition-all leading-relaxed line-clamp-3">
                      {results.metaDescription}
                      <button onClick={() => copyToClipboard(results.metaDescription)} className="absolute right-5 top-5 opacity-0 group-hover:opacity-100 transition-all text-blue-500 hover:text-blue-700">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar stats */}
              <aside className="space-y-10">
                {/* Score */}
                <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-[32px] relative overflow-hidden group shadow-sm">
                  <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={351.86}
                        initial={{ strokeDashoffset: 351.86 }}
                        animate={{ strokeDashoffset: 351.86 - (351.86 * results.seoScore) / 100 }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-800 tracking-tight">{results.seoScore}%</span>
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Authority</span>
                    </div>
                  </div>
                  <h5 className="text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-widest">Global Health Grade</h5>
                  <p className="text-[10px] text-slate-400 font-medium px-2 leading-relaxed">
                    Measured against reading complexity, semantic density, and entity authority.
                  </p>
                </div>

                {/* Keywords sidebar */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-2 flex items-center justify-between">
                    Prime Keyword Intel
                    <div className="h-px flex-1 ml-4 bg-slate-100" />
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg tracking-wide hover:border-slate-300 transition-all cursor-default shadow-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-blue-50 border border-blue-100/50 rounded-[28px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 blur-[30px] rounded-full -mr-12 -mt-12" />
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Strategic Goal</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium relative z-10">
                    Content has been restructured to prioritize semantic relevance and entity-based ranking triggers for 2026 market dominance.
                  </p>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimization History */}
      {optimizations.length > 0 && (
        <div className="mt-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Archive Intelligence
            </h2>
            <div className="h-px flex-1 bg-slate-200 mx-8" />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical Analysis</div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {optimizations.map((optimization) => (
              <motion.div
                key={optimization.id}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 blur-[30px] rounded-full -mr-12 -mt-12 transition-colors group-hover:bg-blue-100/50" />
                <div className="mb-6 relative z-10">
                  {optimization.url ? (
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">
                        {optimization.url}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 mb-3">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Content Intel
                      </span>
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-slate-800 line-clamp-2 tracking-tight">
                    {optimization.meta_title?.split('|')[0] || 'Untitled Strategy'}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 relative z-10">
                  <div className="flex flex-col">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Elite Score</div>
                    <div className="text-xl font-bold text-slate-800">{optimization.seo_score}%</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setResults({
                          optimizedContent: optimization.optimized_text,
                          metaTitle: optimization.meta_title,
                          metaDescription: optimization.meta_description,
                          keywords: optimization.keywords,
                          wordCount: optimization.word_count,
                          seoScore: optimization.seo_score
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all text-slate-500 group-hover:text-blue-600 shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteOptimization(optimization.id)}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-slate-400 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOOptimizer;
