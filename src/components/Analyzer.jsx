import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import supabase, { analyzerApi } from '../lib/supabaseClient';

const Analyzer = ({ onAnalysisComplete }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setProgress('Initializing...');

    try {
      // Check daily limit
      setProgress('Checking daily limit...');
      const limitCheck = await analyzerApi.checkDailyLimit();
      
      if (!limitCheck.can_analyze) {
        toast.error(`Daily limit reached. You have used all ${limitCheck.max_per_day} analyses for today.`);
        setIsAnalyzing(false);
        setProgress('');
        return;
      }

      // Fetch page content
      setProgress('Fetching page content...');
      const pageData = await analyzerApi.fetchPageContent(url);
      
      if (!pageData.success) {
        throw new Error(pageData.error || 'Failed to fetch page');
      }

      setProgress('Analyzing content...');

      // Use Chrome's built-in Summarizer API client-side
      // This is a mock implementation - in production, you'd use the actual Chrome API
      const analysis = analyzeContent(pageData);

      setProgress('Saving results...');

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const savedResult = await analyzerApi.saveResult({
        user_id: user.id,
        url,
        title: pageData.title || 'Untitled',
        summary: analysis.summary,
        improvement_suggestions: analysis.improvements,
        suggested_keywords: analysis.keywords,
        extracted_content: pageData.text,
        metadata: {
          description: pageData.description,
          originalKeywords: pageData.keywords,
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
    } catch (error) {
      console.error('Error analyzing page:', error);
      toast.error(error.message || 'Failed to analyze page');
      setProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeContent = (pageData) => {
    const text = pageData.text || '';
    const title = pageData.title || '';
    
    // Simple analysis - generate summary
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ').substring(0, 500) + '...';

    // Generate improvement suggestions
    const improvements = [
      {
        type: 'seo',
        title: 'Improve SEO',
        description: 'Add more specific keywords to improve search engine visibility',
      },
      {
        type: 'content',
        title: 'Enhance Content Structure',
        description: 'Break up long paragraphs and add more headings for better readability',
      },
      {
        type: 'performance',
        title: 'Optimize Performance',
        description: 'Consider reducing image sizes and implementing lazy loading',
      },
    ];

    // Extract keywords
    const keywords = extractKeywords(text, title);

    return { summary, improvements, keywords };
  };

  const extractKeywords = (text, title) => {
    const words = (text + ' ' + title)
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);

    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    return sorted;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          🔍 App / Website Analyzer
        </h2>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Website URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isAnalyzing}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </motion.button>
          </div>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isAnalyzing && progress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 dark:text-blue-300">{progress}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-6"
            >
              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  📝 Summary
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Improvement Suggestions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  💡 Improvement Suggestions
                </h3>
                <ul className="space-y-3">
                  {result.improvement_suggestions?.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {suggestion.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {suggestion.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Keywords */}
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  🏷️ Suggested Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.suggested_keywords?.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(result.url, '_blank')}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Visit Website
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setResult(null);
                    setUrl('');
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Analyze Another
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Analyzer;
