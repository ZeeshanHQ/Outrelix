import React from 'react';
import Footer from '../components/Footer';

const TermsOfService = () => (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 max-w-3xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Pacifico, cursive' }}>
                Terms of Service
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6 text-gray-700 dark:text-gray-200">
                <section>
                    <h2 className="text-2xl font-semibold mb-2">1. Agreement to Terms</h2>
                    <p>By accessing or using Outrelix, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">2. Use of Service</h2>
                    <p>Outrelix provides AI-powered lead generation and email outreach tools. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>You must be at least 18 years old.</li>
                        <li>You agree not to use the service for any illegal or unauthorized purpose.</li>
                        <li>You agree not to violate any laws in your jurisdiction (including but not limited to copyright laws and anti-spam laws like CAN-SPAM).</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">3. User Content</h2>
                    <p>You retain ownership of the data you upload to Outrelix. However, you grant us a license to use, store, and process that data to provide the service to you.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">4. Prohibited Activities</h2>
                    <p>You may not:</p>
                    <ul className="list-disc pl-6 mt-2">
                        <li>Attempt to decompile or reverse engineer any software contained in Outrelix.</li>
                        <li>Use the service to transmit "junk mail", "chain letters", or unsolicited mass mailing or "spamming".</li>
                        <li>Interfere with or disrupt the integrity or performance of the service.</li>
                    </ul>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">5. Termination</h2>
                    <p>We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users or us.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">6. Limitation of Liability</h2>
                    <p>Outrelix shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-semibold mb-2">7. Contact</h2>
                    <p>For any questions regarding these terms, please contact us at <a href="mailto:support@astraventa.online" className="text-primary-600 underline">support@astraventa.online</a>.</p>
                </section>
            </div>
        </main>
        <Footer />
    </div>
);

export default TermsOfService;
