import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Search, BarChart2, Globe, TrendingUp, Zap, Target } from 'lucide-react';

export default function SEOAnalytics() {
    return (
        <ProductLandingLayout
            badgeText="The Visibility Engine"
            titleHighlight="SEO Analytics"
            titleSuffix="for B2B Dominance."
            description="Don't guess what your buyers are searching for. Outrelix's AI analyzes search intent, competitor backlink profiles, and content gaps to generate a predictable roadmap to page one."
            primaryCtaText="Analyze Your SEO"
            secondaryCtaText="See How It Works"
            stats={[
                { value: "No. 1", label: "Ranking AI" },
                { value: "Millions", label: "Keywords Tracked" },
                { value: "0", label: "Guesswork" },
                { value: "100%", label: "Data Backed" }
            ]}
            painPoints={{
                title: "Why Traditional SEO Fails",
                items: [
                    {
                        problem: "Writing Blindly",
                        problemDesc: "You write 10 blog posts a month hoping one sticks. Six months later, you have 200 visitors and 0 leads.",
                        solution: "AI Content Strategy",
                        solutionDesc: "Our engine tells you exactly what topics your buyers are searching right now, the exact word count required, and the semantic keywords needed to outrank competitors."
                    },
                    {
                        problem: "Ignoring Search Intent",
                        problemDesc: "Ranking #1 for an informational keyword that drives zero revenue is a vanity metric.",
                        solution: "Commercial Intent Tracking",
                        solutionDesc: "Outrelix maps keywords strictly to their revenue-generation potential, ensuring you only spend resources on traffic that actually buys."
                    },
                    {
                        problem: "Reactive Technical Fixes",
                        problemDesc: "Your traffic drops overnight because of a core update and you have no idea why until a month later.",
                        solution: "Real-time Auditing",
                        solutionDesc: "Continuous crawling of your architecture alerts you to broken links, canonical errors, and indexation issues the second they happen."
                    }
                ]
            }}
            features={[
                { icon: Search, title: "Keyword Gap Analysis", description: "Instantly see the exact keywords driving sales for your top 3 competitors that you currently don't rank for." },
                { icon: Globe, title: "Backlink Intelligence", description: "Audit competitor link profiles to find high-authority domains that are practically guaranteed to link to your content." },
                { icon: Zap, title: "Content Brief Generator", description: "The AI builds comprehensive outlines for your writers featuring optimal headers, FAQs, and semantic term clustering." },
                { icon: BarChart2, title: "Rank Tracking", description: "Monitor your positions daily across global and local search results, receiving instant alerts for significant movements." },
                { icon: Target, title: "Intent Classification", description: "Automatically sort terms into Informational, Navigational, or Transactional buckets to align content strategy." },
                { icon: TrendingUp, title: "ROI Forecasting", description: "Project the exact revenue impact of ranking on page one for specific terms based on your average deal size." }
            ]}
        />
    );
}
