import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Users, ShieldCheck, Zap, Globe } from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'Emails Delivered', value: '50M+' },
    { label: 'Data Points', value: '40+' },
    { label: 'Global Reach', value: '120+' },
  ];

  const values = [
    { icon: Target, title: 'Precision', desc: 'We believe in quality over quantity. Every lead is verified through 14 waterfall providers.' },
    { icon: Eye, title: 'Clarity', desc: 'Neural intelligence that understands the "why" behind every prospect interaction.' },
    { icon: ShieldCheck, title: 'Security', desc: 'Enterprise-grade protection with full GDPR, SOC2, and HIPAA compliance.' },
    { icon: Zap, title: 'Velocity', desc: 'Scaling outbound from zero to dominance in weeks, not months.' },
    { icon: Users, title: 'Empathy', desc: 'AI that writes like a human, for humans, building real relationships.' },
    { icon: Globe, title: 'Innovation', desc: 'The future of revenue operations, powered by neural networks.' },
  ];

  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
              Our Mission
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 max-w-4xl mx-auto leading-[0.9]">
              Revolutionizing Outreach with <span className="text-blue-600">Neural Intelligence.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Outrelix was born from a simple observation: B2B outreach is broken. We're on a mission to fix it by combining human empathy with machine precision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-8">
                From a Garage Project to a <br />Global Revenue Engine.
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  Started in 2024, our founders realized that traditional sales tools were just "spam machines." They were built for volume, not value.
                </p>
                <p>
                  We spent two years building a neural engine that doesn't just scrape data, but understands it. Today, Outrelix powers the outreach of thousands of startups and enterprise sales teams worldwide.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-1 shadow-2xl overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1522071823957-09c5273c40fd?auto=format&fit=crop&q=80&w=800"
                  alt="Team collaboration"
                  className="w-full h-full object-cover rounded-[1.4rem] opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-50 rounded-2xl rotate-12 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Our Core Fundamentals</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              The principles that drive every single line of code we write and every feature we deploy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 transition-transform group-hover:-translate-y-1">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Image / CTA Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-12">
            Join the Movement.
          </h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black tracking-tighter hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
              JOIN THE TEAM
            </button>
            <button className="px-10 py-4 border-2 border-slate-100 text-slate-900 rounded-2xl font-black tracking-tighter hover:bg-slate-50 transition-all">
              VIEW OPEN ROLES
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 