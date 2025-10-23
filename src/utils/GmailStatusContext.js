import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const GmailStatusContext = createContext();

export const useGmailStatus = () => useContext(GmailStatusContext);

export const GmailStatusProvider = ({ children }) => {
  const [isGmailConnected, setIsGmailConnected] = useState(null); // null = unknown, true/false = known
  const [gmailEmail, setGmailEmail] = useState('');
  const [loading, setLoading] = useState(false); // Only true during manual refresh
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load

  const checkGmailStatus = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setLoading(true);
    } else {
      setInitialLoading(true);
    }
    
    try {
      const res = await fetch('/api/user/gmail-status', { credentials: 'include' });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setIsGmailConnected(data.connected);
      setGmailEmail(data.email || '');
    } catch (e) {
      // Silently handle backend not available - don't log errors in production
      if (process.env.NODE_ENV === 'development') {
        console.log('Backend not available, Gmail status check skipped');
      }
      setIsGmailConnected(false);
      setGmailEmail('');
    } finally {
      if (isManualRefresh) {
        setLoading(false);
      } else {
        setInitialLoading(false);
      }
    }
  }, []);

  // Initial load - use cached status
  useEffect(() => {
    checkGmailStatus(false);
  }, [checkGmailStatus]);

  // Background refresh every 5 minutes (silent)
  useEffect(() => {
    const interval = setInterval(() => {
      checkGmailStatus(false);
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [checkGmailStatus]);

  // Manual refresh function
  const refreshGmailStatus = useCallback(() => {
    checkGmailStatus(true);
  }, [checkGmailStatus]);

  return (
    <GmailStatusContext.Provider value={{ 
      isGmailConnected, 
      gmailEmail, 
      loading, 
      initialLoading,
      refreshGmailStatus 
    }}>
      {children}
    </GmailStatusContext.Provider>
  );
}; 