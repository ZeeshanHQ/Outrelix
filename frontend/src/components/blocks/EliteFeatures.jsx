import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Rocket, 
  BarChart3, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ArrowRight 
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
    viewport={{ once: true }}
    className="relative group p-12 rounded-[3.5rem] bg-obsidian-800/10 border border-white/5 hover:bg-obsidian-800/20 hover:border-white/10 transition-all duration-1000 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.3)]"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    
    <div className="relative z-10">
      <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-700">
        <Icon className="w-7 h-7 text-white/30 group-hover:text-blue-400 transition-colors duration-500" />
      </div>
      
      <span className="text-[10px] font-black text-blue-400/40 tracking-[0.4em] uppercase mb-4 block">MODULE {index + 1}</span>
      <h3 className="text-2xl font-black mb-6 text-white tracking-tighter leading-[0.9] uppercase italic group-hover:text-blue-100 transition-colors duration-500">{title}</h3>
      <p className="text-white/40 leading-relaxed text-sm font-medium group-hover:text-white/60 transition-colors duration-700">{description}</p>
      
      <div className="mt-12 flex items-center gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
        <div className="h-[1px] w-8 bg-blue-400/40" />
        <span className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase">Initialize Node</span>
        <ArrowRight className="w-3 h-3 text-blue-400" />
      </div>
    </div>
  </motion.div>
);

const EliteFeatures = () => {
  const features = [
    {
      icon: Globe,
      title: "Targeting Precision",
      description: "Advanced AI mapping across 50+ industries to identify high-authority prospects with surgical accuracy.",
      delay: 0.1
    },
    {
      icon: Rocket,
      title: "Tactical Templates",
      description: "200+ specialized email structures designed for high-conversion engagement and authority signalling.",
      delay: 0.2
    },
    {
      icon: BarChart3,
      title: "Neural Analytics",
      description: "Instant data-HUD alerts for positive sentiment responses, ensuring you never miss an engagement node.",
      delay: 0.3
    },
    {
      icon: ShieldCheck,
      title: "Identity Protection",
      description: "Advanced verification protocols and system-level personalization that secures your reputation.",
      delay: 0.4
    },
    {
      icon: Clock,
      title: "Autonomous Sequences",
      description: "Intelligent follow-up lifecycles that nurture leads automatically 24/7 across all global nodes.",
      delay: 0.5
    },
    {
      icon: Sparkles,
      title: "Real-time HUD",
      description: "Track performance metrics, transmission integrity, and conversion rates via an interactive dashboard.",
      delay: 0.6
    }
  ];

  return (
    <section id="features" className="py-64 relative bg-obsidian-950 border-t border-white/5">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              index={i}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EliteFeatures;
