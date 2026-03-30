'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
export const MultiRegionDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Multi-Region</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">Cache distribuido en múltiples regiones</p></CardContent>
    </Card>
);
export default MultiRegionDashboard;