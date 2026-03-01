import React from 'react';
import { Shield, Lock, Eye, FileText, Info } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-white min-h-screen relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />

      <main className="max-w-4xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Last Updated: February 2026</p>
        </div>

        {/* Content Card */}
        <div className="space-y-16 text-slate-600 leading-relaxed">

          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">1. Introduction</h2>
            </div>
            <p className="text-lg leading-relaxed">
              At Outrelix, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you use our neural outreach engine and related services.
            </p>
          </section>

          <section className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -z-10" />
            <div className="flex items-start gap-4 mb-6">
              <Shield className="w-8 h-8 text-blue-400 shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-2">Google API Disclosure</h2>
                <p className="text-slate-400 leading-relaxed">
                  Outrelix's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold underline hover:text-blue-300">Google API Services User Data Policy</a>, including the Limited Use requirements.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Eye className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">2. Data We Collect</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-900 mb-2">Account Information</h3>
                <p className="text-sm">Name, professional email, company details, and encrypted authentication credentials.</p>
              </div>
              <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-900 mb-2">Connected Accounts</h3>
                <p className="text-sm">Metadata for Gmail/Outlook integration and CRM sync to power neural personalization.</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">3. How We Use Information</h2>
            </div>
            <ul className="space-y-4">
              {[
                'Developing and training our proprietary neural outreach models.',
                'Processing high-volume outreach sequences with machine precision.',
                'Providing real-time analytics and predictive performance reporting.',
                'Securing our infrastructure against fraudulent or malicious activities.'
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400">{i + 1}</span>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pt-16 border-t border-slate-100 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Contact Privacy Team</h2>
            <p className="text-slate-500 mb-8">For any legal or privacy inquiries, reach our dedicated security officer.</p>
            <a href="mailto:privacy@outrelix.com" className="text-2xl font-black text-blue-600 hover:text-blue-700 transition-colors">
              privacy@outrelix.com
            </a>
          </section>

        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;