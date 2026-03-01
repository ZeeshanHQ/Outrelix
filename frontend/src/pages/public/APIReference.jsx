import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Code, Database, Zap, Repeat, ShieldAlert, Cpu } from 'lucide-react';

export default function APIReference() {
    return (
        <ProductLandingLayout
            badgeText="The Developer Protocol"
            titleHighlight="API Reference"
            titleSuffix="for Engineers."
            description="Build the ultimate autonomous revenue engine. Use the Outrelix GraphQL and REST APIs to programmatically manage campaigns, extract real-time lead data, and sync seamlessly with your internal architecture."
            primaryCtaText="Generate API Key"
            secondaryCtaText="View GitHub SDKs"
            stats={[
                { value: "99.99%", label: "Uptime SLA" },
                { value: "<50ms", label: "Average Latency" },
                { value: "REST", label: "and GraphQL" },
                { value: "Node/Py", label: "Official SDKs" }
            ]}
            painPoints={{
                title: "Built by Engineers, for Engineers",
                items: [
                    {
                        problem: "Fragmented Data Silos",
                        problemDesc: "Your CRM, your marketing platform, and your data provider don't talk to each other, resulting in duplicate data and broken workflows.",
                        solution: "Bi-Directional Sync",
                        solutionDesc: "Use our Webhooks and REST API to push and pull prospect data, campaign events, and replies in real-time between Outrelix and your custom backend."
                    },
                    {
                        problem: "Rate Limiting Bottlenecks",
                        problemDesc: "Third-party APIs throttle your requests, forcing you to build complex queueing systems and delaying critical sales data.",
                        solution: "Enterprise Scalability",
                        solutionDesc: "Outrelix offers robust, enterprise-grade rate limits allowing you to enrich thousands of leads per minute without connection drops."
                    },
                    {
                        problem: "Poor Documentation",
                        problemDesc: "You waste hours guessing payload structures and endpoint URLs because the API documentation is outdated or incomplete.",
                        solution: "Interactive API Explorer",
                        solutionDesc: "Our documentation features live code snippets, postman collections, and a Sandbox environment to test your requests before writing a single line of code."
                    }
                ]
            }}
            features={[
                { icon: Code, title: "Campaign Management", description: "POST, GET, and PATCH to programmatically create new sequences, pause campaigns, or update scheduling rules." },
                { icon: Database, title: "Lead Extraction Engine", description: "Query our AI extraction engine directly. Input a LinkedIn URL and receive a highly enriched JSON object featuring 40+ data points." },
                { icon: Zap, title: "Real-Time Webhooks", description: "Subscribe to specific events (Email Opened, Link Clicked, Reply Received) and push the data directly into your Slack or CRM." },
                { icon: Cpu, title: "AI Generation Endpoints", description: "Bypass the dashboard UI and use our proprietary LLM endpoints to generate personalized email copy programmatically." },
                { icon: ShieldAlert, title: "OAuth 2.0 & JWT", description: "Secure your integrations using industry-standard OAuth 2.0 flows and scoped personal access tokens for granular permission control." },
                { icon: Repeat, title: "Pagination & Filtering", description: "Efficiently query massive datasets of millions of prospects using cursor-based pagination and advanced GraphQL filtering arguments." }
            ]}
        />
    );
}
