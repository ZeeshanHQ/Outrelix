import React from 'react';
import Footer from '../components/Footer';

const DataDeletion = () => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Pacifico, cursive' }}>
        Data Deletion Instructions
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6 text-gray-700 dark:text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-2">How to Request Data Deletion</h2>
          <p>Your privacy is important to us. If you wish to delete your account and all associated data from Outrelix, please follow these steps:</p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>Send an email to <a href="mailto:support@astraventa.online" className="text-primary-600 underline">support@astraventa.online</a> with the subject line: <strong>Data Deletion Request</strong>.</li>
            <li>In your email, include the email address you used to sign up or log in to our service.</li>
            <li>We will process your request and delete your data from our systems within 7 days.</li>
            <li>You will receive a confirmation email once your data has been deleted.</li>
          </ol>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-2">Contact</h2>
          <p>If you have any questions or concerns about data deletion, please contact us at <a href="mailto:support@astraventa.online" className="text-primary-600 underline">support@astraventa.online</a>.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default DataDeletion; 