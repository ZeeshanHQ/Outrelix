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
                    className="bg-black w-full max-w-3xl rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden border border-slate-800 relative"
                >
                    <div className="absolute top-0 right-10 w-px h-full bg-slate-900/50 hidden lg:block" />
                    {/* Header */}
                    <div className="px-10 py-8 border-b border-slate-900 flex items-center justify-between bg-black relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl relative group">
                                <div className="absolute inset-0 bg-purple-400 rounded-2xl animate-ping opacity-20" />
                                <Wand2 className="w-7 h-7 relative z-10" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-1 block">
                                    Intelligence Architect
                                </span>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {new URL(analysisData.url).hostname}
                                </h3>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8">
                        {!generatedEmail ? (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        Select Tone Strategy
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['professional', 'casual', 'urgent'].map((tone) => (
                                            <button
                                                key={tone}
                                                onClick={() => setEmailTone(tone)}
                                                className={`py-4 px-4 rounded-2xl text-[10px] uppercase tracking-widest font-black transition-all border ${emailTone === tone
                                                    ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-900/20'
                                                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                                                    }`}
                                            >
                                                {tone}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={generateEmail}
                                    disabled={isGenerating}
                                    className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-4 border border-blue-400/20"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            <span>Simulating Outreach Genius...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-5 h-5 text-blue-200" />
                                            <span>Generate Elite Draft</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-6 relative z-10">
                                    <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 group hover:border-purple-500/20 transition-all">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                            Subject Line
                                            <div className="w-8 h-px bg-slate-800" />
                                        </div>
                                        <div className="font-black text-white text-xl tracking-tight selection:bg-purple-500/30">
                                            {generatedEmail.subject}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 group hover:border-blue-500/20 transition-all">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                            Elite Body Intelligence
                                            <div className="w-8 h-px bg-slate-800" />
                                        </div>
                                        <div className="prose prose-invert prose-sm text-slate-400 max-w-none whitespace-pre-wrap leading-relaxed font-medium selection:bg-blue-500/30">
                                            {generatedEmail.body}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 relative z-10">
                                    {/* Outreach Details (From/To) */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
                                        {/* From Field */}
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 text-[9px] font-black text-slate-500 uppercase tracking-widest">From</div>
                                            <div className="flex-1 px-4 py-3 bg-black border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 flex items-center gap-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                Verified Uplink (noreply@outrelix.ai)
                                            </div>
                                        </div>

                                        {/* To Field */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 text-[9px] font-black text-slate-500 uppercase tracking-widest">Target</div>
                                                <div className="flex-1 flex gap-3">
                                                    {showManualInput ? (
                                                        <input
                                                            type="email"
                                                            value={selectedEmail}
                                                            onChange={(e) => setSelectedEmail(e.target.value)}
                                                            placeholder="Target Email Address..."
                                                            className="flex-1 px-4 py-3 bg-black border border-blue-900/50 focus:border-blue-500 outline-none rounded-xl text-[11px] font-black text-white placeholder:text-slate-700 transition-all"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <select
                                                            value={selectedEmail}
                                                            onChange={(e) => setSelectedEmail(e.target.value)}
                                                            className="flex-1 px-4 py-3 bg-black border border-slate-800 rounded-xl text-[11px] font-black text-white outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                                                        >
                                                            {availableEmails.map(email => (
                                                                <option key={email} value={email}>{email}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    <button
                                                        onClick={() => setShowManualInput(!showManualInput)}
                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        {showManualInput ? 'Direct List' : 'Bypass Selection'}
                                                    </button>
                                                </div>
                                            </div>

                                            {!showManualInput && availableEmails.length > 0 && (
                                                <div className="flex flex-wrap gap-2 ml-14">
                                                    {availableEmails.slice(0, 5).map((email) => (
                                                        <button
                                                            key={email}
                                                            onClick={() => setSelectedEmail(email)}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${selectedEmail === email
                                                                ? 'bg-blue-600 text-white border-blue-500'
                                                                : 'bg-black text-slate-600 border-slate-800 hover:border-slate-700'
                                                                }`}
                                                        >
                                                            {email}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.01, y: -2 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={handleSend}
                                            disabled={isSending || isSent}
                                            className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all border ${isSent
                                                ? 'bg-emerald-600 text-white border-emerald-500'
                                                : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
                                                }`}
                                        >
                                            {isSending ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Uplink Active...</span>
                                                </>
                                            ) : isSent ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span>Mission Dispatched</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    <span>Initiate Direct Send</span>
                                                </>
                                            )}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.01, y: -2 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={copyToClipboard}
                                            className="px-8 py-5 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Copy className="w-4 h-4 text-blue-400" />
                                            Copy
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.01, y: -2 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={generateEmail}
                                            className="p-5 bg-black border border-slate-800 rounded-2xl text-slate-600 hover:text-white hover:border-blue-500/50 transition-all flex items-center justify-center"
                                        >
                                            <RefreshCw className="w-5 h-5" />
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
