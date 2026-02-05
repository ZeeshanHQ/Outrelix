import React from 'react';
import Footer from '../components/Footer';

const TermsOfService = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <main className="flex-1 max-w-4xl mx-auto px-6 py-20">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
                        Terms of Service
                    </h1>

                    <div className="space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-green-500 pl-4 uppercase tracking-wider text-sm">1. Acceptance of Terms</h2>
                            <p>
                                By using Outrelix, you agree to be bound by these Terms of Service. Our platform provides automated email outreach and lead generation tools. If you use our services on behalf of an organization, you represent that you have the authority to bind that organization to these terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-green-500 pl-4 uppercase tracking-wider text-sm">2. Use of Services</h2>
                            <p>You agree to use Outrelix only for lawful purposes. Prohibited activities include:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Sending unsolicited bulk emails (Spam) in violation of CAN-SPAM or GDPR.</li>
                                <li>Attempting to reverse engineer or disrupt the service's infrastructure.</li>
                                <li>Using the lead generation tools to scrape sensitive or prohibited information.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-green-500 pl-4 uppercase tracking-wider text-sm">3. Account Responsibility</h2>
                            <p>
                                You are responsible for maintaining the security of your account and any connected Google or Facebook accounts. Outrelix is not liable for any loss or damage arising from your failure to protect your login credentials.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-green-500 pl-4 uppercase tracking-wider text-sm">4. Subscription & Payments</h2>
                            <p>
                                Payments for premium plans are processed securely. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. Refunds are handled on a case-by-case basis according to our refund policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-l-4 border-green-500 pl-4 uppercase tracking-wider text-sm">5. Limitation of Liability</h2>
                            <p>
                                Outrelix provides the platform "as is." To the fullest extent permitted by law, Outrelix shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.
                            </p>
                        </section>

                        <section className="pt-10 border-t border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Questions?</h2>
                            <p>If you have any questions regarding these Terms, please contact us:</p>
                            <a
                                href="mailto:support@astraventa.online"
                                className="inline-block mt-4 text-xl font-bold text-green-600 dark:text-green-400 hover:underline"
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

export default TermsOfService;
