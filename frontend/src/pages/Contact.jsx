import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ShieldCheck } from 'lucide-react';

const Contact = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
    setFormState({ name: '', email: '', message: '' });
  };

  const contactMethods = [
    { icon: Mail, title: 'Email Support', desc: 'Our team replies in < 2h', value: 'support@outrelix.com', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: MessageSquare, title: 'Live Chat', desc: 'Available Mon-Fri', value: 'Start Chatting', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Phone, title: 'Phone Support', desc: 'Direct line for VIP', value: '+1 (555) 000-0000', color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="bg-white min-h-screen relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

            {/* Left Side: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
                Connect With Us
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
                Let's Build the <br /><span className="text-blue-600">Future</span> Together.
              </h1>
              <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-lg">
                Have questions about our neural engine? Need help scaling your revenue ops? Our team of experts is ready to help you dominate.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {contactMethods.map((method) => (
                  <div key={method.title} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                    <div className={`w-12 h-12 ${method.bg} ${method.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1`}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{method.title}</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-3">{method.desc}</p>
                    <p className={`text-sm font-black tracking-tight ${method.color}`}>{method.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Globe className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Global Operations</h4>
                  <p className="text-slate-400 leading-snug">Managing outreach pipelines across 40+ countries and 12 timezones.</p>
                </div>
              </div>
            </motion.div>

            {/* Right Side: Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-[3rem] blur-[80px] opacity-10 animate-pulse" />
              <div className="relative bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-8 md:p-12">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">Direct Message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold transition-all"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Business Email</label>
                      <input
                        required
                        type="email"
                        placeholder="john@company.com"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold transition-all"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Your Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="How can our AI help you grow?"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold transition-all resize-none"
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black tracking-tighter text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <AnimatePresence mode="wait">
                      {isSent ? (
                        <motion.div
                          key="sent"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Send className="w-5 h-5" /> MESSAGE SENT!
                        </motion.div>
                      ) : (
                        <motion.div
                          key="send"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> SEND MESSAGE
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <Clock className="w-4 h-4" /> Average reply: 90m
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Data
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 flex items-center gap-3">
                <MapPin className="text-blue-600" /> New York
              </h3>
              <p className="text-slate-500 font-bold leading-relaxed px-9">
                250 Park Avenue South,<br />New York, NY 10003
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 flex items-center gap-3">
                <MapPin className="text-purple-600" /> London
              </h3>
              <p className="text-slate-500 font-bold leading-relaxed px-9">
                10 York Rd, South Bank,<br />London SE1 7ND
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 flex items-center gap-3">
                <MapPin className="text-green-600" /> San Francisco
              </h3>
              <p className="text-slate-500 font-bold leading-relaxed px-9">
                425 Mission St,<br />San Francisco, CA 94105
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 