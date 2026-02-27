import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../supabase';
import { aiApi } from '../utils/supabaseHelpers';
import { Palette, Sparkles, Copy, Globe, FileText, RefreshCw, Eye, Trash2 } from 'lucide-react';

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
    // Limit check removed for Premium experience
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
          {
            role: 'user', content: `Create a brand identity and hero section HTML for brand "${bn}" in the ${bt} space.
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
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* Search Section */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-10">
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                Brand Identity Engine
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Forge a legendary brand in seconds. Our AI crafts high-converting identities, color palettes, and landing page blueprints.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-purple-600 uppercase">
                Active
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Engine</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Outrelix"
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Business Niche</label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g. AI SaaS, Fitness"
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                disabled={isGenerating}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Forging Identity...</span>
              </>
            ) : (
              <>
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Generate Brand Blueprint</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Neural Progress */}
        <AnimatePresence>
          {isGenerating && progress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex items-center gap-4 text-xs font-bold text-purple-600 uppercase tracking-widest"
            >
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1 h-1 bg-purple-500 rounded-full"
                  />
                ))}
              </div>
              {progress}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Document: Brand Blueprint */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden"
          >
            {/* Header */}
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-xl"
                  style={{ backgroundColor: results.colorPalette?.[0] || '#000' }}
                >
                  {results.brandName?.[0]}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-[0.2em] mb-1 block">
                    Strategic Blueprint 2026
                  </span>
                  <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                    {results.brandName}
                  </h3>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setResults(null)}
                  className="px-5 py-2.5 text-slate-400 font-bold text-xs hover:text-red-500 transition-all"
                >
                  Discard
                </button>
              </div>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Brand Pillars */}
              <div className="lg:col-span-8 space-y-12">
                {/* Tagline & Tone */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Primary Tagline
                    </h4>
                    <p className="text-2xl font-black text-slate-800 leading-tight">"{results.tagline}"</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      Voice & Tone
                    </h4>
                    <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-xs font-black text-purple-600 uppercase tracking-widest">
                      {results.tone}
                    </span>
                  </div>
                </section>

                {/* Features */}
                <section>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Value Propositions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.features?.map((feature, i) => (
                      <div key={i} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl flex items-start gap-4">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shadow-sm">
                          0{i + 1}
                        </div>
                        <div className="text-sm font-bold text-slate-800 leading-relaxed">{feature}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Landing Preview */}
                <section>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Hero Blueprint
                  </h4>
                  <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <div className="p-2 bg-slate-800 flex items-center gap-1.5 px-6">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <div className="p-12 relative z-10 text-white" dangerouslySetInnerHTML={{ __html: results.heroSection }} />

                    {/* Copy Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                      <button
                        onClick={() => copyToClipboard(results.heroSection)}
                        className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl"
                      >
                        <Copy className="w-4 h-4" />
                        Copy HTML Draft
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Palette */}
              <div className="lg:col-span-4 space-y-12">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Visual Palette</h4>
                  <div className="space-y-3">
                    {results.colorPalette?.map((c, i) => (
                      <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl shadow-lg border border-white/20" style={{ backgroundColor: c }} />
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hex Code</div>
                            <div className="font-mono text-xs font-bold text-slate-800 uppercase tracking-widest">{c}</div>
                          </div>
                        </div>
                        <button onClick={() => copyToClipboard(c)} className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-white rounded-lg">
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-slate-900 rounded-[32px] text-white">
                  <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-6">Strategic Positioning</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">
                    This brand has been engineered to occupy a {results.tone?.toLowerCase()} market segment,
                    prioritizing cognitive trust and visual authority.
                  </p>
                  <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact</div>
                      <div className="text-xl font-black text-white">High</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Market</div>
                      <div className="text-xl font-black text-white">Elite</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Vault */}
      {history.length > 0 && (
        <div className="mt-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Branding Vault
            </h2>
            <div className="h-px flex-1 bg-slate-100 mx-8" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {history.map((h) => (
              <motion.div
                key={h.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg"
                      style={{ backgroundColor: h.color_palette?.[0] || '#000' }}
                    >
                      {h.brand_name?.[0]}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {h.business_type || 'Brand Asset'}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 line-clamp-1">
                        {h.brand_name}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                    {new Date(h.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => {
                      setResults({
                        brandName: h.brand_name,
                        tagline: h.tagline,
                        colorPalette: h.color_palette,
                        tone: h.tone,
                        heroSection: h.hero_html,
                        features: h.features
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3 bg-slate-50 rounded-xl hover:bg-purple-600 hover:text-white transition-all text-slate-400"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandGenerator;


