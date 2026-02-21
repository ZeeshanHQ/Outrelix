import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Star,
  Clock,
  Layout,
  Briefcase
} from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const tiers = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for exploring the platform',
      icon: <Layout className="w-5 h-5 text-slate-400" />,
      features: [
        '1 Active Sequence',
        '100 Emails / month',
        'Basic Analytics',
        'Email Support',
        'Community Access'
      ],
      cta: 'Current Plan',
      current: true,
      premium: false
    },
    {
      name: 'Starter',
      price: 29,
      description: 'Ideal for solo entrepreneurs',
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      features: [
        '5 Active Sequences',
        '1,000 Emails / month',
        'AI Smart Reply (Basic)',
        'CRM Integration',
        'Priority Email Support'
      ],
      cta: 'Upgrade to Starter',
      current: false,
      premium: false
    },
    {
      name: 'Pro',
      price: 79,
      description: 'Best for growing startups',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      features: [
        'Unlimited Sequences',
        '5,000 Emails / month',
        'Advanced AI Copywriting',
        'Team Collaboration',
        'API Access',
        'Phone Support'
      ],
      cta: 'Upgrade to Pro',
      current: false,
      premium: true,
      popular: true
    },
    {
      name: 'Power',
      price: 199,
      description: 'Everything you need to dominate',
      icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
      features: [
        '15,000 Emails / month',
        'Dedicated Account Manager',
        'Custom Integrations',
        'White-label Reports',
        'Early access to AI features',
        'VIP Support'
      ],
      cta: 'Get Power Plan',
      current: false,
      premium: false
    }
  ];

  return (
    <div className="min-h-screen bg-white font-['Outfit']">
      <DashboardHeader showGreeting={false} title="Billing & Plans" />

      <main className="max-w-7xl mx-auto p-8 lg:p-12 pb-32">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-slate-800 tracking-tight mb-4">Choose your growth path</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Experience the power of AI-driven outreach with our simple, transparent pricing.
              No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="flex items-center p-1.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Yearly
              <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col p-8 rounded-[32px] border-2 transition-all duration-300 ${tier.popular
                  ? 'border-purple-100 bg-white shadow-2xl shadow-purple-100/50'
                  : 'border-slate-50 bg-white hover:border-slate-100 hover:shadow-xl'
                }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6`}>
                  {tier.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{tier.name}</h3>
                <p className="text-xs font-medium text-slate-400">{tier.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-800 tracking-tighter">
                    ${billingCycle === 'monthly' ? tier.price : Math.floor(tier.price * 0.8)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/mo</span>
                </div>
                {billingCycle === 'yearly' && tier.price > 0 && (
                  <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">Billed annually</p>
                )}
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {tier.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <div className="p-0.5 bg-emerald-50 rounded-full">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-4 rounded-2xl text-sm font-bold transition-all ${tier.current
                    ? 'bg-slate-50 text-slate-400 cursor-default'
                    : tier.popular
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise / Support Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 rounded-[32px] border border-slate-50 bg-slate-50/30 md:col-span-2 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
              <Star className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-800 mb-2">Need something bigger?</h4>
              <p className="text-slate-500 font-medium">We offer custom enterprise plans for agencies and large organizations. Let's talk about your specific needs.</p>
              <button className="mt-6 text-sm font-bold text-blue-600 flex items-center gap-2 group">
                Contact Sales Support <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="p-10 rounded-[32px] border border-slate-50 bg-white flex flex-col items-center text-center justify-center">
            <ShieldCheck className="w-12 h-12 text-blue-500 mb-4" />
            <h4 className="text-lg font-bold text-slate-800 mb-2">Secure Billing</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              We use 256-bit encrypted payments. Your security is our top priority.
            </p>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-32 text-center max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-slate-800 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-6 text-left">
            {[
              { q: 'Can I change plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time through this dashboard.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and Apple Pay.' }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                <h5 className="font-bold text-slate-800 mb-2">{item.q}</h5>
                <p className="text-sm text-slate-500 font-medium">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default PricingPage;
