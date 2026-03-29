
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Crosshair } from 'lucide-react';

interface CompetitorData {
    name: string;
    sov: number; // Share of Voice %
    trend: 'UP' | 'DOWN' | 'STABLE';
    color: string;
}

export const CompetitiveRadar: React.FC<{ category?: string }> = ({ category = 'Automotriz' }) => {
    const [loading, setLoading] = useState(true);
    
    // Mock Data based on "Category"
    const competitors: CompetitorData[] = [
        { name: 'Chevrolet', sov: 42, trend: 'UP', color: 'bg-yellow-500' },
        { name: 'Toyota', sov: 28, trend: 'STABLE', color: 'bg-red-500' },
        { name: 'Nissan', sov: 15, trend: 'DOWN', color: 'bg-slate-400' },
        { name: 'Tu Cliente (Ford)', sov: 10, trend: 'STABLE', color: 'bg-blue-600' },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500); // Simulate AI Analysis
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse p-4 border rounded-lg border-slate-100 bg-slate-50">
                <Crosshair className="w-4 h-4 text-violet-400 spin-slow" />
                Analizando espectro de competencia en tiempo real...
            </div>
        );
    }

    const leader = competitors.reduce((prev, current) => (prev.sov > current.sov) ? prev : current);
    const client = competitors.find(c => c.name.includes('Cliente')) || competitors[3];
    const gap = leader.sov - client.sov;

    return (
        <Card className="border-l-4 border-l-violet-500 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2 bg-violet-50/30">
                <CardTitle className="text-sm font-bold flex items-center justify-between text-violet-900">
                    <div className="flex items-center gap-2">
                        <Crosshair className="w-4 h-4 text-violet-600" />
                        Radar de Competencia: {category}
                    </div>
                    <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-[10px]">LIVE DATA</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Insights Upsell */}
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-md flex gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-bold text-amber-800 uppercase">Oportunidad de Dominio</h4>
                        <p className="text-xs text-amber-700 mt-1 leading-snug">
                            {leader.name} domina con {leader.sov}% SOV. Tu cliente está a <span className="font-bold">-{gap}%</span>.
                            <br/>
                            <span className="font-bold underline cursor-pointer hover:text-amber-900">Sugerencia: Aumentar +2 Frases en Prime para igualar presencia.</span>
                        </p>
                    </div>
                </div>

                {/* Share of Voice Bars */}
                <div className="space-y-3">
                    {competitors.map((comp) => (
                        <div key={comp.name} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-700">{comp.name}</span>
                                <span className="text-slate-500 font-mono">{comp.sov}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${comp.color} transition-all duration-1000 ease-out`} 
                                    style={{ width: `${comp.sov}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
