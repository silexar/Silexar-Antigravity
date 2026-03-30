'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';
export const DashboardMovilTier0: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5" />Dashboard Móvil</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Vista optimizada para móvil</p></CardContent>
    </Card>
);
export default DashboardMovilTier0;
