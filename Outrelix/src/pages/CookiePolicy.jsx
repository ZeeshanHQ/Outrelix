import React from 'react';
import Footer from '../components/Footer';

const CookiePolicy = () => (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Pacifico, cursive' }}>
                Cookie Policy
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6 text-gray-700 dark:text-gray-200">
                <section>
                    <h2 className="text-2xl font-semibold mb-2">1. What Are Cookies</h2>
                    <p>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide info to the owners of the site.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">2. How We Use Cookies</h2>
                    <p>We use cookies for the following purposes:</p>
                    <ul className="list-disc pl-6 mt-2">
                        <li><strong>Authentication:</strong> To identify you when you visit our website and as you navigate our website.</li>
                        <li><strong>Status:</strong> To help us to determine if you are logged into our website.</li>
                        <li><strong>Personalization:</strong> To store information about your preferences and to personalize our website for you.</li>
                        <li><strong>Security:</strong> To protect user accounts, including preventing fraudulent use of login credentials, and to protect our website and services generally.</li>
                        <li><strong>Analysis:</strong> To help us to analyze the use and performance of our website and services.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">3. Managing Cookies</h2>
                    <p>Most browsers allow you to refuse to accept cookies and to delete cookies. The methods for doing so vary from browser to browser, and from version to version. You can obtain up-to-date information about blocking and deleting cookies via these links:</p>
                    <ul className="list-disc pl-6 mt-2 font-mono text-xs">
                        <li>Chrome: https://support.google.com/chrome/answer/95647</li>
                        <li>Firefox: https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences</li>
                        <li>Safari: https://support.apple.com/kb/ph21411</li>
                    </ul>
                    <p className="mt-4">Please note that blocking all cookies will have a negative impact upon the usability of many websites. If you block cookies, you will not be able to use all the features on our website.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">4. Contact Us</h2>
                    <p>If you have any questions about our use of cookies, please contact us at <a href="mailto:support@astraventa.online" className="text-primary-600 underline">support@astraventa.online</a>.</p>
                </section>
            </div>
        </main>
        <Footer />
    </div>
);

export default CookiePolicy;
