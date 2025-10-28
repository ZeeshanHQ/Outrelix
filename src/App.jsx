import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './utils/axios'; // Import axios configuration globally
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DataDeletion from './pages/DataDeletion';
import FAQ from './pages/FAQ';
import PricingPayment from './pages/PricingPayment';
import PricingPage from './pages/PricingPage';
import AnalyzePage from './pages/Analyze';
import WriterPage from './pages/WriterPage';
import BrandGeneratorPage from './pages/BrandGeneratorPage';
import SEOOptimizerPage from './pages/SEOOptimizerPage';
import { GmailStatusProvider } from './utils/GmailStatusContext';

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <GmailStatusProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
            <style>
              {`
                nav[data-navbar-id="main-navbar"]:not(:first-of-type) {
                  display: none !important;
                }
                nav[data-navbar-id="main-navbar"] {
                  height: auto !important;
                  padding: 0.5rem 0;
                }
                nav[data-navbar-id="main-navbar"] img {
                  width: 5rem !important;
                  height: 5rem !important;
                  margin: 0.5rem 0;
                }
                nav[data-navbar-id="main-navbar"] .logo-text {
                  font-size: 2.5rem !important;
                  font-family: 'Pacifico', cursive;
                  background: linear-gradient(135deg, #22c55e, #3b82f6, #a855f7);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                }
              `}
            </style>
            <Navbar />
            <main className="container mx-auto px-4 py-8 pt-20">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analyze" element={<AnalyzePage />} />
                <Route path="/writer" element={<WriterPage />} />
                <Route path="/brand-generator" element={<BrandGeneratorPage />} />
                <Route path="/seo-optimizer" element={<SEOOptimizerPage />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/:jobId" element={<Campaigns />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/data-deletion" element={<DataDeletion />} />
                <Route path="/pricing-payment" element={<PricingPayment />} />
                <Route path="/pricing-page" element={<PricingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <ToastContainer />
          </div>
        </Router>
      </GmailStatusProvider>
    </I18nextProvider>
  );
};

export default App; 