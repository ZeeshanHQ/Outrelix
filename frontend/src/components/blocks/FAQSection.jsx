import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";

const faqs = [
    {
        question: "How accurate is the lead data?",
        answer: "Our AI extraction engine maintains a 99.8% accuracy rate by cross-referencing data from 10+ sources and performing real-time email verification before delivery."
    },
    {
        question: "Do I need technical skills to use Outrelix?",
        answer: "Not at all. Outrelix is designed for anyone to use. Our intuitive interface guides you through the process, and our AI handles the complex parts like scraping and personalization."
    },
    {
        question: "How many leads can I scrape per day?",
        answer: "This depends on your plan. The Pro plan allows up to 5,000 emails per month, while the Power plan offers up to 15,000. Each plan is designed to scale with your growth needs."
    },
    {
        question: "Can I connect my own Gmail account?",
        answer: "Yes, you can easily connect your Gmail or Workspace accounts via secure OAuth. Outrelix will then send personalized emails directly through your own inbox for maximum deliverability."
    },
    {
        question: "Is there a free trial?",
        answer: "We offer a 14-day free trial on all plans so you can experience the power of Outrelix lead generation and outreach without any upfront commitment."
    }
];

export default function FAQSection() {
    return (
        <section className="py-32 bg-white" id="faq">
            <div className="max-w-4xl mx-auto px-6 sm:px-8">
                <div className="text-center mb-24">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                        Support
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Everything you need to know about Outrelix and how it can help your business grow on autopilot.
                    </p>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border border-slate-200/60 rounded-2xl px-6 bg-slate-50/30">
                            <AccordionTrigger className="text-left text-base font-bold text-slate-800 hover:no-underline hover:text-blue-600 transition-colors py-5">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-500 text-sm leading-relaxed pb-5 font-medium">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
