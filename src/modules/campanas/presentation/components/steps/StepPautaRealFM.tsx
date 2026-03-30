import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepProps } from '../types';
import { Radio, Calendar, Clock, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data for the grid
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const BLOCKS = [
    { time: '07:00 - 08:00', load: 85, program: 'Mañana Informativa' },
    { time: '08:00 - 09:00', load: 95, program: 'El Matinal' }, // High saturation
    { time: '09:00 - 10:00', load: 60, program: 'Música & Noticias' },
    { time: '10:00 - 11:00', load: 40, program: 'Hits 2026' },
];

export const StepPautaRealFM: React.FC<StepProps> = ({ data, updateData }) => {
    
    // Simple state to track selected blocks
    // In a real app this would be more complex
    // Initialize with preselected blocks from "Smart Package" (Neural Handover)
    // If Sales selected "Mesa Central", Traffic sees this PRE-FILLED. Zero clicks.
    const [selectedBlocks, setSelectedBlocks] = useState<string[]>(data.preselectedBlocksIds || []);

    const toggleBlock = (day: string, time: string) => {
        const id = `${day}-${time}`;
        
        // Traffic Guard Logic
        if (data.competitorExclusion && data.competitorExclusion.length > 0) {
            // Mock: "Chevrolet" is booked on Monday 08:00-09:00
            const isMondayMorning = id === 'Lunes-08:00 - 09:00';
            const avoidsChevrolet = data.competitorExclusion.some(c => c.toLowerCase().includes('chevrolet'));
            
            if (isMondayMorning && avoidsChevrolet) {
                toast.error('🚫 BLOQUEADO POR TRAFFIC GUARD', {
                    description: 'Conflicto de Competencia detectado: "Chevrolet" ya está pautado en este bloque. Acción rebotada.'
                });
                return; // Hard Block
            }
        }

        if (selectedBlocks.includes(id)) {
            setSelectedBlocks(selectedBlocks.filter(b => b !== id));
        } else {
            setSelectedBlocks([...selectedBlocks, id]);
        }
    };
    
    // Algorithmic Distribution (The "Auto-Pilot")
    const autoDistribute = () => {
        // Simple heuristic: Fill low load blocks first
        const newBlocks = [...selectedBlocks];
        let conflictsAvoided = 0;

        DAYS.forEach(day => {
            BLOCKS.filter(b => b.load < 80).forEach(block => {
                const id = `${day}-${block.time}`;
                
                 // Traffic Guard Check for Auto-Distribute
                let isConflict = false;
                if (data.competitorExclusion && data.competitorExclusion.length > 0) {
                    const isMondayMorning = id === 'Lunes-08:00 - 09:00';
                    const avoidsChevrolet = data.competitorExclusion.some(c => c.toLowerCase().includes('chevrolet'));
                    if (isMondayMorning && avoidsChevrolet) {
                        isConflict = true;
                        conflictsAvoided++;
                    }
                }

                if (!newBlocks.includes(id) && !isConflict) newBlocks.push(id);
            });
        });
        setSelectedBlocks(newBlocks);
        
        if (conflictsAvoided > 0) {
             toast.success(`Distribución Inteligente: ${conflictsAvoided} conflictos evitados automáticamente por Traffic Guard 🛡️`);
        } else {
             toast.success('Distribución Neural Inteligente completada (Algoritmo de Baja Saturación)');
        }
    };

    // Predictive Renewal Logic (Business Vision Point 4)
    // Simulates detecting a previous line ending recently
    const [renewalOpportunity, setRenewalOpportunity] = useState<{detected: boolean, lastDate: string} | null>(null);

    useEffect(() => {
        // Mock: Simular que el sistema detecta una pauta histórica que termina "Ayer"
        // En producción, esto vendría de `CampanaService.getHistoricalLines(clienteId)`
        const timer = setTimeout(() => {
            setRenewalOpportunity({
                detected: true,
                lastDate: '30/01/2026' // Fecha simulada de fin de contrato anterior
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const applyRenewal = () => {
        // Clona la pauta del mes anterior (Mock: selecciona bloques aleatorios "históricos")
        const historicalBlocks = [
            'Lunes-07:00 - 08:00', 'Lunes-18:00 - 19:00',
            'Miércoles-07:00 - 08:00', 'Miércoles-18:00 - 19:00',
            'Viernes-07:00 - 08:00', 'Viernes-18:00 - 19:00'
        ];
        setSelectedBlocks(historicalBlocks);
        setRenewalOpportunity(null); // Ocultar alerta tras aplicar
        toast.success(`Renovación Predictiva Aplicada: Se han clonado las líneas para el nuevo periodo.`);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Predictive Renewal Alert */}
            {renewalOpportunity && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-lg flex items-start gap-4 shadow-sm animate-in slide-in-from-top-2">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-emerald-900">Oportunidad de Renovación Detectada</h4>
                        <p className="text-xs text-emerald-700 mt-1">
                            La campaña anterior finalizó el <strong>{renewalOpportunity.lastDate}</strong>. 
                            El sistema predice continuidad para el próximo mes basada en el comportamiento histórico del cliente.
                        </p>
                        <div className="mt-3 flex gap-3">
                            <Button 
                                size="sm" 
                                onClick={applyRenewal}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md h-8 text-xs font-semibold"
                            >
                                <Zap className="w-3 h-3 mr-1" /> Clonar & Renovar Pauta
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setRenewalOpportunity(null)}
                                className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100 h-8 text-xs"
                            >
                                Ignorar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Radio className="text-blue-600" />
                        Matriz de Pauta FM
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Selecciona los bloques horarios. El sistema optimizará la distribución automáticamente.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                     {/* Gap Closure: Micro-Positioning Selector */}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={autoDistribute}
                        className="text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 gap-2"
                        title="Rellenar espacios vacíos automáticamente"
                    >
                        <Zap className="w-4 h-4" /> Auto-Distribución
                    </Button>

                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-md border border-slate-200">
                        <span className="text-xs font-semibold text-slate-500 pl-2">Prioridad:</span>
                        <select 
                            className="bg-white text-sm border-none rounded shadow-sm py-1 focus:ring-0 cursor-pointer w-[160px] h-8"
                            value={data.positionStrategy || 'ROTATING'}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(e) => updateData({ positionStrategy: e.target.value as 'FIXED_START' | 'FIXED_END' | 'ROTATING' | 'JINGLE_LINKED' })}
                        >
                            <option value="ROTATING">♻️ Rotativo (Std)</option>
                            <option value="FIXED_START">⬆️ Primera Posición</option>
                            <option value="FIXED_END">⬇️ Cierre de Tanda</option>
                            <option value="JINGLE_LINKED">🎵 Pegado a Jingle</option>
                        </select>
                    </div>

                    <Badge variant="outline" className="gap-1 h-8">
                        <Calendar className="w-3 h-3" /> Semana Actual
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                {/* Sidebar - Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-slate-50">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium">Spots Disponibles</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-2">
                            <div className="p-2 bg-white rounded border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 text-xs">
                                <strong>Spot A (30s)</strong>
                                <div className="text-slate-500">Institucional</div>
                            </div>
                            <div className="p-2 bg-white rounded border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 text-xs">
                                <strong>Jingle (15s)</strong>
                                <div className="text-slate-500">Verano 2026</div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-800">
                        <AlertTriangle className="w-4 h-4 mb-1 inline mr-1" />
                        <strong>Alta Saturación</strong>
                        <p>Bloques de 08:00 AM están al 95% de ocupación.</p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="lg:col-span-5 border rounded-lg overflow-hidden bg-white shadow-sm">
                    <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-[100px_repeat(5,1fr)] min-w-[600px]">
                            {/* Header Row */}
                            <div className="p-3 bg-slate-100 font-bold text-xs text-center border-b border-r sticky top-0 z-10">
                                Hora / Día
                            </div>
                            {DAYS.map(day => (
                                <div key={day} className="p-3 bg-slate-100 font-bold text-xs text-center border-b border-r sticky top-0 z-10">
                                    {day}
                                </div>
                            ))}

                            {/* Rows */}
                            {BLOCKS.map(block => (
                                <React.Fragment key={block.time}>
                                    {/* Time Column */}
                                    <div className="p-3 border-b border-r text-xs font-medium bg-slate-50 flexflex-col justify-center">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {block.time}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1 truncate" title={block.program}>
                                            {block.program}
                                        </div>
                                    </div>

                                    {/* Day Cells */}
                                    {DAYS.map(day => {
                                        const isSelected = selectedBlocks.includes(`${day}-${block.time}`);
                                        const isSaturated = block.load > 90;
                                        
                                        return (
                                            <div 
                                                key={`${day}-${block.time}`}
                                                onClick={() => toggleBlock(day, block.time)}
                                                className={`
                                                    p-2 border-b border-r text-xs cursor-pointer transition-all h-16 relative group
                                                    ${isSelected 
                                                        ? 'bg-blue-100 border-blue-200' 
                                                        : 'hover:bg-slate-50'
                                                    }
                                                    ${isSaturated && !isSelected ? 'bg-stripes-red' : ''}
                                                `}
                                            >
                                                {/* Visual Load Indicator */}
                                                {!isSelected && (
                                                    <div className="absolute bottom-1 right-1 text-[9px] text-slate-300">
                                                        {block.load}%
                                                    </div>
                                                )}
                                                
                                                {/* Valid Selection */}
                                                {isSelected && (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <Radio className="w-4 h-4 text-blue-600 animate-in zoom-in duration-200" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
             <style jsx>{`
                .bg-stripes-red {
                    background-image: linear-gradient(45deg, #fef2f2 25%, #fff1f2 25%, #fff1f2 50%, #fef2f2 50%, #fef2f2 75%, #fff1f2 75%, #fff1f2 100%);
                    background-size: 10px 10px;
                }
            `}</style>
        </div>
    );
};
