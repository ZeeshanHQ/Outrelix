import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 font-poppins relative overflow-hidden">
      {/* Decorative Dots Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg width="180" height="180" className="absolute left-0 top-0" style={{ opacity: 0.13 }}>
          {[0,1,2,3,4,5].map(row => (
            [0,1,2,3,4,5].map(col => (
              ((row === 0 && [0,1,2,3].includes(col)) ||
               (row === 1 && [0,1,2,3,4].includes(col)) ||
               (row === 2 && [0,1,2,3,4,5].includes(col)) ||
               (row === 3 && [0,1,2,3,4].includes(col)) ||
               (row === 4 && [0,1,2,3].includes(col)) ||
               (row === 5 && [0,1].includes(col))) ? (
                <circle key={`tl-${row}-${col}`} cx={col * 28 + 10} cy={row * 28 + 10} r={4} fill="#222" />
              ) : null
            ))
          ))}
        </svg>
        <svg width="180" height="180" className="absolute right-0 bottom-0" style={{ opacity: 0.13 }}>
          {[0,1,2,3,4,5].map(row => (
            [0,1,2,3,4,5].map(col => (
              ((row === 5 && [2,3,4,5].includes(col)) ||
               (row === 4 && [1,2,3,4,5].includes(col)) ||
               (row === 3 && [0,1,2,3,4,5].includes(col)) ||
               (row === 2 && [1,2,3,4,5].includes(col)) ||
               (row === 1 && [2,3,4,5].includes(col)) ||
               (row === 0 && [4,5].includes(col))) ? (
                <circle key={`br-${row}-${col}`} cx={col * 28 + 10} cy={row * 28 + 10} r={4} fill="#222" />
              ) : null
            ))
          ))}
        </svg>
      </div>
      <section className="relative pb-20 z-10">
        <style>{`
          body, .poppins, .font-poppins {
            font-family: 'Poppins', Arial, sans-serif !important;
          }
          html { scroll-behavior: smooth; }
        `}</style>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6 text-center font-poppins tracking-tight drop-shadow-lg"
            style={{ letterSpacing: '-0.01em', lineHeight: '1.1' }}
          >
            {t('About Outrelix')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 text-center font-poppins max-w-2xl mx-auto"
          >
            {t('Outrelix is on a mission to revolutionize email outreach with AI-powered automation, personalization, and analytics. Our platform empowers businesses to connect, engage, and grow smarter and faster than ever before.')}
          </motion.p>
          <div className="flex flex-wrap gap-3 mb-8 items-center justify-center">
            <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-poppins"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> Trusted by 10,000+ users</span>
            <span className="inline-flex items-center gap-2 text-xs text-blue-500 font-poppins"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" /></svg> AI-Powered Innovation</span>
            <span className="inline-flex items-center gap-2 text-xs text-purple-500 font-poppins"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2v20M2 12h20" /></svg> Global Team</span>
          </div>
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-10 border border-blue-100 dark:border-blue-900 flex flex-col gap-8 items-center">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-4 font-poppins">{t('Our Vision')}</h2>
            <p className="text-lg text-gray-700 dark:text-gray-200 text-center font-poppins max-w-2xl">
              {t('We believe in a world where every business, regardless of size, can build meaningful relationships and drive growth through intelligent, automated communication. Outrelix is dedicated to making advanced outreach accessible, effective, and secure for everyone.')}
            </p>
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-4 font-poppins">{t('Why Choose Outrelix?')}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto mb-4">
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-200 text-base font-poppins"><svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg> {t('Cutting-edge AI personalization and automation')}</li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-200 text-base font-poppins"><svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg> {t('Real-time analytics and actionable insights')}</li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-200 text-base font-poppins"><svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg> {t('Enterprise-grade security and compliance')}</li>
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-200 text-base font-poppins"><svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg> {t('Dedicated support and onboarding')}</li>
            </ul>
            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="text-base text-gray-500 dark:text-gray-400 font-poppins">{t('Ready to join the future of outreach?')}</span>
              <a href="/" className="inline-block mt-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition font-poppins">{t('Get Started')}</a>
                </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About; 