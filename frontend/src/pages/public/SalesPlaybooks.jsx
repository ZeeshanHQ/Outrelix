import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { BookOpen, Target, PenTool, TrendingUp, Zap, BarChart } from 'lucide-react';

export default function SalesPlaybooks() {
    return (
        <ProductLandingLayout
            badgeText="The Strategy Engine"
            titleHighlight="Sales Playbooks"
            titleSuffix="for Elite Teams."
            description="Don't just send emails. Execute multi-million dollar outbound strategies. Outrelix gives you the exact messaging frameworks, sequences, and automation playbooks used by the world's fastest-growing SaaS companies."
            primaryCtaText="Unlock The Playbooks"
            secondaryCtaText="Browse Strategies"
            stats={[
                { value: "50+", label: "Proven Sequences" },
                { value: "4.8x", label: "Higher Conversions" },
                { value: "Daily", label: "Updated Tactics" },
                { value: "100%", label: "Copy-Paste Ready" }
            ]}
            painPoints={{
                title: "Why Most Outbound Campaigns Fail",
                items: [
                    {
                        problem: "Starting from Scratch",
                        problemDesc: "Your SDRs stare at a blank screen trying to figure out what to say. The result is 'Just bubbling this up' emails that get ignored.",
                        solution: "Battle-Tested Templates",
                        solutionDesc: "Instantly import the exact subject lines and call-to-actions that generated $100M+ in pipeline for our enterprise clients."
                    },
                    {
                        problem: "One-Size-Fits-All Messaging",
                        problemDesc: "You send the exact same 3-step sequence to a CEO and a Junior Developer. Both delete it.",
                        solution: "Persona-Specific Routing",
                        solutionDesc: "We provide distinct, dynamic playbooks engineered specifically for Founders, VP of Sales, Engineering Leaders, and more."
                    },
                    {
                        problem: "No Reaction to Buying Signals",
                        problemDesc: "You reach out blindly instead of mapping your sequence to actual market events, wasting your best leads.",
                        solution: "Trigger-Based Campaigns",
                        solutionDesc: "Deploy sequences designed specifically for companies that just raised funding, hired a new executive, or installed a competitor's software."
                    }
                ]
            }}
            features={[
                { icon: BookOpen, title: "The Enterprise Playbook", description: "How to navigate 6-month sales cycles, map complex organizations, and write emails that secure meetings with the C-Suite." },
                { icon: PenTool, title: "Objection Handling Matrix", description: "Pre-written, AI-ready responses for the 10 most common B2B objections: 'Send me info', 'Not right now', and 'We use a competitor'." },
                { icon: Target, title: "Account-Based Marketing", description: "Learn how to surround a single 10,000-employee enterprise with coordinated touches across LinkedIn, Twitter, and Email." },
                { icon: Zap, title: "The Startup Accelerator", description: "A highly aggressive, founder-led outbound strategy designed to secure your first 100 paying customers in 60 days." },
                { icon: TrendingUp, title: "Event Networking", description: "The exact script to use before, during, and after industry conferences to book a calendar full of meetings with attendees." },
                { icon: BarChart, title: "Cold Calling Scripts", description: "Compliment your email automation with proven, high-converting cold call openers and value propositions." }
            ]}
        />
    );
}
