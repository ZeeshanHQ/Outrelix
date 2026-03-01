import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Sparkles, History, Bot, PlayCircle, Split, FileText } from 'lucide-react';

export default function OutreachWriter() {
    return (
        <ProductLandingLayout
            badgeText="The Outreach Protocol"
            titleHighlight="Neural Writer"
            titleSuffix="for B2B Sales."
            description="Our AI doesn't just write templates. It reads a prospect's recent funding news, LinkedIn posts, and company changes to instantly generate 1-to-1 personalized emails at scale."
            primaryCtaText="Start Writing Free"
            secondaryCtaText="View Examples"
            stats={[
                { value: "3.2x", label: "Higher Replie Rates" },
                { value: "40+", label: "Data Points Used" },
                { value: "Infinite", label: "Sequence Variations" },
                { value: "Auto", label: "A/B Testing" }
            ]}
            painPoints={{
                title: "Why Cold Outreach Fades",
                items: [
                    {
                        problem: "Generic Templates Fails",
                        problemDesc: "Buyers receive 50+ cold emails a day. They instantly spot {{Company_Name}} macros and hit delete before reading sentence two.",
                        solution: "Deep Context Generation",
                        solutionDesc: "Our AI writes emails referencing specific podcasts they hosted, new hires they made, or recent product launches to grab instant attention."
                    },
                    {
                        problem: "Manual Personalization Takes Hours",
                        problemDesc: "SDRs spend 4 hours a day researching prospects to write 20 good emails. It does not scale.",
                        solution: "Hyper-Personalization at Scale",
                        solutionDesc: "Outrelix processes 5,000 prospects in seconds, writing a completely unique, highly researched email for every single one of them automatically."
                    },
                    {
                        problem: "Guessing What Works",
                        problemDesc: "You rely on gut feeling to write subject lines and calls to action without knowing the data behind them.",
                        solution: "Neural Optimization",
                        solutionDesc: "The engine constantly analyzes reply rates across millions of emails, automatically evolving your copy to maximize conversions."
                    }
                ]
            }}
            features={[
                { icon: Sparkles, title: "Icebreaker Generation", description: "The AI scans a lead's social presence to generate the perfect, natural-sounding opening line that proves you did your research." },
                { icon: History, title: "Automated Follow-ups", description: "Create multi-touch sequences that adapt based on whether the prospect opened, clicked, or ignored the previous email." },
                { icon: Split, title: "Spintax & Variables", description: "Ensure ultimate deliverability by spinning synonyms and sentence structures so no two emails are ever exactly the same." },
                { icon: Bot, title: "Objection Handling", description: "Draft automated AI replies for common objections like 'Not right now' or 'Send me more info', keeping the conversation moving." },
                { icon: PlayCircle, title: "Video & Image Intro", description: "Easily embed dynamic, personalized images and Loom-style videos into your emails to skyrocket reply rates." },
                { icon: FileText, title: "Tone Matching", description: "Instruct the AI to write in a casual, professional, or direct tone to match your specific brand voice." }
            ]}
        />
    );
}
