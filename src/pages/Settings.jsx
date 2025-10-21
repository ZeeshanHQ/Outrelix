import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrashIcon } from '@heroicons/react/24/outline';

const mockCsvs = [
  { industry: 'Real Estate', count: 120, file: 'real_estate.csv' },
  { industry: 'Ecommerce', count: 80, file: 'ecommerce.csv' },
  { industry: 'Technology', count: 45, file: 'technology.csv' },
];

const Settings = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('john@example.com');
  const [name, setName] = useState('John Doe');
  const [saved, setSaved] = useState(false);
  const [timing, setTiming] = useState('default');
  const [customTime, setCustomTime] = useState('09:00');
  const [csvs, setCsvs] = useState(mockCsvs);
  const [dedup, setDedup] = useState(true);
  const [logging, setLogging] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCsv = (file) => {
    setCsvs(csvs.filter(csv => csv.file !== file));
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300"
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg transition-colors duration-300" 
            style={{ 
              fontFamily: 'Pacifico, cursive',
              letterSpacing: '0.5px',
              lineHeight: '1.4',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              WebkitTextStroke: '0.5px rgba(255,255,255,0.1)'
            }}>
          {t('Settings')}
        </h1>
        <p className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-300 drop-shadow-sm transition-colors duration-300" 
           style={{ 
             fontFamily: 'Dancing Script, cursive',
             letterSpacing: '0.3px',
             lineHeight: '1.5'
           }}>
          {t('Customize your email outreach preferences')}
        </p>
      </motion.div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: Timing, CSV, Campaign Info */}
        <div className="flex-1 space-y-8">
          {/* Email Sending Timing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300"
          >
            <h2 className="text-xl font-bold mb-4 text-primary-600 dark:text-yellow-400">{t('Email Sending Timing')}</h2>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timing"
                  value="default"
                  checked={timing === 'default'}
                  onChange={() => setTiming('default')}
                  className="form-radio text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-200">{t('Use default timing (every 10 minutes)')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timing"
                  value="custom"
                  checked={timing === 'custom'}
                  onChange={() => setTiming('custom')}
                  className="form-radio text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-200">{t('Specify custom time')}</span>
                <input
                  type="time"
                  value={customTime}
                  onChange={e => setCustomTime(e.target.value)}
                  disabled={timing !== 'custom'}
                  className="ml-2 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-2 py-1"
                />
              </label>
            </div>
          </motion.div>
          {/* CSV Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300"
          >
            <h2 className="text-xl font-bold mb-4 text-primary-600 dark:text-yellow-400">{t('Industry CSV Data')}</h2>
            <div className="space-y-4">
              {csvs.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-300">{t('No CSV data available.')}</div>
              ) : csvs.map(csv => (
                <div key={csv.file} className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 rounded p-4">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{csv.industry}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{t('Total Emails')}: <span className="font-bold">{csv.count}</span></div>
                    <div className="text-xs text-gray-400">{csv.file}</div>
                  </div>
                  <button
                    onClick={() => handleClearCsv(csv.file)}
                    className="ml-4 p-2 rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                    title={t('Clear CSV')}
                  >
                    <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-300" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
          {/* Campaign Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300"
          >
            <h2 className="text-xl font-bold mb-4 text-primary-600 dark:text-yellow-400">{t('Campaign Info')}</h2>
            <div className="text-gray-700 dark:text-gray-200">{t('Total Emails Scraped')}: <span className="font-bold">{csvs.reduce((a, c) => a + c.count, 0)}</span></div>
          </motion.div>
        </div>
        {/* Right column: Toggles, User Info */}
        <div className="flex-1 space-y-8">
          {/* Other Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300"
          >
            <h2 className="text-xl font-bold mb-4 text-primary-600 dark:text-yellow-400">{t('Other Settings')}</h2>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dedup}
                  onChange={() => setDedup(v => !v)}
                  className="form-checkbox text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-200">{t('Enable email deduplication')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={logging}
                  onChange={() => setLogging(v => !v)}
                  className="form-checkbox text-primary-600"
                />
                <span className="text-gray-700 dark:text-gray-200">{t('Enable logging')}</span>
              </label>
            </div>
          </motion.div>
          {/* User Info Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300"
          >
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('nav_user')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('nav_email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-primary-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
              >
                {t('startCampaign')}
              </motion.button>
              {saved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-500 text-center mt-2"
                >
                  ✓ {t('footer_support')}!
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 