import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Shield, BarChart4, Compass, MessageSquare, Anchor, TrendingUp } from 'lucide-react';

export default function BrandIntelligence() {
    return (
        <ProductLandingLayout
            badgeText="The Intelligence Protocol"
            titleHighlight="Brand Intelligence"
            titleSuffix="for Market Dominance."
            description="Stop guessing what your market wants. Outrelix's AI analyzes millions of social signals, competitor campaigns, and industry trends to give you actionable brand clarity."
            primaryCtaText="Analyze Your Brand"
            secondaryCtaText="See How It Works"
            stats={[
                { value: "45+", label: "Social Networks Analyzed" },
                { value: "Live", label: "Sentiment Tracking" },
                { value: "10x", label: "Faster Market Research" },
                { value: "100%", label: "Data Backed" }
            ]}
            painPoints={{
                title: "Why Brand Strategy Fails",
                items: [
                    {
                        problem: "Operating in an Echo Chamber",
                        problemDesc: "You create messaging based on what you think your product does, not what your audience actually cares about.",
                        solution: "Audience Sentiment Analysis",
                        solutionDesc: "Our AI reads public forums, LinkedIn comments, and Reddit threads to tell you exactly the words your buyers use when complaining about your competitors."
                    },
                    {
                        problem: "Reactive Competitor Tracking",
                        problemDesc: "You only find out a competitor launched a new feature when they steal a deal from you.",
                        solution: "Proactive Market Mapping",
                        solutionDesc: "Outrelix monitors competitor website changes, ad campaigns, and hiring trends in real-time, alerting you the moment they pivot."
                    },
                    {
                        problem: "Inconsistent Messaging",
                        problemDesc: "Sales says one thing, marketing says another. The market is confused and trust is broken.",
                        solution: "Unified Brand Playbooks",
                        solutionDesc: "Generate AI-backed messaging playbooks detailing exact value props, objection handling, and tone guidelines for your entire team to deploy."
                    }
                ]
            }}
            features={[
                { icon: Compass, title: "Market Positioning", description: "Discover the 'white space' in your industry where competitors are weak and buyer demand is high." },
                { icon: Shield, title: "Competitor Tracking", description: "Set up geofences around target accounts and get pinged whenever a competitor engages with them." },
                { icon: MessageSquare, title: "Tone & Voice Calibration", description: "Analyze your highest-converting content to establish a quantifiable brand voice profile for AI writers to emulate." },
                { icon: BarChart4, title: "Share of Voice Analytics", description: "Track your brand mentions across the web versus your top 3 competitors to see who is winning the conversation." },
                { icon: Anchor, title: "Value Prop Generation", description: "Automatically A/B test different value propositions against live market data to find the highest converting angle." },
                { icon: TrendingUp, title: "Trend Forecasting", description: "Spot emerging industry trends before they go mainstream, allowing you to position your product as the leader." }
            ]}
        />
    );
}
