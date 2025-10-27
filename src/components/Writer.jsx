import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import supabase, { analyzerApi } from '../lib/supabaseClient';
import { Smartphone, Mail, Megaphone, Search, Package, FileText, Share2, Newspaper, PenTool, RefreshCw } from 'lucide-react';

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
      // Simulate Chrome's built-in AI Writer/Rewriter API
      // In a real implementation, you'd call the actual Chrome API
      const generatedText = await simulateAIWriter(mode, contentType, inputText);
      
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
      app_description: `🚀 **Outrelix - AI-Powered Email Marketing**

Transform your email campaigns with AI-driven personalization and automation. Outrelix helps businesses create compelling, personalized emails that drive engagement and conversions.

**Key Features:**
• AI-powered content generation
• Smart audience targeting
• Real-time analytics dashboard
• Multi-industry templates
• Automated follow-up sequences

**Perfect for:** Marketing teams, small businesses, and entrepreneurs looking to scale their email marketing efforts.

Download now and start sending emails that actually get opened! 📧✨`,
      
      cold_email: `Subject: Quick question about your email marketing strategy

Hi [Name],

I hope this email finds you well. I noticed that [Company] has been doing great work in [Industry], and I wanted to reach out with a quick question.

Are you currently using any email marketing tools to engage with your customers? I ask because I've been working with similar companies in your space, and I've seen some impressive results when they optimize their email campaigns.

For example, one client increased their open rates by 40% and saw a 25% boost in conversions just by implementing some simple personalization strategies.

I'd love to share a few quick tips that might be relevant to your business. Would you be open to a brief 15-minute call this week to discuss?

Best regards,
[Your Name]

P.S. I'm not selling anything - just genuinely interested in helping fellow entrepreneurs succeed.`,
      
      ad_copy: `🔥 **LIMITED TIME: 50% OFF Email Marketing Mastery Course**

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
      
      social_media: `🚀 Just launched our new AI-powered email marketing tool!

✨ Generate personalized emails in seconds
📊 Track performance with real-time analytics  
🎯 Target the right audience every time
⚡ Automate your entire email workflow

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
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Smart Writer & Rewriter
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered content generation</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {dailyCount}/{dailyLimit}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">generations today</div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Choose Mode
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('write')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                mode === 'write'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <PenTool className="w-5 h-5" />
              Write New
            </button>
            <button
              onClick={() => setMode('rewrite')}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                mode === 'rewrite'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              Rewrite Existing
            </button>
          </div>
        </div>

        {/* Content Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Content Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {contentTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={`p-4 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                    contentType === type.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {mode === 'write' ? 'Prompt or Instructions' : 'Text to Rewrite'}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              mode === 'write'
                ? prompts[contentType]?.write || 'Enter your prompt or instructions...'
                : 'Paste the text you want to rewrite...'
            }
            className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* Generate Button */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateText}
            disabled={isGenerating || (mode === 'rewrite' && !inputText.trim()) || dailyCount >= dailyLimit}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            {isGenerating ? 'Generating...' : mode === 'write' ? 'Generate Content' : 'Rewrite Text'}
          </motion.button>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isGenerating && progress && (
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

        {/* Output Section */}
        <AnimatePresence>
          {outputText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Generated Content
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(outputText)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={clearAll}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 font-sans leading-relaxed">
                    {outputText}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => {
                const contentTypeData = contentTypes.find(t => t.value === session.content_type);
                const IconComponent = contentTypeData?.icon || FileText;
                return (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => {
                      setMode(session.mode);
                      setContentType(session.content_type);
                      setInputText(session.input_text);
                      setOutputText(session.output_text);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {contentTypeData?.label || session.content_type}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {session.mode === 'write' ? 'Generated' : 'Rewritten'} • {session.word_count} words • {new Date(session.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(session.output_text);
                        }}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Writer;
