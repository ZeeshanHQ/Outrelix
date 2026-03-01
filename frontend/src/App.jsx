import React, { useState, useEffect } from 'react';
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
import Leads from './pages/Leads';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import DataDeletion from './pages/DataDeletion';
import FAQ from './pages/FAQ';
import PricingPayment from './pages/PricingPayment';
import PricingPage from './pages/PricingPage';
import AnalyzePage from './pages/Analyze';
import WriterPage from './pages/WriterPage';
import BrandGeneratorPage from './pages/BrandGeneratorPage';
import SEOOptimizerPage from './pages/SEOOptimizerPage';
import { GmailStatusProvider } from './utils/GmailStatusContext';
import { auth } from './supabase';
import { SidebarProvider } from './contexts/SidebarContext';
import { NotificationProvider } from './contexts/NotificationContext';
import DashboardLayout from './components/DashboardLayout';

const RequireAuth = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Initial check from Supabase directly to be most accurate
    const initAuth = async () => {
      try {
        const { data: { session } } = await auth.getSession();
        if (session && session.user) {
          // ALWAYS Sync localStorage with the current Supabase session
          // This ensures that switching accounts updates the UI immediately
          const userObj = {
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            photoURL: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
            provider: session.user.app_metadata?.provider || 'supabase'
          };

          const cachedUser = localStorage.getItem('user');
          if (cachedUser !== JSON.stringify(userObj)) {
            console.log('[Auth] Syncing user metadata to localStorage');
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user', JSON.stringify(userObj));
            window.dispatchEvent(new Event('user-updated'));
          }
          setIsAuthed(true);
        } else {
          // No session from Supabase
          const localStorageAuthed = localStorage.getItem('isAuthenticated') === 'true';
          setIsAuthed(localStorageAuthed);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setIsAuthed(false);
      } finally {
        setIsReady(true);
      }
    };

    initAuth();

    // Listen for storage changes from other tabs/processes
    const handleStorageChange = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthed(isAuthenticated);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-updated', handleStorageChange);
    };
  }, []);

  if (!isReady) return null;
  return isAuthed ? children : <Navigate to="/" replace />;
};

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="container mx-auto px-4 py-8 pt-20">
      {children}
    </main>
    <Footer />
  </>
);

const App = () => {
  useEffect(() => {
    // Global listener to keep localStorage in sync with Supabase
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      console.log('Supabase Auth Event:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            photoURL: session.user.user_metadata?.avatar_url || null,
            provider: session.user.app_metadata?.provider || 'supabase'
          }));
          window.dispatchEvent(new Event('user-updated'));
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        // CRITICAL: Clear Gmail cache so the next account starts fresh
        localStorage.removeItem('isGmailConnected');
        localStorage.removeItem('gmailEmail');
        window.dispatchEvent(new Event('user-updated'));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <GmailStatusProvider>
        <NotificationProvider>
          <SidebarProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
                <style>
                  {`
                  nav[data-navbar-id="main-navbar"]:not(:first-of-type) { display: none !important; }
                  nav[data-navbar-id="main-navbar"] { height: auto !important; padding: 0.5rem 0; }
                  nav[data-navbar-id="main-navbar"] img { width: 5rem !important; height: 5rem !important; margin: 0.5rem 0; }
                  nav[data-navbar-id="main-navbar"] .logo-text { font-size: 2.5rem !important; font-family: 'Pacifico', cursive; background: linear-gradient(135deg, #22c55e, #3b82f6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                `}
                </style>

                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
                  <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                  <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
                  <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                  <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
                  <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
                  <Route path="/terms" element={<PublicLayout><TermsOfService /></PublicLayout>} />
                  <Route path="/cookies" element={<PublicLayout><CookiePolicy /></PublicLayout>} />
                  <Route path="/data-deletion" element={<PublicLayout><DataDeletion /></PublicLayout>} />
                  <Route path="/pricing-payment" element={<PublicLayout><PricingPayment /></PublicLayout>} />

                  {/* Dashboard Routes (Wrapped in DashboardLayout) */}
                  <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analyze" element={<AnalyzePage />} />
                    <Route path="/writer" element={<WriterPage />} />
                    <Route path="/brand-generator" element={<BrandGeneratorPage />} />
                    <Route path="/seo-optimizer" element={<SEOOptimizerPage />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/campaigns/:jobId" element={<Campaigns />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/billing" element={<PricingPage />} />
                    <Route path="/pricing-page" element={<PricingPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <ToastContainer />
              </div>
            </Router>
          </SidebarProvider>
        </NotificationProvider>
      </GmailStatusProvider>
    </I18nextProvider>
  );
};

export default App;