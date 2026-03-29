/**
 * SILEXAR PULSE - TIER0+ UNIFIED NAVIGATION
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem { href: string; label: string; }

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/campanas', label: 'Campañas' },
    { href: '/contratos', label: 'Contratos' },
];

export const UnifiedNavigation: React.FC<{ className?: string }> = ({ className = '' }) => (
    <nav className={`flex items-center justify-between p-4 border-b ${className}`}>
        <Link href="/" className="font-bold text-xl">Silexar Pulse</Link>
        <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-gray-600 hover:text-gray-900">
                    {item.label}
                </Link>
            ))}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
        </Button>
    </nav>
);

export default UnifiedNavigation;