/**
 * SILEXAR PULSE - TIER0+ NAVBAR
 * Componente de Navegación Principal
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Home, FileText, Megaphone, BarChart3, Settings } from 'lucide-react';

interface NavItem {
    readonly href: string;
    readonly label: string;
    readonly icon: React.ReactNode;
}

interface NavbarProps {
    readonly className?: string;
    readonly currentPath?: string;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { href: '/campanas', label: 'Campañas', icon: <Megaphone className="w-5 h-5" /> },
    { href: '/contratos', label: 'Contratos', icon: <FileText className="w-5 h-5" /> },
    { href: '/reportes', label: 'Reportes', icon: <BarChart3 className="w-5 h-5" /> },
    { href: '/configuracion', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
];

export const Navbar: React.FC<NavbarProps> = ({ className = '', currentPath = '/' }) => {
    return (
        <nav className={`flex items-center space-x-4 ${className}`}>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        currentPath === item.href
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                </Link>
            ))}
        </nav>
    );
};

export default Navbar;