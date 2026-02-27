'use client';
import React from 'react';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>

          <div className="space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 uppercase tracking-wider text-sm">1. Introduction</h2>
              <p>
                Outrelix ("we," "our," or "us") is dedicated to protecting your privacy. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of your information when you use our website and services. By using Outrelix, you agree to the terms described herein.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 uppercase tracking-wider text-sm">2. Google API Disclosure</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 italic">
                <p>
                  Outrelix's use and transfer to any other app of information received from Google APIs will adhere to
                  <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 font-bold hover:underline mx-1" target="_blank" rel="noopener noreferrer">
                    Google API Services User Data Policy
                  </a>,
                  including the Limited Use requirements.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 uppercase tracking-wider text-sm">3. Data Collection</h2>
              <p>We collect information you provide directly, such as when you create an account, connect your Gmail, or use our lead generation tools. This includes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Account Information:</strong> Name, email address, password, and country.</li>
                <li><strong>Connected Accounts:</strong> Metadata related to your connected Gmail/Facebook accounts for automation purposes.</li>
                <li><strong>Usage Data:</strong> Search queries, campaign statistics, and interaction logs within the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 uppercase tracking-wider text-sm">4. Use of Information</h2>
              <p>Your data is used to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Develop, operate, and improve our AI-driven outreach features.</li>
                <li>Process transactions and send related information (notifications, confirmations).</li>
                <li>Respond to support requests and improve user experience.</li>
                <li>Prevent fraudulent activities and ensure compliance with our terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 uppercase tracking-wider text-sm">5. Data Sharing & Security</h2>
              <p>
                We do not sell your personal information. We only share data with service providers (like Supabase for auth) as necessary to provide our service. We implement industry-leading encryption and security protocols to protect your data from unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 uppercase tracking-wider text-sm">6. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal data. You may export your lead data or disconnect your external accounts at any time through the dashboard settings.
              </p>
            </section>

            <section className="pt-10 border-t border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Contact Us</h2>
              <p>For any privacy-related inquiries, please reach out to our support team:</p>
              <a
                href="mailto:support@astraventa.online"
                className="inline-block mt-4 text-xl font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@astraventa.online
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;