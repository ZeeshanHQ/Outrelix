import React from 'react';
import Footer from '../components/Footer';

const PrivacyPolicy = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Pacifico, cursive' }}>
        Privacy Policy
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6 text-gray-700 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p>Welcome to Outrelix. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">2. Data We Collect</h2>
          <ul className="list-disc pl-6">
            <li>Email address and basic profile information (from Google, Facebook, etc.)</li>
            <li>Usage data (such as campaign activity and preferences)</li>
            <li>Any information you provide through forms or support requests</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6">
            <li>To provide and improve our email outreach services</li>
            <li>To personalize your experience and campaigns</li>
            <li>To communicate with you about updates, support, and offers</li>
            <li>To ensure security and prevent abuse</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Data Sharing</h2>
          <p>We do not sell or share your personal data with third parties except as required by law or to provide our core services (such as authentication providers).</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">5. Data Security</h2>
          <p>We use industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Your Rights</h2>
          <ul className="list-disc pl-6">
            <li>You can request access to or deletion of your data at any time</li>
            <li>You can update your information in your account settings</li>
            <li>Contact us for any privacy-related requests</li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">7. Contact</h2>
          <p>If you have any questions or requests regarding your privacy, please contact us at <a href="mailto:support@astraventa.online" className="text-primary-600 underline">support@astraventa.online</a>.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy; 