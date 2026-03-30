/**
 * SILEXAR PULSE - TIER0+ DASHBOARD HEADER
 * Componente de Header para Dashboard
 */

'use client';

import React from 'react';
import { Bell, Search, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
    readonly title?: string;
    readonly userName?: string;
    readonly notificationCount?: number;
    readonly onSearch?: (query: string) => void;
    readonly className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    title = 'Dashboard',
    userName = 'Usuario',
    notificationCount = 0,
    onSearch,
    className = '',
}) => {
    return (
        <header className={`flex items-center justify-between px-6 py-4 bg-white border-b ${className}`}>
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar..."
                        className="pl-10 w-64"
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>
                
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {notificationCount}
                        </span>
                    )}
                </Button>
                
                <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-2 pl-4 border-l">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">{userName}</span>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;