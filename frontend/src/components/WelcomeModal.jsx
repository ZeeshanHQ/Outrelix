import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Target, BarChart3 } from 'lucide-react';

const WelcomeModal = ({ isOpen, userName = '', onComplete }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950"
      >
        {/* Premium Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/10 via-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/10 via-blue-400/5 to-transparent rounded-full blur-2xl animate-pulse"></div>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative flex flex-col items-center w-full max-w-2xl mx-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
        >
          {/* Top Accent Bar */}
          <div className="w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Welcome Content */}
          <div className="flex flex-col items-center text-center px-8 py-10">
            {/* Emoji */}
            <div className="mb-6 w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Welcome Text */}
            <h2
              className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm font-poppins"
              title={userName || 'User'}
            >
              Welcome{userName ? `, ${userName}` : ''}!
            </h2>

            {/* Premium Subtitle */}
            <p className="text-xl text-gray-600 dark:text-gray-300 font-poppins max-w-xl mb-8">
              Get ready to transform your email outreach with AI-powered automation
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Smart Automation
              </span>
              <span className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-sm font-medium border border-purple-100 dark:border-purple-800 flex items-center gap-2">
                <Target className="w-4 h-4" /> Personalized Outreach
              </span>
              <span className="px-4 py-2 rounded-full bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 text-sm font-medium border border-pink-100 dark:border-pink-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Real-time Analytics
              </span>
            </div>

            {/* Continue Button */}
            <motion.button
              onClick={() => onComplete && onComplete({ userName })}
              className="w-64 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-poppins flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </div>

          {/* Bottom Accent Line */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

          {/* Premium Footer */}
          <div className="w-full px-8 py-4 text-center bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your data is secure and protected
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal; 