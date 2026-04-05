import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Target, BarChart3, ArrowRight } from 'lucide-react';

const WelcomeModal = ({ isOpen, userName = '', onComplete }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-obsidian-950/90 backdrop-blur-3xl px-4"
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative flex flex-col items-center w-full max-w-2xl bg-obsidian-900 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden"
        >
          {/* Top Metallic Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

          {/* Welcome Content */}
          <div className="flex flex-col items-center text-center px-12 py-16">
            {/* Tech Icon */}
            <div className="mb-10 w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <Sparkles className="w-10 h-10 text-blue-400 relative z-10" />
            </div>

            {/* Welcome Text */}
            <span className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.5em] mb-6 block">SYSTEM INITIALIZED // AUTH_SUCCESS</span>
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tighter leading-none italic">
              Welcome, <br/>
              <span className="text-white/30 not-italic">{userName || 'OPERATIVE'}</span>
            </h2>

            {/* Premium Subtitle */}
            <p className="text-xl text-white/40 font-medium max-w-lg mb-12 leading-relaxed italic border-l border-white/10 pl-8 text-left">
              Operational access granted. The outreach engine is ready for deployment across all target nodes.
            </p>

            {/* Feature Pills - Technical Style */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 tracking-widest uppercase flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Smart Automation
              </div>
              <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 tracking-widest uppercase flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Personalized Outreach
              </div>
              <div className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 tracking-widest uppercase flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Real-time Hive Analytics
              </div>
            </div>

            {/* Continue Button */}
            <motion.button
              onClick={() => onComplete && onComplete({ userName })}
              className="group relative w-full sm:w-72 py-6 bg-white text-obsidian-950 text-xs font-black rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-700 hover:scale-105 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
            </motion.button>
          </div>

          {/* Technical Status Bar */}
          <div className="w-full px-12 py-5 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-green-500" />
              Secure Link Established
            </p>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
              V.1.0 // OUTRELIX_ELITE
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;