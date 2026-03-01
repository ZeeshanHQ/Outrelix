import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Database, Zap, Target, ShieldCheck, Search, Filter } from 'lucide-react';

export default function AILeadScraper() {
    return (
        <ProductLandingLayout
            badgeText="The Extraction Engine"
            titleHighlight="AI Lead Scraper"
            titleSuffix="for B2B Growth."
            description="Stop buying stale lead lists. Our neural scraper extracts up-to-date, highly verified data directly from 50+ business directories, social networks, and corporate domains in real-time."
            primaryCtaText="Start Scraping Free"
            secondaryCtaText="See Pricing"
            stats={[
                { value: "99.8%", label: "Data Accuracy" },
                { value: "50M+", label: "Daily Extractions" },
                { value: "<2s", label: "Verification Time" },
                { value: "100%", label: "GDPR Compliant" }
            ]}
            painPoints={{
                title: "Why Traditional Scraping Fails",
                items: [
                    {
                        problem: "Buying Stale Lead Lists",
                        problemDesc: "Purchased databases decay by 22% every year. You end up emailing people who left their jobs months ago, destroying your domain reputation.",
                        solution: "Real-Time AI Extraction",
                        solutionDesc: "Outrelix pulls live data on-demand. When you hit 'Search', our algorithms scour the web in real-time to find your ideal buyers right now."
                    },
                    {
                        problem: "High Bounce Rates",
                        problemDesc: "Guessing email formats (first.last@company.com) leads to bounces. Bounces lead to spam folders.",
                        solution: "Multi-Step Verification",
                        solutionDesc: "Every email is SMTP-pinged and verified through our 7-step process before it ever reaches your CRM. Zero bounces, guaranteed."
                    },
                    {
                        problem: "Missing Context",
                        problemDesc: "You only get name and email. You have no idea what software they use, when they raised funding, or what they posted yesterday.",
                        solution: "Deep Data Enrichment",
                        solutionDesc: "We append 40+ data points to every lead, including tech stack, recent news, funding rounds, and social activity for perfect personalization."
                    }
                ]
            }}
            features={[
                { icon: Database, title: "Multi-Source Extraction", description: "Simultaneously pull data from LinkedIn, Apollo, Crunchbase, Google Maps, and custom domains with a single query." },
                { icon: Search, title: "Intent Signal Tracking", description: "Identify companies actively researching solutions like yours by tracking hiring trends and technology installations." },
                { icon: Filter, title: "Granular Filtering", description: "Filter by revenue, headcount, technologies used, recent fundraising, job titles, and 50+ other firmographic data points." },
                { icon: Zap, title: "Waterfall Enrichment", description: "If one data provider misses an email, our system automatically cascades through 14 other providers until it finds the match." },
                { icon: ShieldCheck, title: "Bounce-Free Guarantee", description: "Built-in Catch-All validation and SMTP handshakes ensure your sender reputation stays at 100%." },
                { icon: Target, title: "Account-Based Targeting", description: "Upload a list of target domains and let the AI find every relevant decision maker within those specific companies." }
            ]}
        />
    );
}
