import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Wand2, Send, CheckCircle2, RefreshCw, Mail, Check } from 'lucide-react';
import { aiApi } from '../utils/supabaseHelpers';
import BACKEND_URL from '../config/backend';
import { toast } from 'react-toastify';

const EmailGenerator = ({ isOpen, onClose, analysisData }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState(null);
    const [emailTone, setEmailTone] = useState('professional'); // 'professional', 'casual', 'urgent'

    // Extract emails from both direct prop and nested metadata
    const availableEmails = [
        ...(analysisData.emails || []),
        ...(analysisData.metadata?.emails || [])
    ].filter((e, i, a) => a.indexOf(e) === i); // Deduplicate

    const [selectedEmail, setSelectedEmail] = useState(availableEmails[0] || '');
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [showManualInput, setShowManualInput] = useState(availableEmails.length === 0);

    React.useEffect(() => {
        if (!generatedEmail) {
            generateEmail();
        }
    }, []);

    const handleSend = async () => {
        if (!selectedEmail) {
            toast.error('Please select an email address');
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/outreach/send-email-resend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    to: selectedEmail,
                    subject: generatedEmail.subject,
                    body: generatedEmail.body
                })
            });

            const data = await response.json();
            if (response.ok) {
                setIsSent(true);
                toast.success('Email sent successfully via Resend!');
                setTimeout(onClose, 2000);
            } else {
                throw new Error(data.error || 'Failed to send');
            }
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsSending(false);
        }
    };

    const generateEmail = async () => {
        setIsGenerating(true);
        setGeneratedEmail(null);

        try {
            const prompt = `
        You are an elite B2B sales copywriter.  
        Write a concise, high-impact cold email to the owner of this website: ${analysisData.url}
        
        Using this analysis data:
        - Executive Summary: "${analysisData.summary}"
        - Key Strategic Improvement Opportunities: ${analysisData.improvement_suggestions.map(i => i.title).join(', ')}

        TONE: ${emailTone.toUpperCase()}
        GOAL: Book a 15-minute discovery call.
        
        RULES:
        1. Subject line must be under 6 words, lowercase, and intriguing (e.g., "question about [company]", "quick idea for [url]").
        2. Opening line must be a specific compliment about their business based on the URL or summary.
        3. The "Pitch" must be: "I noticed [Problem X] and have a fix that could improve [Metric Y]."
        4. Call to Action (CTA) must be soft: "Worth a quick chat?" or "Open to a 5-min review?"
        5. Total length: UNDER 150 words.
        6. NO fluff, NO "I hope this email finds you well."
        7. Return strict JSON format: { "subject": "...", "body": "..." }
      `;

            const response = await aiApi.complete([
                { role: 'system', content: 'You are a world-class sales copywriter.' },
                { role: 'user', content: prompt }
            ], { temperature: 0.7 });

            let emailJson;
            try {
                emailJson = JSON.parse(response);
            } catch (e) {
                // Fallback regex if Llama wraps code
                const match = response.match(/\{[\s\S]*\}/);
                emailJson = match ? JSON.parse(match[0]) : { subject: "Error parsing AI response", body: response };
            }

            setGeneratedEmail(emailJson);
        } catch (error) {
            console.error("Email Gen Error:", error);
            toast.error("Failed to generate email. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedEmail) return;
        const fullText = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
        navigator.clipboard.writeText(fullText);
        toast.success('Email copied to clipboard!');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Wand2 className="w-5 h-5 text-purple-600" />
                                AI Email Architect
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Drafting hyper-personalized outreach for <span className="text-slate-800 font-bold">{new URL(analysisData.url).hostname}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8">
                        {!generatedEmail ? (
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Tone Strategy</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['professional', 'casual', 'urgent'].map((tone) => (
                                            <button
                                                key={tone}
                                                onClick={() => setEmailTone(tone)}
                                                className={`py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all border ${emailTone === tone
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {tone}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={generateEmail}
                                    disabled={isGenerating}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 transition-all flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Crafting Perfect Pitch...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-5 h-5" />
                                            <span>Generate Personalized Email</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 select-none">Subject Line</div>
                                        <div className="font-bold text-slate-800 text-lg select-all selection:bg-purple-100">
                                            {generatedEmail.subject}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 select-none">Email Body</div>
                                        <div className="prose prose-sm text-slate-600 max-w-none whitespace-pre-wrap leading-relaxed select-all selection:bg-purple-100">
                                            {generatedEmail.body}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Outreach Details (From/To) */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                                        {/* From Field */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">From</div>
                                            <div className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                Outrelix System (noreply@cavexa.online)
                                            </div>
                                        </div>

                                        {/* To Field */}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</div>
                                                <div className="flex-1 flex gap-2">
                                                    {showManualInput ? (
                                                        <input
                                                            type="email"
                                                            value={selectedEmail}
                                                            onChange={(e) => setSelectedEmail(e.target.value)}
                                                            placeholder="Enter recipient email..."
                                                            className="flex-1 px-3 py-2 bg-white border border-blue-200 focus:border-blue-400 outline-none rounded-lg text-xs font-bold text-slate-800"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <select
                                                            value={selectedEmail}
                                                            onChange={(e) => setSelectedEmail(e.target.value)}
                                                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                                                        >
                                                            {availableEmails.map(email => (
                                                                <option key={email} value={email}>{email}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    <button
                                                        onClick={() => setShowManualInput(!showManualInput)}
                                                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase transition-all"
                                                    >
                                                        {showManualInput ? 'Saved List' : 'Edit Manually'}
                                                    </button>
                                                </div>
                                            </div>

                                            {!showManualInput && availableEmails.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 ml-14">
                                                    {availableEmails.slice(0, 5).map((email) => (
                                                        <button
                                                            key={email}
                                                            onClick={() => setSelectedEmail(email)}
                                                            className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${selectedEmail === email
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            {email}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSend}
                                            disabled={isSending || isSent}
                                            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all ${isSent
                                                ? 'bg-emerald-500 text-white shadow-emerald-100'
                                                : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                                                }`}
                                        >
                                            {isSending ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : isSent ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span>Message Sent!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    <span>Send One-Click Email</span>
                                                </>
                                            )}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={copyToClipboard}
                                            className="px-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={generateEmail}
                                            className="p-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Helper Icon for sparkels to avoid conflict if not imported (though lucide has Sparkles)
const SparklesIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);

export default EmailGenerator;
