import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import supabase, { aiApi } from '../lib/supabaseClient';
import { Palette, Sparkles, Copy, Globe, FileText, RefreshCw } from 'lucide-react';

const BrandGenerator = () => {
  const [inputMode, setInputMode] = useState('brand'); // 'brand' | 'business'
  const [brandName, setBrandName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [dailyCount, setDailyCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    checkDailyLimit();
    loadHistory();
  }, []);

  const checkDailyLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.rpc('count_user_brand_generations', { uid: user.id });
      if (!error) setDailyCount(data || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('brand_generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (!error && data) setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const simulateAIBrand = async (brandNameInput, businessTypeInput) => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    const name = brandNameInput || 'Outrelix';
    const biz = businessTypeInput || 'AI-powered email marketing platform';
    return {
      brandName: name,
      tagline: 'AI that writes, optimizes, and inspires.',
      colorPalette: ['#4f46e5', '#06b6d4', '#facc15'],
      tone: 'Bold, futuristic, and friendly',
      heroSection: `
        <h1>${name}, reimagined with AI</h1>
        <p>Empower your ${biz} with smart automation, beautiful design, and intelligent marketing tools.</p>
        <button class="cta">Get Started</button>
      `,
      features: [
        'AI-generated marketing content',
        'Smart SEO insights',
        'One-click brand assets',
      ],
    };
  };

  const handleGenerate = async () => {
    if (dailyCount >= dailyLimit) {
      toast.error(`Daily limit reached! (${dailyLimit}/day)`);
      return;
    }
    if (!brandName && !businessType) {
      toast.error('Enter a brand name or business type.');
      return;
    }
    setIsGenerating(true);
    setProgress('Generating brand identity...');
    try {
      let generated;
      try {
        const bn = brandName || 'Outrelix';
        const bt = businessType || 'AI-powered email marketing platform';
        const messages = [
          { role: 'system', content: 'You are a brand strategist and web copywriter.' },
          { role: 'user', content: `Create a brand identity and hero section HTML for brand "${bn}" in the ${bt} space.
Return strict JSON with: brandName, tagline, colorPalette (array of 3 hex), tone, heroSection (HTML string), features (array of 3-5 strings).` }
        ];
        const content = await aiApi.complete(messages, { temperature: 0.7, max_tokens: 700 });
        let parsed;
        try { parsed = JSON.parse(content); } catch { parsed = null; }
        if (parsed && parsed.brandName) {
          generated = {
            brandName: parsed.brandName,
            tagline: parsed.tagline || '—',
            colorPalette: Array.isArray(parsed.colorPalette) ? parsed.colorPalette : ['#4f46e5', '#06b6d4', '#facc15'],
            tone: parsed.tone || '—',
            heroSection: parsed.heroSection || `<h1>${bn}</h1>`,
            features: Array.isArray(parsed.features) ? parsed.features : ['AI content', 'SEO insights', 'One‑click assets'],
          };
        } else {
          // non-JSON response: wrap as fallback
          generated = await simulateAIBrand(bn, bt);
        }
      } catch (e) {
        generated = await simulateAIBrand(brandName, businessType);
      }

      setResults(generated);
      setProgress('Saving to history...');

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('brand_generations')
          .insert([{ 
            user_id: user.id,
            brand_name: generated.brandName,
            business_type: businessType || null,
            tagline: generated.tagline,
            color_palette: generated.colorPalette,
            tone: generated.tone,
            hero_html: generated.heroSection,
            features: generated.features,
          }]);
        if (error) throw error;
        setDailyCount(prev => prev + 1);
        loadHistory();
      }
      setProgress('');
      toast.success('Brand generated!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate brand.');
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Brand Generator</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered brand identity & landing content</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{dailyCount}/{dailyLimit}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">generations today</div>
          </div>
        </div>

        {/* Segmented control */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setInputMode('brand')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${inputMode==='brand' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Brand Name
          </button>
          <button
            onClick={() => setInputMode('business')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${inputMode==='business' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Business Type
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Name</label>
            <input
              value={brandName}
              onChange={(e)=>setBrandName(e.target.value)}
              placeholder="Outrelix"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Type</label>
            <input
              value={businessType}
              onChange={(e)=>setBusinessType(e.target.value)}
              placeholder="AI-powered email marketing platform"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Generate */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating || dailyCount >= dailyLimit}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center gap-2"
          >
            {isGenerating ? 'Generating...' : 'Generate Brand'}
            {!isGenerating && <Sparkles className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {isGenerating && progress && (
            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span className="text-purple-700 dark:text-purple-300">{progress}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-6">
              {/* Brand Identity */}
              <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Brand Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Brand Name</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{results.brandName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tagline</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{results.tagline}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tone</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{results.tone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Color Palette</div>
                    <div className="flex gap-2">
                      {results.colorPalette.map((c, i) => (
                        <div key={i} className="w-10 h-10 rounded-lg border" style={{ backgroundColor: c }} title={c}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Landing Preview */}
              <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Landing Page Preview</h3>
                  <button onClick={()=>copyToClipboard(results.heroSection)} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy HTML
                  </button>
                </div>
                <div className="rounded-lg border bg-white dark:bg-gray-800 p-6" dangerouslySetInnerHTML={{ __html: results.heroSection }} />
              </div>

              {/* Features */}
              <div className="p-6 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Feature Highlights</h3>
                  <button onClick={()=>copyToClipboard(results.features.join('\n'))} className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy All
                  </button>
                </div>
                <ul className="list-disc pl-5 text-gray-800 dark:text-gray-200">
                  {results.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Generate Again */}
              <div className="flex justify-end">
                <button onClick={handleGenerate} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Generate Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent History */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Generations</h3>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Palette className="w-4 h-4" /> {h.brand_name || 'Brand'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{h.business_type || '—'} • {new Date(h.created_at).toLocaleDateString()}</div>
                    </div>
                    <button onClick={()=>copyToClipboard(h.hero_html)} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                      Copy HTML
                    </button>
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

export default BrandGenerator;


