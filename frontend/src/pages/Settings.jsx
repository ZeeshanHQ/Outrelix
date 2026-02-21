import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Camera,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  LogOut,
  Trash2,
  Bell,
  PenTool,
  Loader2,
  QrCode
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { supabase, storage, mfa } from '../supabase';

const Settings = () => {
  const [user, setUser] = useState({
    id: '',
    name: 'Zeeshan Jay',
    email: 'zeeshan@outrelix.com',
    avatar: null,
    plan: 'Pro Account'
  });

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  const [emailFlow, setEmailFlow] = useState('ideal'); // ideal, enter_new, verify_otp
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [passFlow, setPassFlow] = useState('ideal'); // ideal, changing
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });

  // 2FA State
  const [mfaData, setMfaData] = useState({
    qrCode: '',
    secret: '',
    factorId: '',
    challengeId: '',
    verifying: false,
    code: '',
    enabled: false
  });
  const [mfaModal, setMfaModal] = useState(false);

  // Load actual user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (sbUser) {
        setUser(prev => ({
          ...prev,
          id: sbUser.id,
          name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || prev.name,
          email: sbUser.email || prev.email,
          avatar: sbUser.user_metadata?.avatar_url || prev.avatar
        }));
        setTempName(sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || prev.name);

        // Check if MFA is fully enabled (verified)
        const { data: factors } = await mfa.listFactors();
        const isVerified = factors?.all?.some(f => f.status === 'verified');
        if (isVerified) {
          setMfaData(prev => ({ ...prev, enabled: true }));
        }
      }
    };
    fetchUser();
  }, []);

  const handleUpdateName = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: tempName }
    });

    if (error) {
      toast.error(error.message);
    } else {
      setUser(prev => ({ ...prev, name: tempName }));
      setIsEditingName(false);
      toast.success('Name updated successfully');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const { url, error } = await storage.uploadAvatar(user.id, file);
      if (error) throw error;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: url }
      });
      if (updateError) throw updateError;

      setUser(prev => ({ ...prev, avatar: url }));
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error('Failed to upload image: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMfaEnroll = async () => {
    try {
      // Cleanup any existing factors (especially unverified ones) to avoid "already exists" error
      const { data: factors } = await mfa.listFactors();
      if (factors?.all?.length > 0) {
        for (const factor of factors.all) {
          await mfa.unenroll(factor.id);
        }
      }

      const { data, error } = await mfa.enroll();
      if (error) throw error;

      setMfaData(prev => ({
        ...prev,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id
      }));
      setMfaModal(true);
    } catch (err) {
      toast.error('MFA Enrollment failed: ' + err.message);
    }
  };

  const handleMfaVerify = async () => {
    setMfaData(prev => ({ ...prev, verifying: true }));
    try {
      // 1. Create Challenge
      const { data: challenge, error: cErr } = await mfa.challenge(mfaData.factorId);
      if (cErr) throw cErr;

      // 2. Verify Code
      const { error: vErr } = await mfa.verify(mfaData.factorId, challenge.id, mfaData.code);
      if (vErr) throw vErr;

      setMfaData(prev => ({ ...prev, enabled: true, verifying: false }));
      setMfaModal(false);
      toast.success('Two-Factor Authentication enabled!');
    } catch (err) {
      // Important: On error, do NOT set enabled to true.
      setMfaData(prev => ({ ...prev, verifying: false }));
      toast.error('Verification failed: ' + err.message);
    }
  };

  const handleEmailStep1 = () => {
    if (!newEmail.includes('@')) {
      toast.error('Invalid email address');
      return;
    }
    setEmailFlow('verify_otp');
    toast.info('OTP sent to ' + user.email);
  };

  const handleVerifyOtp = () => {
    if (otp === '1234') { // Mock verification
      setUser(prev => ({ ...prev, email: newEmail }));
      setEmailFlow('ideal');
      setNewEmail('');
      setOtp('');
      toast.success('Email updated successfully');
    } else {
      toast.error('Invalid OTP code');
    }
  };

  const handleChangePassword = () => {
    if (passData.new !== passData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setPassFlow('ideal');
    setPassData({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="min-h-screen bg-white font-['Outfit']">
      <DashboardHeader showGreeting={false} title="Account Settings" />

      <main className="max-w-4xl mx-auto p-8 lg:p-12 pb-24">

        {/* 1. Profile Section */}
        <section className="mb-16">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <div
                onClick={handleImageClick}
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-blue-400 transition-all cursor-pointer relative"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase">Saving</span>
                  </div>
                ) : user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition-colors" />
                )}

                {!isUploading && (
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 outline-none w-full max-w-sm py-1 bg-transparent"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                    <CheckCircle className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 group">
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{user.name}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-100">
                  {user.plan}
                </span>
                <span className="text-slate-400 text-sm font-medium ml-2">Member since Feb 2026</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* 2. Security & Credentials */}
          <div className="space-y-12">

            {/* Email Management */}
            <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Email Address</h3>
              </div>

              <AnimatePresence mode="wait">
                {emailFlow === 'ideal' && (
                  <motion.div key="ideal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-sm text-slate-500 mb-6">Your current email is <span className="text-slate-900 font-semibold">{user.email}</span></p>
                    <button
                      onClick={() => setEmailFlow('enter_new')}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                    >
                      Change Email <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {emailFlow === 'enter_new' && (
                  <motion.div key="new" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="space-y-4">
                      <input
                        type="email"
                        placeholder="Enter new email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleEmailStep1} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">Send OTP</button>
                        <button onClick={() => setEmailFlow('ideal')} className="px-4 py-3 text-slate-400 font-bold text-sm">Cancel</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {emailFlow === 'verify_otp' && (
                  <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-700 font-medium">Please enter the 4-digit code sent to your old email for security.</p>
                      </div>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center tracking-[1em] text-xl font-bold py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                      />
                      <button onClick={handleVerifyOtp} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">Verify & Change</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Password Management */}
            <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Password</h3>
              </div>

              <AnimatePresence mode="wait">
                {passFlow === 'ideal' && (
                  <motion.div key="p-ideal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-sm text-slate-500 mb-6">Update your password to keep your account safe.</p>
                    <button
                      onClick={() => setPassFlow('changing')}
                      className="text-sm font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
                    >
                      Update Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {passFlow === 'changing' && (
                  <motion.div key="p-changing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passData.old}
                      onChange={(e) => setPassData({ ...passData, old: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passData.new}
                      onChange={(e) => setPassData({ ...passData, new: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passData.confirm}
                      onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleChangePassword} className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all">Save Changes</button>
                      <button onClick={() => setPassFlow('ideal')} className="px-4 py-3 text-slate-400 font-bold text-sm">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 3. Account Actions & Preferences */}
          <div className="space-y-12">

            {/* Account Preferences (2FA) */}
            <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Account Control</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication</h4>
                    <p className="text-[11px] font-medium text-slate-400">Add an extra layer of security.</p>
                  </div>
                  <button
                    onClick={() => !mfaData.enabled && handleMfaEnroll()}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mfaData.enabled
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                      }`}
                  >
                    {mfaData.enabled ? 'Enabled' : 'Turn On'}
                  </button>
                </div>

                <div className="flex items-center justify-between group">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Newsletter Subscription</h4>
                    <p className="text-[11px] font-medium text-slate-400">Receive weekly AI marketing tips.</p>
                  </div>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter placeholder */}
            <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50/30 flex flex-col items-center text-center">
              <Bell className="w-8 h-8 text-slate-300 mb-4" />
              <h4 className="text-sm font-bold text-slate-800">App Notifications</h4>
              <p className="text-xs text-slate-400 mt-2">Manage how you receive alerts about your automation runs and campaigns.</p>
            </div>

          </div>
        </div>

      </main>

      {/* MFA Modal */}
      <AnimatePresence>
        {mfaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMfaModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <QrCode className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Setup 2FA</h3>
                    <p className="text-xs font-medium text-slate-400">Scan this code in Google Authenticator</p>
                  </div>
                </div>

                <div className="flex justify-center mb-8 p-6 bg-white border-2 border-slate-50 rounded-2xl">
                  {mfaData.qrCode ? (
                    <img src={mfaData.qrCode} alt="MFA QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-slate-50 animate-pulse rounded-lg" />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Verification Code</label>
                    <input
                      type="text"
                      placeholder="000 000"
                      value={mfaData.code}
                      onChange={(e) => setMfaData({ ...mfaData, code: e.target.value })}
                      className="w-full text-center tracking-[0.5em] text-2xl font-bold py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleMfaVerify}
                    disabled={mfaData.verifying || mfaData.code.length < 6}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    {mfaData.verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
                  </button>
                  <button
                    onClick={() => setMfaModal(false)}
                    className="w-full text-slate-400 py-2 text-xs font-bold hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;