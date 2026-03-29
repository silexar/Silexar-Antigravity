
import React from 'react';
import { Card } from '@/components/ui/card';
import { Activity, DollarSign, Users } from 'lucide-react';
import { CampanaWizardData } from './types';
import { cn } from '@/lib/utils';

interface CampanaLiveDeckProps {
    data: CampanaWizardData;
    className?: string;
}

export const CampanaLiveDeck: React.FC<CampanaLiveDeckProps> = ({ data, className }) => {
    // Calculos simulados en base a datos reales
    const budget = data.presupuestoEstimado || 
        (data.tipo === 'FM' ? 1500 : data.tipo === 'DIGITAL' ? 2500 : data.tipo === 'HYBRID' ? 3800 : 0);
    
    const reach = data.alcanceEstimado || 
        (data.tipo === 'FM' ? 45000 : data.tipo === 'DIGITAL' ? 120000 : data.tipo === 'HYBRID' ? 185000 : 0);

    return (
        <Card className={cn("bg-slate-900 text-white border-slate-800 shadow-2xl overflow-hidden", className)}>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Flight Deck</h3>
                        {data.nombre ? (
                            <p className="font-semibold text-sm truncate max-w-[150px]">{data.nombre}</p>
                        ) : (
                            <p className="text-sm italic text-slate-600">Nueva Campaña</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-6 text-right">
                    <div className="space-y-0.5">
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Inversión Est.</span>
                        <div className="flex items-center justify-end gap-1 text-emerald-400">
                            <DollarSign className="w-3 h-3" />
                            <span className="text-xl font-mono font-bold tracking-tight">
                                {budget.toLocaleString('es-CL')}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-0.5 border-l border-slate-700 pl-6">
                         <span className="text-[10px] uppercase text-slate-500 font-bold block">Alcance Proyectado</span>
                        <div className="flex items-center justify-end gap-1 text-blue-400">
                            <Users className="w-3 h-3" />
                            <span className="text-xl font-mono font-bold tracking-tight">
                                {(reach / 1000).toFixed(1)}k
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Micro-barras de progreso decorativas */}
            <div className="flex h-1 w-full bg-slate-800">
                <div className="w-[35%] bg-indigo-500/50" />
                <div className="w-[20%] bg-emerald-500/50" />
                <div className="w-[15%] bg-blue-500/50" />
            </div>
        </Card>
    );
};
