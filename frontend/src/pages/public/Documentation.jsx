import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { FileText, Compass, Command, Terminal, Key, ShieldCheck } from 'lucide-react';

export default function Documentation() {
    return (
        <ProductLandingLayout
            badgeText="The Knowledge Base"
            titleHighlight="Comprehensive Docs"
            titleSuffix="for Outrelix."
            description="Master the Outrelix engine. From connecting your first inbox to building complex, multi-variable AI sequences, our documentation gives you the blueprint to scale your revenue operations."
            primaryCtaText="Read the Docs"
            secondaryCtaText="Search Knowledge Base"
            stats={[
                { value: "200+", label: "Guides & Tutorials" },
                { value: "24/7", label: "Expert Support" },
                { value: "Video", label: "Walkthroughs" },
                { value: "Live", label: "Status Updates" }
            ]}
            painPoints={{
                title: "Launch Faster, Scale Smarter",
                items: [
                    {
                        problem: "Confusing Setup Processes",
                        problemDesc: "Most sales tools take 3 weeks to deploy, requiring an IT team just to configure DNS settings and custom domains.",
                        solution: "5-Minute Onboarding",
                        solutionDesc: "Our documentation walks you step-by-step through Google Workspace/Microsoft 365 integration, so you're sending emails on day one."
                    },
                    {
                        problem: "Underutilizing the AI",
                        problemDesc: "You buy an advanced AI platform but only use it to send generic blasted emails because the prompt engineering is too complex.",
                        solution: "Prompt Mastery",
                        solutionDesc: "Copy and paste our advanced AI variables, spintax structures, and tone modifiers to unlock the full power of hyper-personalization."
                    },
                    {
                        problem: "Deliverability Nightmares",
                        problemDesc: "Your emails start landing in spam and you have no idea why or how to fix the underlying authentication issues.",
                        solution: "Deliverability Diagnostics",
                        solutionDesc: "Read our comprehensive guides on configuring SPF, DKIM, DMARC, and managing IP reputation to stay permanently in the primary inbox."
                    }
                ]
            }}
            features={[
                { icon: Compass, title: "Getting Started", description: "The definitive 10-step guide to setting up your first workspace, integrating your CRM, and launching your first campaign." },
                { icon: Command, title: "AI Variable Syntax", description: "Learn how to use dynamic liquid syntax tags like {{company_recent_news}} to inject real-time data into your outreach." },
                { icon: FileText, title: "Best Practices", description: "Detailed guides on list cleaning, bounce management, and daily sending limits to protect your domain infrastructure." },
                { icon: Terminal, title: "Workflow Automation", description: "How to use Webhooks and Zapier to automatically pause sequences when a lead replies or books a calendar event." },
                { icon: Key, title: "Account Management", description: "Instructions for managing team permissions, adding new SDR seats, and tracking individual user performance." },
                { icon: ShieldCheck, title: "Security & Compliance", description: "Review our data processing agreements, GDPR compliance protocols, and data deletion mechanisms." }
            ]}
        />
    );
}
