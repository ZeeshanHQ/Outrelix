'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Landing from '../pages/Landing';

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main className="container mx-auto px-4 py-8 pt-20">
                <Landing />
            </main>
            <Footer />
        </>
    );
}
