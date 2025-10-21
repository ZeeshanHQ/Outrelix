import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Blog = () => {
  const { t } = useTranslation();
  const [openBlog, setOpenBlog] = useState(null);

  const blogs = [
    {
      id: 1,
      title: t('blog1_title'),
      summary: t('blog1_summary'),
      content: t('blog1_content'),
      tag: t('blog1_tag'),
      image: '/email_marketing.jpg',
    },
    {
      id: 2,
      title: t('blog2_title'),
      summary: t('blog2_summary'),
      content: t('blog2_content'),
      tag: t('blog2_tag'),
      image: '/lead_generation_secrets.jpg',
    },
    {
      id: 3,
      title: t('blog3_title'),
      summary: t('blog3_summary'),
      content: t('blog3_content'),
      tag: t('blog3_tag'),
      image: '/ai_power.jpg',
    },
    {
      id: 4,
      title: t('blog4_title'),
      summary: t('blog4_summary'),
      content: t('blog4_content'),
      tag: t('blog4_tag'),
      image: '/cold_emails.jpeg',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 font-poppins relative overflow-hidden">
      {/* Dots background in corners and sides, blocky design */}
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
        {/* Left side blocky dots */}
        <svg width="80" height="320" className="absolute left-0 top-1/2 -translate-y-1/2" style={{ opacity: 0.10 }}>
          {[0,1,2,3,4,5,6,7,8,9].map(row => (
            [0,1,2].map(col => (
              ((col === 0 && [0,1,2,3,4,5,6,7,8,9].includes(row)) ||
               (col === 1 && [2,3,4,5,6,7].includes(row)) ||
               (col === 2 && [4,5].includes(row))) ? (
                <circle
                  key={`ls-${row}-${col}`}
                  cx={col * 24 + 10}
                  cy={row * 28 + 10}
                  r={3.5}
                  fill="#222"
                />
              ) : null
            ))
          ))}
        </svg>
        {/* Right side blocky dots */}
        <svg width="80" height="320" className="absolute right-0 top-1/2 -translate-y-1/2" style={{ opacity: 0.10 }}>
          {[0,1,2,3,4,5,6,7,8,9].map(row => (
            [0,1,2].map(col => (
              ((col === 2 && [0,1,2,3,4,5,6,7,8,9].includes(row)) ||
               (col === 1 && [2,3,4,5,6,7].includes(row)) ||
               (col === 0 && [4,5].includes(row))) ? (
                <circle
                  key={`rs-${row}-${col}`}
                  cx={col * 24 + 10}
                  cy={row * 28 + 10}
                  r={3.5}
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4 text-center font-poppins tracking-tight drop-shadow-lg"
            style={{ letterSpacing: '-0.01em', lineHeight: '1.1' }}
          >
            {t('Blogs & Insights')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 text-center font-poppins max-w-2xl mx-auto"
          >
            {t('Discover quick tips and how-tos to elevate your skills to the next level.')}
          </motion.p>
          <div className="flex flex-wrap gap-3 mb-8 items-center justify-center">
            <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-poppins"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> Curated by Outrelix Experts</span>
            <span className="inline-flex items-center gap-2 text-xs text-blue-500 font-poppins"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" /></svg> Updated Weekly</span>
            <span className="inline-flex items-center gap-2 text-xs text-purple-500 font-poppins"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2v20M2 12h20" /></svg> Trusted by 10,000+ users</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {blogs.map((blog, idx) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-0 flex flex-col justify-between border border-gray-100 dark:border-gray-700 relative z-10 overflow-hidden"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-56 object-cover object-center rounded-t-2xl"
                />
                <div className="p-8 flex flex-col flex-1">
                  <span className="inline-block px-3 py-1 mb-4 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white text-xs font-semibold tracking-wide">
                    {blog.tag}
                  </span>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white font-poppins">{blog.title}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 font-poppins">{blog.summary}</p>
                  <button
                    onClick={() => setOpenBlog(blog)}
                    className="mt-auto bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:opacity-90 transition"
                  >
                    {t('Read More')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Blog Modal */}
      <AnimatePresence>
        {openBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setOpenBlog(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setOpenBlog(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-primary-500 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
              <div dangerouslySetInnerHTML={{ __html: openBlog.content }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blog; 