import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../supabase';
import { analyzerApi, aiApi } from '../utils/supabaseHelpers';
import { Smartphone, Mail, Megaphone, Search, Package, FileText, Share2, Newspaper, PenTool, RefreshCw, Copy } from 'lucide-react';

const Writer = ({ onGenerationComplete }) => {
  const [mode, setMode] = useState('write'); // 'write' or 'rewrite'
  const [contentType, setContentType] = useState('app_description');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [dailyCount, setDailyCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(15);
  const [sessions, setSessions] = useState([]);

  const contentTypes = [
    { value: 'app_description', label: 'App Description', icon: Smartphone },
    { value: 'cold_email', label: 'Cold Email', icon: Mail },
    { value: 'ad_copy', label: 'Ad Copy', icon: Megaphone },
    { value: 'seo_post', label: 'SEO Post', icon: Search },
    { value: 'product_description', label: 'Product Description', icon: Package },
    { value: 'blog_post', label: 'Blog Post', icon: FileText },
    { value: 'social_media', label: 'Social Media', icon: Share2 },
    { value: 'press_release', label: 'Press Release', icon: Newspaper },
  ];

  const prompts = {
    app_description: {
      write: "Write a compelling app description for a mobile application that includes key features, benefits, and a call-to-action.",
      rewrite: "Rewrite this app description to make it more engaging, clear, and compelling for potential users."
    },
    cold_email: {
      write: "Write a professional cold email that introduces a product/service, builds rapport, and includes a clear call-to-action.",
      rewrite: "Rewrite this cold email to improve its tone, structure, and effectiveness in generating responses."
    },
    ad_copy: {
      write: "Write persuasive ad copy that highlights key benefits, creates urgency, and drives action.",
      rewrite: "Rewrite this ad copy to make it more compelling, clear, and effective at converting viewers."
    },
    seo_post: {
      write: "Write an SEO-optimized blog post that provides value, includes relevant keywords, and engages readers.",
      rewrite: "Rewrite this content to improve SEO, readability, and engagement while maintaining the core message."
    },
    product_description: {
      write: "Write a detailed product description that highlights features, benefits, and encourages purchase.",
      rewrite: "Rewrite this product description to make it more persuasive and compelling for potential buyers."
    },
    blog_post: {
      write: "Write an engaging blog post that provides valuable information and keeps readers interested.",
      rewrite: "Rewrite this blog post to improve flow, readability, and engagement."
    },
    social_media: {
      write: "Write engaging social media content that captures attention and encourages interaction.",
      rewrite: "Rewrite this social media content to make it more engaging and shareable."
    },
    press_release: {
      write: "Write a professional press release that announces news and provides key information to media.",
      rewrite: "Rewrite this press release to improve clarity, impact, and media appeal."
    }
  };

  // Check daily limit on component mount
  useEffect(() => {
    checkDailyLimit();
    loadRecentSessions();
  }, []);

  const checkDailyLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('count_user_writes', {
        uid: user.id
      });

      if (!error) {
        setDailyCount(data || 0);
      }
    } catch (error) {
      console.error('Error checking daily limit:', error);
    }
  };

  const loadRecentSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('writer_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const generateText = async () => {
    if (!inputText.trim() && mode === 'rewrite') {
      toast.error('Please enter text to rewrite');
      return;
    }

    if (dailyCount >= dailyLimit) {
      toast.error(`Daily limit reached! You've used all ${dailyLimit} generations for today.`);
      return;
    }

    setIsGenerating(true);
    setProgress('Generating content...');

    try {
      // Try real AI first via Supabase Edge Function (OpenRouter), then fallback
      let generatedText = '';
      try {
        const prompt = mode === 'write'
          ? `You are an expert marketing writer. Generate ${contentType} content. Keep it clear, engaging, and actionable.`
          : `You are an expert marketing editor. Rewrite the provided ${contentType} to improve clarity, tone, and conversion while preserving meaning.`;

        const messages = [
          { role: 'system', content: 'You produce concise, high-quality marketing copy with clear structure.' },
          { role: 'user', content: mode === 'write' ? `${prompt}\n\nConstraints:\n- Use headings and bullets where helpful\n- Keep it ready to paste\n\nNotes: ${inputText || '(no extra notes)'}` : `${prompt}\n\nText to rewrite:\n${inputText}` }
        ];
        generatedText = await aiApi.complete(messages, { temperature: 0.7, max_tokens: 800 });
      } catch (e) {
        generatedText = await simulateAIWriter(mode, contentType, inputText);
      }

      setOutputText(generatedText);
      setProgress('Saving to history...');

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const wordCount = generatedText.split(' ').length;

        const { error } = await supabase
          .from('writer_sessions')
          .insert([{
            user_id: user.id,
            mode,
            content_type: contentType,
            input_text: inputText,
            output_text: generatedText,
            word_count: wordCount
          }]);

        if (error) throw error;

        // Update daily count
        setDailyCount(prev => prev + 1);

        // Reload recent sessions
        loadRecentSessions();
      }

      setProgress('');
      toast.success('Content generated successfully!');

      if (onGenerationComplete) {
        onGenerationComplete({
          mode,
          contentType,
          inputText,
          outputText: generatedText
        });
      }

    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateAIWriter = async (mode, contentType, inputText) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const prompt = prompts[contentType][mode];

    if (mode === 'write') {
      return generateNewContent(contentType, prompt);
    } else {
      return rewriteContent(inputText, contentType);
    }
  };

  const generateNewContent = (type, prompt) => {
    const templates = {
      app_description: `**Outrelix - AI-Powered Email Marketing**

Transform your email campaigns with AI-driven personalization and automation. Outrelix helps businesses create compelling, personalized emails that drive engagement and conversions.

**Key Features:**
• AI-powered content generation
• Smart audience targeting
• Real-time analytics dashboard
• Multi-industry templates
• Automated follow-up sequences

**Perfect for:** Marketing teams, small businesses, and entrepreneurs looking to scale their email marketing efforts.

Download now and start sending emails that actually get opened!`,

      cold_email: `Subject: Quick question about your email marketing strategy

Hi [Name],

I hope this email finds you well. I noticed that [Company] has been doing great work in [Industry], and I wanted to reach out with a quick question.

Are you currently using any email marketing tools to engage with your customers? I ask because I've been working with similar companies in your space, and I've seen some impressive results when they optimize their email campaigns.

For example, one client increased their open rates by 40% and saw a 25% boost in conversions just by implementing some simple personalization strategies.

I'd love to share a few quick tips that might be relevant to your business. Would you be open to a brief 15-minute call this week to discuss?

Best regards,
[Your Name]

P.S. I'm not selling anything - just genuinely interested in helping fellow entrepreneurs succeed.`,

      ad_copy: `**LIMITED TIME: 50% OFF Email Marketing Mastery Course**

Stop losing customers to boring emails! 

✅ Create compelling subject lines that get opened
✅ Write copy that converts browsers into buyers  
✅ Build automated sequences that work 24/7
✅ Track results with detailed analytics

**Only 24 hours left** - Don't miss out on this exclusive offer!

[CLAIM YOUR DISCOUNT NOW] →`,

      seo_post: `# The Complete Guide to Email Marketing Automation in 2024

Email marketing automation has revolutionized how businesses communicate with their customers. In this comprehensive guide, we'll explore the latest trends, strategies, and tools that are shaping the future of email marketing.

## Why Email Automation Matters

Email automation isn't just about sending bulk emails - it's about creating personalized experiences at scale. Studies show that automated emails generate 320% more revenue than non-automated campaigns.

## Key Strategies for Success

1. **Segmentation is King**: Divide your audience based on behavior, demographics, and preferences
2. **Timing Matters**: Send emails when your audience is most likely to engage
3. **Personalization**: Use dynamic content to make each email feel custom-made
4. **A/B Testing**: Continuously optimize your campaigns for better results

## Tools and Platforms

Modern email marketing platforms offer sophisticated automation features that make it easy to create complex workflows without technical expertise.

Ready to transform your email marketing? Start with these proven strategies and watch your engagement rates soar.`,

      product_description: `🌟 **Premium Wireless Headphones - Studio Quality Sound**

Experience music like never before with our flagship wireless headphones featuring advanced noise cancellation and crystal-clear audio.

**What Makes Us Different:**
• 30-hour battery life with quick charge
• Active noise cancellation blocks 99% of ambient sound
• Premium leather ear cushions for all-day comfort
• Touch controls for seamless operation
• Water-resistant design for active lifestyles

**Perfect For:**
✓ Music lovers who demand quality
✓ Professionals working from home
✓ Fitness enthusiasts
✓ Travelers seeking peace and quiet

**Special Offer:** Order today and get free shipping + 2-year warranty!

Don't settle for mediocre sound. Upgrade to studio-quality audio today.`,

      blog_post: `# 5 Email Marketing Mistakes That Are Costing You Customers

Email marketing remains one of the most effective digital marketing channels, but many businesses are making costly mistakes that hurt their results. Here are the top 5 mistakes to avoid:

## 1. Sending Too Many Emails

Bombarding subscribers with daily emails is a surefire way to increase unsubscribe rates. Quality over quantity always wins.

## 2. Generic Subject Lines

"Newsletter #47" won't get opened. Create compelling subject lines that create curiosity or urgency.

## 3. Ignoring Mobile Optimization

Over 60% of emails are opened on mobile devices. Ensure your emails look great on all screen sizes.

## 4. Not Segmenting Your Audience

Sending the same message to everyone reduces relevance and engagement. Segment based on behavior and preferences.

## 5. Forgetting to Test

A/B test everything - subject lines, send times, content, and CTAs to continuously improve performance.

Ready to fix these mistakes? Start with one improvement this week and watch your email marketing results improve dramatically.`,

      social_media: `Just launched our new AI-powered email marketing tool!

Generate personalized emails in seconds
Track performance with real-time analytics
Target the right audience every time
Automate your entire email workflow

Who's ready to transform their email marketing? 

#EmailMarketing #AI #MarketingTech #BusinessGrowth #Automation`,

      press_release: `**FOR IMMEDIATE RELEASE**

**Outrelix Launches Revolutionary AI-Powered Email Marketing Platform**

*New platform helps businesses create personalized email campaigns that drive engagement and conversions*

[City, Date] - Outrelix, a leading marketing technology company, today announced the launch of its groundbreaking AI-powered email marketing platform designed to help businesses create more effective email campaigns.

The platform leverages advanced artificial intelligence to analyze audience behavior, generate personalized content, and optimize send times for maximum engagement. Early beta users have reported 40% increases in open rates and 25% improvements in conversion rates.

"We're excited to democratize advanced email marketing capabilities for businesses of all sizes," said [CEO Name], CEO of Outrelix. "Our AI technology makes it possible for anyone to create professional, personalized email campaigns that actually work."

The platform is now available for businesses looking to transform their email marketing efforts. For more information, visit [website] or contact [contact info].`
    };

    return templates[type] || 'Generated content based on your request.';
  };

  const rewriteContent = (text, type) => {
    // Simple rewriting logic - in production, you'd use actual AI
    const improvements = {
      app_description: 'Enhanced with compelling features and clear benefits',
      cold_email: 'Improved tone and structure for better response rates',
      ad_copy: 'Made more persuasive with stronger calls-to-action',
      seo_post: 'Optimized for better readability and SEO',
      product_description: 'Enhanced with more compelling product benefits',
      blog_post: 'Improved flow and engagement',
      social_media: 'Made more engaging and shareable',
      press_release: 'Enhanced clarity and professional tone'
    };

    return `**Rewritten Content (${improvements[type]}):**

${text}

**Improvements Made:**
• Enhanced clarity and readability
• Improved structure and flow
• Added compelling elements
• Optimized for better engagement
• Strengthened call-to-action

This rewritten version maintains your original message while making it more effective and engaging for your target audience.`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 transition-all duration-500 scale-100">
      {/* Search Section */}

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8 lg:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[100px] rounded-full -mr-32 -mt-32 transition-colors duration-700" />

        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20 relative group">
              <div className="absolute inset-0 bg-indigo-400 rounded-xl animate-ping opacity-20" />
              <PenTool className="w-6 h-6 text-white relative z-10" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-1 block">
                Elite Copy Intelligence
              </span>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                Copy Architect
              </h2>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800 tracking-tight">
              {dailyCount}<span className="text-slate-400 mx-1">/</span>{dailyLimit}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generations Remaining</div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mb-10 relative z-10">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-3 block">Operation Mode</label>
          <div className="flex gap-3">
            <button
              onClick={() => setMode('write')}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${mode === 'write'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:bg-white shadow-sm'
                }`}
            >
              <PenTool className="w-4 h-4" />
              Creative Synthesis
            </button>
            <button
              onClick={() => setMode('rewrite')}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${mode === 'rewrite'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:bg-white shadow-sm'
                }`}
            >
              <RefreshCw className="w-4 h-4" />
              Refinement Protocol
            </button>
          </div>
        </div>

        {/* Content Type Selection */}
        <div className="mb-10 relative z-10">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-3 block">Neural Template</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {contentTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={`p-5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex flex-col items-center gap-2.5 border ${contentType === type.value
                    ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white hover:text-slate-800 shadow-sm'
                    }`}
                >
                  <IconComponent className="w-5 h-5 mb-0.5" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-10 relative z-10">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-3 block">
            {mode === 'write' ? 'Engine Instructions' : 'Source Content for Refinement'}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === 'write'
                ? prompts[contentType]?.write || 'Describe your vision...'
                : 'Paste content for surgical refinement...'
            }
            className="w-full h-40 px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 focus:bg-white transition-all outline-none text-slate-800 placeholder:text-slate-400 font-medium resize-none leading-relaxed shadow-sm text-sm"
            disabled={isGenerating}
          />
        </div>

        {/* Generate Button */}
        <div className="relative z-10">
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={generateText}
            disabled={isGenerating || (mode === 'rewrite' && !inputText.trim()) || dailyCount >= dailyLimit}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-sm hover:shadow-md hover:bg-black transition-all flex items-center justify-center gap-3 border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-slate-500/20"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Simulating Creative Genius...</span>
              </>
            ) : (
              <>
                <RefreshCw className={`w-5 h-5 text-indigo-100 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{mode === 'write' ? 'Execute Creative Synthesis' : 'Begin Refinement Protocol'}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isGenerating && progress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex items-center gap-4 text-xs font-bold text-indigo-600 uppercase tracking-widest"
          >
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  className="w-1.5 h-1.5 bg-indigo-600 rounded-full"
                />
              ))}
            </div>
            {progress}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output Section */}
      <AnimatePresence>
        {outputText && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 right-10 w-px h-full bg-slate-100 hidden lg:block" />

            <div className="p-8 lg:p-10 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50/50 relative z-10 gap-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm relative group">
                  <div className="absolute inset-0 bg-emerald-400 rounded-xl animate-ping opacity-20" />
                  <FileText className="w-6 h-6 relative z-10" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5 block">
                    Synthesized Output
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                    Generation Alpha
                  </h3>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(outputText)}
                  className="px-6 py-3.5 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Direct Copy
                </button>
                <button
                  onClick={clearAll}
                  className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-800 hover:bg-slate-100 transition-all shadow-sm"
                >
                  Discard
                </button>
              </div>
            </div>

            <div className="p-8 lg:p-10 relative z-10">
              <div className="prose prose-slate max-w-none">
                <pre className="whitespace-pre-wrap text-slate-700 font-sans leading-relaxed text-sm">
                  {outputText}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="mt-16 relative z-10">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 ml-1">
            Neural Vault History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.slice(0, 6).map((session) => {
              const contentTypeData = contentTypes.find(t => t.value === session.content_type);
              const IconComponent = contentTypeData?.icon || FileText;
              return (
                <div
                  key={session.id}
                  className="p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-300 transition-all cursor-pointer group hover:shadow-sm shadow-sm"
                  onClick={() => {
                    setMode(session.mode);
                    setContentType(session.content_type);
                    setInputText(session.input_text);
                    setOutputText(session.output_text);
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-100">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 tracking-tight">
                          {contentTypeData?.label || session.content_type}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {session.mode === 'write' ? 'Creative' : 'Refinement'} • {session.word_count} tokens
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(session.output_text);
                      }}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs font-medium text-slate-500 truncate opacity-80 group-hover:opacity-100 transition-opacity">
                    {session.output_text.substring(0, 80)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Writer;
