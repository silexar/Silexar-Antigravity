'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
interface CampaignStat { name: string; status: string; roi: number; }
const campaigns: CampaignStat[] = [{ name: 'Campaña Q4', status: 'ACTIVE', roi: 125 }];
export const CampaignsSummary: React.FC<{ className?: string }> = ({ className = '' }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Resumen de Campañas</CardTitle></CardHeader>
        <CardContent>{campaigns.map((c, i) => <div key={`${c}-${i}`} className="p-2 border-b last:border-0"><span className="font-medium">{c.name}</span> - {c.status} ({c.roi}% ROI)</div>)}</CardContent>
    </Card>
);
export default CampaignsSummary;