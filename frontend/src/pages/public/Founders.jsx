import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Building, Zap, Rocket, Users, Shield, TrendingUp } from 'lucide-react';

export default function Founders() {
    return (
        <ProductLandingLayout
            badgeText="For Startup Founders"
            titleHighlight="Zero to One."
            titleSuffix="Automated."
            description="You don't have the budget for a 5-person sales team. Outrelix acts as your full-stack AI growth engine, finding your early adopters and booking founder-led sales calls automatically."
            primaryCtaText="Automate Your Growth"
            secondaryCtaText="See Founder Stories"
            stats={[
                { value: "10x", label: "Faster Go-To-Market" },
                { value: "$0", label: "SDR Salaries" },
                { value: "24/7", label: "Prospecting" },
                { value: "10M+", label: "Startup Leads" }
            ]}
            painPoints={{
                title: "Why Early-Stage Startups Fail to Scale",
                items: [
                    {
                        problem: "Founder Time Constraints",
                        problemDesc: "You are the CEO, the product manager, and the only salesperson. You have 2 hours a week for outbound sales.",
                        solution: "Your AI Co-Founder",
                        solutionDesc: "Outrelix prospects, writes, and follows up 24/7. You simply wake up, check your calendar, and close the deals."
                    },
                    {
                        problem: "Premature Scaling",
                        problemDesc: "Hiring a VP of Sales and 2 SDRs before you have Product-Market Fit drains your runway in 6 months.",
                        solution: "Zero Headcount Growth",
                        solutionDesc: "Test 10 different target demographics and value props simultaneously to find PMF without hiring a single employee."
                    },
                    {
                        problem: "Expensive Data Subscriptions",
                        problemDesc: "Apollo, ZoomInfo, and LinkedIn Nav cost thousands of dollars a year—money the startup needs for engineering.",
                        solution: "All-in-One Platform",
                        solutionDesc: "Data extraction, email sequencing, and inbox warming are all included in a single, startup-friendly subscription."
                    }
                ]
            }}
            features={[
                { icon: Rocket, title: "Early Adopter Scraping", description: "Find founders, decision makers, and innovators who recently got funded and need your solution today." },
                { icon: Zap, title: "Rapid A/B Testing", description: "Simultaneously run 5 different campaigns to 5 different industries to scientifically prove your Product-Market Fit." },
                { icon: Building, title: "Investor Outreach", description: "Scrape directories for Angel Investors and VCs who invest in your specific niche, and automate funding outreach." },
                { icon: Users, title: "Founder-Led Voice", description: "Train the AI to write exactly like you do—authentic, passionate, and direct—resulting in massive reply rates." },
                { icon: Shield, title: "Domain Protection", description: "We provide and warmup secondary domains so you never risk your core startup domain getting blacklisted." },
                { icon: TrendingUp, title: "Scalable Infrastructure", description: "Start with 100 emails a day as a solo founder, and scale to 100,000 a day when you raise your Series A, seamlessly." }
            ]}
        />
    );
}
