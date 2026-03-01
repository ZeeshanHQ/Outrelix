import React from 'react';
import ProductLandingLayout from '../../components/layouts/ProductLandingLayout';
import { Rocket, Target, Users, Zap, TrendingUp, BarChart } from 'lucide-react';

export default function SalesTeams() {
    return (
        <ProductLandingLayout
            badgeText="For Revenue Leaders"
            titleHighlight="Sales Teams"
            titleSuffix="Automated."
            description="Replace your entire top-of-funnel SDR workflow. Outrelix gives your Account Executives a steady stream of highly qualified, intent-driven meetings without lifting a finger."
            primaryCtaText="Automate Your Pipeline"
            secondaryCtaText="Book a Demo"
            stats={[
                { value: "4.2x", label: "Meetings Booked" },
                { value: "30h+", label: "Saved per Rep/Week" },
                { value: "100%", label: "Data Accuracy" },
                { value: "0", label: "Cold Calls Needed" }
            ]}
            painPoints={{
                title: "Why Traditional SDR Models Fail",
                items: [
                    {
                        problem: "High Burnout Rates",
                        problemDesc: "Reps spend 70% of their day manually finding emails, entering data into Salesforce, and writing zero-reply follow-ups.",
                        solution: "AI SDR Virtualization",
                        solutionDesc: "Outrelix handles the entire prospecting cycle. Your human reps only step in when a prospect is ready to get on a call."
                    },
                    {
                        problem: "Disconnected Tools",
                        problemDesc: "You pay for a data provider, an email sequencer, an email warmup tool, and a CRM. Data gets lost. Costs pile up.",
                        solution: "Unified Sales OS",
                        solutionDesc: "One platform. Extract the data, clean it, write the hyper-personalized sequence, and book the meeting. All natively integrated."
                    },
                    {
                        problem: "Lack of Scalability",
                        problemDesc: "To double your meetings, you have to double your SDR headcount, doubling your payroll risk.",
                        solution: "Infinite Horizontal Scaling",
                        solutionDesc: "Add thousands of prospects to new AI campaigns instantly. Scale your outbound engine infinitely without adding a single employee."
                    }
                ]
            }}
            features={[
                { icon: Rocket, title: "Instant Lead Generation", description: "Define your ICP once and watch Outrelix auto-populate your pipeline with verified decision makers every morning." },
                { icon: Target, title: "Intent-Based Triggering", description: "Reach out exactly when they are ready. The AI monitors funding rounds, hiring sprees, and tech stack drops." },
                { icon: Zap, title: "AI-Generated Copy", description: "Hyper-personalized opening lines written by the AI based on the prospect's recent LinkedIn activity and company news." },
                { icon: Users, title: "Multi-Channel Sequences", description: "Coordinate touches across Email, LinkedIn, and Twitter automatically to ensure maximum visibility." },
                { icon: TrendingUp, title: "Predictive Lead Scoring", description: "The engine scores every reply and interaction, surfacing only the hottest leads to your Account Executives." },
                { icon: BarChart, title: "Performance Analytics", description: "See exactly which value props, subject lines, and send times are generating the highest revenue conversions." }
            ]}
        />
    );
}
