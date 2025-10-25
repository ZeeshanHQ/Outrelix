import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useGmailStatus } from '../utils/GmailStatusContext';
import BACKEND_URL from '../config/backend';

const ConnectGmailModal = ({ open, onClose, onConnected, gmailEmail: initialGmailEmail, onSeeCampaign, onGmailConnected }) => {
  const { refreshGmailStatus } = useGmailStatus();
  const [isConnecting, setIsConnecting] = useState(false);
  const [gmailEmail, setGmailEmail] = useState(initialGmailEmail || '');
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (!open) return;
    setIsConnecting(false);
    setSuccess(false);
    setGmailEmail(initialGmailEmail || '');
  }, [open, initialGmailEmail]);

  // Check Gmail status when modal opens
  useEffect(() => {
    if (!open) return;
    
    const checkGmailStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/gmail-status`, { credentials: 'include' });
        const data = await res.json();
        if (data.connected && data.email) {
          setGmailEmail(data.email);
          setSuccess(true);
          // Close modal immediately after successful connection
          if (onConnected) onConnected(data.email);
          if (onGmailConnected) onGmailConnected();
          onClose();
        } else {
          setSuccess(false);
          setGmailEmail('');
        }
      } catch (e) {
        console.error('Error checking Gmail status:', e);
        setSuccess(false);
        setGmailEmail('');
      }
    };

    checkGmailStatus();
  }, [open, onConnected, onGmailConnected, onClose]);

  const handleConnectGmail = () => {
    setIsConnecting(true);
    const popup = window.open('http://localhost:5000/auth/gmail', 'Connect Gmail', 'width=500,height=700');
    if (!popup) {
      alert('Popup blocked! Please allow popups for this site.');
      setIsConnecting(false);
      return;
    }
    
    const timer = setInterval(async () => {
      if (popup.closed) {
        clearInterval(timer);
        // Immediately close modal and fetch Gmail from backend
        let email = '';
        try {
          const res = await fetch(`${BACKEND_URL}/api/user/gmail-status`, { credentials: 'include' });
          const data = await res.json();
          if (data.connected && data.email) {
            email = data.email;
            setGmailEmail(email);
            setSuccess(true);
            if (onConnected) onConnected(email);
            if (onGmailConnected) onGmailConnected();
          }
        } catch (e) {
          setSuccess(false);
        }
        setIsConnecting(false);
        onClose(); // Always close modal immediately after popup closes
      }
    }, 500); // Check more frequently for faster response
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-[200] inset-0 overflow-y-auto font-poppins">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-pink-900/60 backdrop-blur-[6px]" />
        <div className="relative bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl max-w-md w-full p-0 z-10 flex flex-col gap-0 overflow-hidden border border-blue-200 dark:border-blue-900 backdrop-blur-xl ring-4 ring-blue-300/10 focus:outline-none focus:ring-4 focus:ring-blue-400/30 animate-fade-in">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 bg-white/70 dark:bg-gray-800/70 rounded-full p-2 shadow-md z-20 border border-blue-100 dark:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <XMarkIcon className="w-7 h-7" />
          </button>
          <div className="flex flex-col items-center justify-center py-10 px-8">
            {!success ? (
              <>
                <EnvelopeIcon className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-extrabold mb-2 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Connect Your Gmail</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                  <span className="block mb-2 font-semibold text-blue-700 dark:text-blue-200">Why connect your Gmail?</span>
                  We'll use <span className="font-bold text-blue-600 dark:text-blue-300">your Gmail account</span> to send campaign emails directly from <span className="font-bold">your address</span>.<br />
                  <span className="text-green-700 dark:text-green-300 font-semibold">This keeps your outreach personal, improves deliverability, and ensures replies go straight to you.</span><br />
                  <span className="block mt-2 text-xs text-gray-500 dark:text-gray-400">We never see your password. You can disconnect anytime. Your data is private and secure.</span>
                </p>
                <button
                  onClick={handleConnectGmail}
                  disabled={isConnecting}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:brightness-110 transition-all duration-300"
                >
                  <img src="/google-gmail.svg" alt="Gmail" className="w-7 h-7" />
                  {isConnecting ? 'Connecting...' : 'Connect Gmail'}
                </button>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-extrabold mb-2 text-center text-green-600">Gmail Connected!</h2>
                <p className="text-gray-700 dark:text-gray-200 mb-4 text-center">You have successfully connected your Gmail account:</p>
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg mb-4">
                  <img src="/google-gmail.svg" alt="Gmail" className="w-6 h-6" />
                  <span className="font-semibold text-green-700 dark:text-green-200">{gmailEmail}</span>
                </div>
                <p className="text-green-700 dark:text-green-200 font-semibold text-center mb-6">You can now send campaigns from your Gmail!</p>
                <button
                  onClick={() => { 
                    if (onSeeCampaign) onSeeCampaign(); 
                    onClose(); 
                  }}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold text-lg shadow-lg hover:brightness-110 transition-all duration-300"
                >
                  See Campaign
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ConnectGmailModal; 