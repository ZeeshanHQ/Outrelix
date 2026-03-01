import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Target, TrendingUp, Users, BarChart, Rocket, ShieldCheck } from 'lucide-react';

export default function SuccessStories() {
    return (
        <ProductLandingLayout
            badgeText="The Growth Protocol"
            titleHighlight="Success Stories"
            titleSuffix="& Revenue Wins."
            description="See exactly how elite go-to-market teams are using Outrelix to automate their outbound pipeline and scale revenue 5x faster than traditional SDR models."
            primaryCtaText="Start Your Growth Story"
            secondaryCtaText="Read All Case Studies"
            stats={[
                { value: "$4.1B+", label: "Pipeline Generated" },
                { value: "850+", label: "Startups Scaled" },
                { value: "70%", label: "Faster Sales Cycles" },
                { value: "0", label: "SDRs Hired" }
            ]}
            painPoints={{
                title: "How Outrelix Transforms Outbound",
                items: [
                    {
                        problem: "Agency X: Relying on Stale Data",
                        problemDesc: "Paid $24k/year for a ZoomInfo subscription, but 30% of their emails hard-bounced because the demographic data was 6 months old.",
                        solution: "Real-time AI Extraction",
                        solutionDesc: "Switched to Outrelix and pulled 5,000 live contacts. Deliverability rose to 99.8% and reply rates tripled overnight."
                    },
                    {
                        problem: "SaaS Y: Slow Personalization",
                        problemDesc: "SDRs spent 3 hours a day researching prospects to write 20 generic emails. Pipeline generation was stagnant.",
                        solution: "Hyper-Personalization at Scale",
                        solutionDesc: "Outrelix AI now generates 100% unique, heavily researched emails for 1,000 prospects daily without a human touching the keyboard."
                    },
                    {
                        problem: "Founder Z: No Time for Sales",
                        problemDesc: "As a solo founder, they couldn't balance building the product and finding their first 100 enterprise pilots.",
                        solution: "The Virtual Co-Founder",
                        solutionDesc: "Outrelix functioned as a full-stack AI growth engine, securing 12 enterprise pilot meetings in the first 30 days."
                    }
                ]
            }}
            features={[
                { icon: TrendingUp, title: "Enterprise Growth", description: "Read how a publicly traded logistics company used Outrelix to align their entire global sales force under one automated AI playbook." },
                { icon: Target, title: "Agency Pipeline", description: "Discover how a marketing agency reduced their lead acquisition cost by 84% by firing their lead generation vendor and using our engine." },
                { icon: Rocket, title: "Startup Acceleration", description: "See the exact outbound campaigns a Y-Combinator startup used to secure their Series A through automated investor outreach." },
                { icon: Users, title: "Sales Team Alignment", description: "Learn how a VP of Sales synchronized messaging across 50 Account Executives using our Brand Intelligence module." },
                { icon: BarChart, title: "Predictable Revenue", description: "Examine the mathematical models our top clients use to predict their quarterly recurring revenue based purely on Outrelix campaign volume." },
                { icon: ShieldCheck, title: "Compliance Safegaurds", description: "Read how elite healthcare companies utilize our HIPAA and GDPR compliant extraction methods to scale safely." }
            ]}
        />
    );
}
