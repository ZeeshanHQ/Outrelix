import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { motion } from 'framer-motion';

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
        <section className="py-48 bg-obsidian-950 relative overflow-hidden" id="faq">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.03),transparent_50%)]" />
            
            <div className="max-w-4xl mx-auto px-6 sm:px-8 relative z-10">
                <div className="text-center mb-32">
                    <span className="text-label-small mb-6 block text-blue-400/80 tracking-[0.3em]">
                        RESOURCES — 04
                    </span>
                    <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-8 leading-tight">
                        Platform <br/>
                        <span className="text-white/40 text-4xl md:text-5xl italic">Knowledge Base.</span>
                    </h2>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-6">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <AccordionItem 
                                value={`item-${index}`} 
                                className="border border-white/5 rounded-[2rem] px-10 bg-obsidian-800/10 hover:bg-obsidian-800/20 hover:border-white/10 transition-all duration-500 overflow-hidden group"
                            >
                                <AccordionTrigger className="text-left text-lg font-bold text-white hover:no-underline transition-colors py-8 group-data-[state=open]:text-blue-400 tracking-tight">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-white/40 text-base leading-relaxed pb-8 font-medium">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        </motion.div>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
