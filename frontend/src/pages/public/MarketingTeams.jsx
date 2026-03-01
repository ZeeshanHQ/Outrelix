import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Mail, ArrowUpRight, BarChart, Settings, PenTool, Search } from 'lucide-react';

export default function MarketingTeams() {
    return (
        <ProductLandingLayout
            badgeText="For Marketing Teams"
            titleHighlight="Scale Campaigns"
            titleSuffix="Instantly."
            description="Align sales and marketing perfectly. Outrelix gives your marketing team the power to run hyper-targeted, multi-channel outbound campaigns that actually convert to sales-qualified pipeline."
            primaryCtaText="Launch A Campaign"
            secondaryCtaText="See Features"
            stats={[
                { value: "5x", label: "Pipeline Generated" },
                { value: "0", label: "Spam Folders" },
                { value: "100%", label: "Brand Alignment" },
                { value: "1st", label: "Page Ranking" }
            ]}
            painPoints={{
                title: "Why Inbound Marketing Slows Down",
                items: [
                    {
                        problem: "Waiting for Inbound Leads",
                        problemDesc: "Relying purely on SEO and paid ads means waiting months for traffic to materialize and costs to optimize.",
                        solution: "Proactive Outbound Growth",
                        solutionDesc: "Outrelix allows marketing teams to take control of their pipeline by running targeted outbound campaigns at inbound-level quality."
                    },
                    {
                        problem: "Low Lead Quality from Ads",
                        problemDesc: "You generate 500 leads from LinkedIn Ads, but sales rejects 90% of them because they don't fit the strict ICP.",
                        solution: "Hyper-Specific Targeting",
                        solutionDesc: "By scraping B2B data directly based on your exact criteria (revenue, tech stack), 100% of the leads you generate are sales-qualified from day one."
                    },
                    {
                        problem: "Sales Reps Going Rogue",
                        problemDesc: "Marketing writes beautiful messaging, but sales reps ignore it and write their own off-brand templates.",
                        solution: "Centralized Playbooks",
                        solutionDesc: "Marketing controls the AI prompt. The AI generates the emails for the sales team. The brand voice remains completely unified and perfect."
                    }
                ]
            }}
            features={[
                { icon: PenTool, title: "AI Copy Generation", description: "Instantly create entire nurture sequences aligned with your latest product launches and whitepapers." },
                { icon: Mail, title: "Deliverability Armor", description: "Built-in email warmups and rotating domains ensure your marketing emails land in the primary inbox, always." },
                { icon: Search, title: "SEO Gap Analysis", description: "Automatically identify the exact keywords your competitors rank for and generate the content briefs to beat them." },
                { icon: ArrowUpRight, title: "Event Promotion", description: "Scrape the attendee lists of competitor events and run automated sequences inviting them to your own webinars." },
                { icon: Settings, title: "Marketing Automation", description: "Connect Outrelix to HubSpot or Marketo. Automatically enrich incoming inbound leads with 40+ data points before they hit the CRM." },
                { icon: BarChart, title: "Campaign Attribution", description: "Track the exact ROI of your outbound campaigns from first email sent to closed-won revenue." }
            ]}
        />
    );
}
