import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  CheckCircleIcon, 
  XMarkIcon, 
  ArrowLeftIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const OTPVerificationModal = ({ 
  isOpen, 
  onClose, 
  email, 
  onVerificationSuccess,
  onResendOTP 
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
      return;
    }

    setIsVerifying(true);
    setAttempts(prev => prev + 1);

    try {
      const response = await fetch(`${BACKEND_URL}/api/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          otp_code: otp,
          purpose: 'email_verification'
        })
      });

      const data = await response.json();

      if (data.valid) {
        toast.success('Email verified successfully!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
        onVerificationSuccess();
      } else {
        toast.error(data.message || 'Invalid verification code', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Verification failed. Please try again.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/otp/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          purpose: 'email_verification'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTimeLeft(600); // Reset timer
        setAttempts(0); // Reset attempts
        setOtp(''); // Clear OTP input
        toast.success('New verification code sent!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      } else {
        toast.error(data.error || 'Failed to resend code', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend code. Please try again.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Verify Your Email
                </h3>
                <p className="text-sm text-gray-500">{email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit verification code
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOTPChange}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
              disabled={isVerifying}
            />
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center mb-6">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className={`text-sm ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`}>
              Code expires in {formatTime(timeLeft)}
            </span>
          </div>

          {/* Attempts Warning */}
          {attempts > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Attempts: {attempts}/{maxAttempts}
                {attempts >= maxAttempts && ' - Please request a new code'}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 inline mr-2" />
              Back
            </button>
            <button
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6 || attempts >= maxAttempts}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify'
              )}
            </button>
          </div>

          {/* Resend Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleResendOTP}
              disabled={isResending || timeLeft > 0}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Check your email for the verification code. It may take a few minutes to arrive.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OTPVerificationModal;
