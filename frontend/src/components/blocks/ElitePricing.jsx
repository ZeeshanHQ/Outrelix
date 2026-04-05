import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { Card } from "../ui/card";

const PricingCard = ({ tier, paymentFrequency = "monthly", onSignupClick }) => {
  const price = tier.price[paymentFrequency];
  const isPopular = tier.popular;

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-10 overflow-hidden p-12 transition-all duration-1000 rounded-[3rem] group",
        "bg-obsidian-800/20 border-white/5 backdrop-blur-3xl hover:bg-obsidian-800/40 hover:border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]",
        isPopular && "ring-1 ring-blue-500/20 shadow-[0_0_100px_rgba(59,130,246,0.05)]"
      )}
    >
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-blue-400/40 tracking-[0.3em] uppercase">{tier.name} Edition</span>
          {isPopular && (
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 tracking-widest uppercase">
              PREMIUM ASCENSION
            </span>
          )}
        </div>
        <div className="relative mt-10">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white tracking-tighter italic">
              {typeof price === "number" ? `$${price}` : price}
            </span>
            {typeof price === "number" && (
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">/ NODE / MO</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        <p className="text-sm font-medium text-white/40 leading-relaxed italic border-l border-white/10 pl-6">
          {tier.description}
        </p>
        <ul className="space-y-5">
          {tier.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-4 text-[11px] font-black text-white/50 tracking-widest uppercase group/item"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 group-hover/item:bg-blue-400 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onSignupClick}
        className={cn(
          "w-full py-6 px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-700",
          isPopular 
            ? "bg-white text-obsidian-950 hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.1)]" 
            : "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
        )}
      >
        Provision {tier.name} Node
      </button>
    </Card>
  );
};

const ElitePricing = ({ onSignupClick }) => {
  const pricingPlans = [
    {
      name: 'Starter',
      price: { monthly: 99, yearly: 79 },
      description: 'Ideal for elite solo operatives seeking initial infrastructure scaling.',
      features: [
        '1,000 Transmissions / Mo',
        '1 Dedicated Workflow Node',
        'Technical Analytics HUD',
        'Identity Verification Protocols',
        '24/7 Encryption Support',
        'Standard Uplinks'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 199, yearly: 159 },
      description: 'The industry standard for high-frequency outreach and automation.',
      features: [
        '5,000 Transmissions / Mo',
        'Unlimited Workflow Nodes',
        'Neural Adaptive Replies',
        '200+ Tactical Templates',
        'Core CRM Synchronization',
        'Advanced Uplinks',
        'Priority Uplink Slot'
      ],
      popular: true
    },
    {
      name: 'Power',
      price: { monthly: 399, yearly: 319 },
      description: 'Maximum authority infrastructure for agencies and rapid-growth organizations.',
      features: [
        '15,000 Transmissions / Mo',
        'Full Neural Integration',
        'Enterprise HUD & Dashboards',
        'Dedicated Uplink Manager',
        'System Warmup Lifecycle',
        'Full API Synchronization',
        'Custom Protocol Engineering'
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-64 relative overflow-hidden bg-obsidian-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.02),transparent_70%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto mb-48">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.5em] mb-8 block">PROTOCOL 03 // RESOURCE ALLOCATION</span>
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-10 leading-[0.85] uppercase italic">
              Predicatable <br />
              <span className="text-white/20 not-italic">Scale Infrastructure.</span>
            </h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
              Elite infrastructure requires serious commitment. Select the operational tier that matches your authority.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <PricingCard
                tier={plan}
                onSignupClick={onSignupClick}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ElitePricing;
