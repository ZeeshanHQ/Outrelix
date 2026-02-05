import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 font-poppins relative overflow-hidden">
      {/* Dots background in corners, blocky design */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Top left blocky dots */}
        <svg width="180" height="180" className="absolute left-0 top-0" style={{ opacity: 0.13 }}>
          {[0,1,2,3,4,5].map(row => (
            [0,1,2,3,4,5].map(col => (
              ((row === 0 && [0,1,2,3].includes(col)) ||
               (row === 1 && [0,1,2,3,4].includes(col)) ||
               (row === 2 && [0,1,2,3,4,5].includes(col)) ||
               (row === 3 && [0,1,2,3,4].includes(col)) ||
               (row === 4 && [0,1,2,3].includes(col)) ||
               (row === 5 && [0,1].includes(col))) ? (
                <circle
                  key={`tl-${row}-${col}`}
                  cx={col * 28 + 10}
                  cy={row * 28 + 10}
                  r={4}
                  fill="#222"
                />
              ) : null
            ))
          ))}
        </svg>
        {/* Bottom right blocky dots */}
        <svg width="180" height="180" className="absolute right-0 bottom-0" style={{ opacity: 0.13 }}>
          {[0,1,2,3,4,5].map(row => (
            [0,1,2,3,4,5].map(col => (
              ((row === 5 && [2,3,4,5].includes(col)) ||
               (row === 4 && [1,2,3,4,5].includes(col)) ||
               (row === 3 && [0,1,2,3,4,5].includes(col)) ||
               (row === 2 && [1,2,3,4,5].includes(col)) ||
               (row === 1 && [2,3,4,5].includes(col)) ||
               (row === 0 && [4,5].includes(col))) ? (
                <circle
                  key={`br-${row}-${col}`}
                  cx={col * 28 + 10}
                  cy={row * 28 + 10}
                  r={4}
                  fill="#222"
                />
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
            {t('Contact Us')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 text-center font-poppins max-w-2xl mx-auto"
          >
            {t("We'd love to hear from you! Reach out with your questions, feedback, or partnership ideas.")}
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              onSubmit={handleSubmit}
              className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-10 flex flex-col gap-6 border border-blue-100 dark:border-blue-900 relative z-10 font-poppins"
            >
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-200 font-poppins">{t('Name')}</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                placeholder={t('Your Name')}
              />
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-200 font-poppins">{t('Email')}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                placeholder={t('you@email.com')}
              />
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-200 font-poppins">{t('Message')}</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins resize-none"
                placeholder={t('How can we help you?')}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="mt-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition font-poppins"
              >
                {submitted ? t('Thank you!') : t('Send Message')}
              </motion.button>
              <div className="flex flex-wrap gap-3 mt-4 items-center justify-center">
                <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-poppins"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> Secure & confidential</span>
                <span className="inline-flex items-center gap-2 text-xs text-blue-500 font-poppins"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" /></svg> We reply within 24 hours</span>
                <span className="inline-flex items-center gap-2 text-xs text-purple-500 font-poppins"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2v20M2 12h20" /></svg> Trusted by 10,000+ users</span>
              </div>
            </motion.form>
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-10 border border-blue-100 dark:border-blue-900 flex flex-col gap-8 justify-center relative z-10 font-poppins"
            >
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 font-poppins">{t('Contact Info')}</h2>
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
                  <span className="text-lg text-gray-700 dark:text-gray-200 font-poppins">{t('Email')}: <a href="mailto:info@astraventa.com" className="text-blue-500 hover:underline">info@astraventa.com</a></span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" /></svg>
                  <span className="text-lg text-gray-700 dark:text-gray-200 font-poppins">{t('Phone')}: <a href="tel:+1234567890" className="text-blue-500 hover:underline">+1 234 567 890</a></span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M17 8V6a4 4 0 00-8 0v2M3 8v6a9 9 0 0018 0V8" /></svg>
                  <span className="text-lg text-gray-700 dark:text-gray-200 font-poppins">{t('Address')}: 123 Astraventa Ave, Innovation City, World</span>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 font-poppins">{t('Business Hours')}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-poppins">{t('Mon - Fri: 9:00 AM - 6:00 PM')}</p>
                <p className="text-gray-600 dark:text-gray-400 font-poppins">{t('Sat - Sun: Closed')}</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6 items-center justify-center">
                <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-poppins"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> Secure & confidential</span>
                <span className="inline-flex items-center gap-2 text-xs text-blue-500 font-poppins"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" /></svg> We reply within 24 hours</span>
                <span className="inline-flex items-center gap-2 text-xs text-purple-500 font-poppins"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2v20M2 12h20" /></svg> Trusted by 10,000+ users</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 