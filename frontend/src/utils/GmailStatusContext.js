import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import BACKEND_URL from '../config/backend';
import backendManager from './BackendManager';
import { supabase } from '../supabase';

const GmailStatusContext = createContext();

export const useGmailStatus = () => useContext(GmailStatusContext);

export const GmailStatusProvider = ({ children }) => {
  const [isGmailConnected, setIsGmailConnected] = useState(() => {
    const cached = localStorage.getItem('isGmailConnected');
    return cached === 'true' ? true : cached === 'false' ? false : null;
  });
  const [gmailEmail, setGmailEmail] = useState(localStorage.getItem('gmailEmail') || '');
  const [isValid, setIsValid] = useState(localStorage.getItem('isGmailValid') === 'true');
  const [needsReauth, setNeedsReauth] = useState(localStorage.getItem('needsGmailReauth') === 'true');
  const [loading, setLoading] = useState(false); // Only true during manual refresh
  const [initialLoading, setInitialLoading] = useState(!localStorage.getItem('isGmailConnected')); // Only show skeleton if no cache

  const checkGmailStatus = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setLoading(true);
    } else if (!localStorage.getItem('isGmailConnected')) {
      // Only show initial loading if we don't have anything cached
      setInitialLoading(true);
    }

    try {
      // Get the Supabase session token for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log(`[GmailStatus] Found session for ${session.user.email}, attaching token...`);
      } else {
        console.log(`[GmailStatus] No session found, request will likely fail auth`);
      }

      const authHeaders = session?.access_token
        ? { 'Authorization': `Bearer ${session.access_token}` }
        : {};

      const res = await backendManager.fetchWithWakeUp(`${BACKEND_URL}/api/user/gmail-status`, {
        credentials: 'include',
        headers: { ...authHeaders }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setIsGmailConnected(data.connected);
      setGmailEmail(data.email || '');
      setIsValid(data.isValid || false);
      setNeedsReauth(data.needsReauth || false);

      // Cache the results
      localStorage.setItem('isGmailConnected', data.connected.toString());
      localStorage.setItem('isGmailValid', (data.isValid || false).toString());
      localStorage.setItem('needsGmailReauth', (data.needsReauth || false).toString());
      if (data.email) localStorage.setItem('gmailEmail', data.email);
      else localStorage.removeItem('gmailEmail');
    } catch (e) {
      // Silently handle backend not available - don't log errors in production
      if (process.env.NODE_ENV === 'development') {
        console.log('Backend not available or Auth failed, Gmail status check skipped:', e.message);
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

  // Manual refresh function
  const refreshGmailStatus = useCallback(() => {
    checkGmailStatus(true);
  }, [checkGmailStatus]);

  // Initial load AND listen for auth changes
  useEffect(() => {
    // Initial check
    checkGmailStatus(false);

    // Listen for auth changes to re-check status (e.g. after login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        console.log(`[GmailStatus] Auth event: ${event}, refreshing status...`);
        checkGmailStatus(false);
      }
    });

    // Listen for account switches (from App.jsx syncing localStorage)
    const handleUserUpdated = () => {
      console.log('[GmailStatus] User updated event received, re-checking connectivity...');
      checkGmailStatus(false);
    };
    window.addEventListener('user-updated', handleUserUpdated);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('user-updated', handleUserUpdated);
    };
  }, [checkGmailStatus]);

  // Background refresh every 5 minutes (silent)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isGmailConnected || isGmailConnected === null) {
        checkGmailStatus(false);
      }
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [checkGmailStatus, isGmailConnected]);

  return (
    <GmailStatusContext.Provider value={{
      isGmailConnected,
      gmailEmail,
      isValid,
      needsReauth,
      loading,
      initialLoading,
      refreshGmailStatus
    }}>
      {children}
    </GmailStatusContext.Provider>
  );
};