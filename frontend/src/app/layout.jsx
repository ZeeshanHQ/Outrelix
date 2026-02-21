import React from 'react';
import CombinedProviders from '../components/providers/CombinedProviders';
import '../index.css';

export const metadata = {
    title: 'Outrelix - Elite AI-Powered Outreach',
    description: 'Scale your outreach with AI-powered intelligence and automation.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Pacifico&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body>
                <CombinedProviders>
                    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
                        {children}
                    </div>
                </CombinedProviders>
            </body>
        </html>
    );
}
