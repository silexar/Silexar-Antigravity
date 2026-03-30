'use client';
import React from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
interface EnterpriseLayoutProps { children: React.ReactNode; }
export const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({ children }) => (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
);
export default EnterpriseLayout;