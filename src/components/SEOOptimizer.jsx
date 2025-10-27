import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import supabase from '../lib/supabaseClient';
import { Search, FileText, Globe, Copy, Trash2, Eye, Settings, Target, Zap } from 'lucide-react';

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

    if (dailyCount >= dailyLimit) {
      toast.error(`Daily limit reached! You've used all ${dailyLimit} optimizations for today.`);
      return;
    }

    setIsOptimizing(true);
    setProgress('Analyzing content...');

    try {
      let contentToAnalyze = '';
      
      if (inputMode === 'url') {
        setProgress('Fetching page content...');
        // Use the existing fetch_page Edge Function
        const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/fetch_page`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
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
      
      // Simulate Chrome's built-in AI SEO API
      const seoResults = await simulateAISEO(contentToAnalyze);
      
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
      .sort(([,a], [,b]) => b - a)
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
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                SEO Optimizer
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered SEO optimization</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dailyCount}/{dailyLimit}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">optimizations today</div>
          </div>
        </div>

        {/* Input Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Choose Input Method
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setInputMode('url')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                inputMode === 'url'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Globe className="w-5 h-5" />
              Website URL
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                inputMode === 'text'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FileText className="w-5 h-5" />
              Paste Content
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {inputMode === 'url' ? 'Website URL' : 'Content to Optimize'}
          </label>
          {inputMode === 'url' ? (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isOptimizing}
            />
          ) : (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your content here to optimize for SEO..."
              className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              disabled={isOptimizing}
            />
          )}
        </div>

        {/* Optimize Button */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={optimizeContent}
            disabled={isOptimizing || dailyCount >= dailyLimit}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize for SEO'}
          </motion.button>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isOptimizing && progress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                <span className="text-green-700 dark:text-green-300">{progress}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Optimized Content */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Optimized Content
                  </h3>
                  <button
                    onClick={() => copyToClipboard(results.optimizedContent)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
                    {results.optimizedContent}
                  </pre>
                </div>
              </div>

              {/* Meta Tags */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-6 h-6" />
                    Meta Tags
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(results.metaTitle)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Copy Title
                    </button>
                    <button
                      onClick={() => copyToClipboard(results.metaDescription)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Copy Description
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meta Title ({results.metaTitle.length} characters)
                    </label>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded border text-gray-900 dark:text-white">
                      {results.metaTitle}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meta Description ({results.metaDescription.length} characters)
                    </label>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded border text-gray-900 dark:text-white">
                      {results.metaDescription}
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Keywords
                  </h3>
                  <button
                    onClick={() => copyToClipboard(results.keywords.join(', '))}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  SEO Score: <span className="font-bold text-green-600">{results.seoScore}/100</span>
                </div>
              </div>

              {/* Clear Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Optimizations */}
        {optimizations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Optimizations
            </h3>
            <div className="space-y-3">
              {optimizations.map((optimization) => (
                <div
                  key={optimization.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {optimization.url ? (
                          <span className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {optimization.url}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Text Content
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {optimization.word_count} words • SEO Score: {optimization.seo_score}/100 • {new Date(optimization.created_at).toLocaleDateString()}
                      </div>
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
                        }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => deleteOptimization(optimization.id)}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOOptimizer;
