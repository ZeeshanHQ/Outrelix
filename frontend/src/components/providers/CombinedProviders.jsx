'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { SidebarProvider } from '../../contexts/SidebarContext';
import { GmailStatusProvider } from '../../utils/GmailStatusContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CombinedProviders({ children }) {
    return (
        <SessionProvider>
            <I18nextProvider i18n={i18n}>
                <GmailStatusProvider>
                    <SidebarProvider>
                        {children}
                        <ToastContainer />
                    </SidebarProvider>
                </GmailStatusProvider>
            </I18nextProvider>
        </SessionProvider>
    );
}
