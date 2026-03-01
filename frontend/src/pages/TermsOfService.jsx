import React from 'react';
import { Scale, ShieldAlert, BadgeCheck, Gavel, HelpCircle } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="bg-white min-h-screen relative overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-green-50/50 to-transparent -z-10" />

            <main className="max-w-4xl mx-auto px-6 py-24">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                        <Scale className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Terms of Service</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Agreement Version 2.4 | Feb 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-16 text-slate-600 leading-relaxed">

                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                <BadgeCheck className="w-4 h-4 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">1. Acceptance</h2>
                        </div>
                        <p className="text-lg leading-relaxed">
                            By accessing or using Outrelix, you agree to be bound by these legal terms. Our platform provides advanced neural outreach and lead generation services. If you disagree with any part of these terms, you must cease all use of our services immediately.
                        </p>
                    </section>

                    <section className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden">
                        <div className="flex items-start gap-4 mb-6">
                            <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Service Usage Rules</h2>
                                <p className="font-medium text-slate-600">You must use Outrelix only for lawful, ethical outreach. Prohibited actions include:</p>
                                <ul className="mt-4 space-y-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    <li>• Automated spamming prohibited</li>
                                    <li>• No illegal data scraping</li>
                                    <li>• Infrastructure disruption forbidden</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Gavel className="w-4 h-4 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">2. Liability & Warranty</h2>
                        </div>
                        <p className="text-lg mb-6">
                            Outrelix is provided "as is" and "as available." We do not guarantee 100% uptime or success rates for outreach sequences as these depend on external mail server behavior.
                        </p>
                        <div className="p-6 rounded-3xl bg-slate-900 text-white text-xs font-mono uppercase tracking-tighter leading-relaxed">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUTRELIX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES RESULTING FROM THE USE OR INABILITY TO USE THE SERVICE.
                        </div>
                    </section>

                    <section className="pt-16 border-t border-slate-100 text-center">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Legal Support</h2>
                        <p className="text-slate-500 mb-8 flex items-center justify-center gap-2">
                            <HelpCircle className="w-4 h-4" /> Have a question about our legal framework?
                        </p>
                        <a href="mailto:legal@outrelix.com" className="text-2xl font-black text-green-600 hover:text-green-700 transition-colors">
                            legal@outrelix.com
                        </a>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default TermsOfService;
