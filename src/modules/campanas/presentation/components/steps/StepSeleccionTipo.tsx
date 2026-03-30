import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Radio, Smartphone, Activity, Layers, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CommercialPackageService } from '../../services/CommercialPackageService';
import { toast } from 'sonner';

import { StepProps } from '../types';

export const StepSeleccionTipo: React.FC<StepProps> = ({ data, updateData }) => {
    const value = data.tipo;
    const onChange = (val: 'FM' | 'DIGITAL' | 'HYBRID') => updateData({ tipo: val });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Selecciona el Universo de la Campaña
                </h2>
                <p className="text-muted-foreground">
                    Define el alcance operativo para habilitar los módulos correspondientes.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* OPCIÓN 1: RADIO FM */}
                <Card 
                    className={cn(
                        "cursor-pointer transition-all hover:scale-105 hover:border-blue-500",
                        value === 'FM' ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/50" : "border-border/50"
                    )}
                    onClick={() => onChange('FM')}
                >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className={cn("p-4 rounded-full bg-slate-100 text-slate-600", value === 'FM' && "bg-blue-600 text-white")}>
                            <Radio className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Broadcast FM</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Campaña tradicional de radiodifusión. Gestión de pauta, spots de audio y emisoras terrestres.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* OPCIÓN 2: DIGITAL QUANTUM */}
                <Card 
                    className={cn(
                        "cursor-pointer transition-all hover:scale-105 hover:border-violet-500",
                        value === 'DIGITAL' ? "border-violet-600 ring-2 ring-violet-100 bg-violet-50/50" : "border-border/50"
                    )}
                    onClick={() => onChange('DIGITAL')}
                >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className={cn("p-4 rounded-full bg-slate-100 text-slate-600", value === 'DIGITAL' && "bg-violet-600 text-white")}>
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Digital Quantum</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Activos digitales, segmentación neuromórfica y deep device intelligence.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* OPCIÓN 3: HÍBRIDA 360 */}
                <Card 
                    className={cn(
                        "cursor-pointer transition-all hover:scale-105 hover:border-indigo-500",
                        value === 'HYBRID' ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/50" : "border-border/50"
                    )}
                    onClick={() => onChange('HYBRID')}
                >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className={cn("p-4 rounded-full bg-slate-100 text-slate-600", value === 'HYBRID' && "bg-indigo-600 text-white")}>
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Híbrida 360°</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Sincronización total. Spots FM activan disparadores digitales. Máximo impacto.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {value === 'DIGITAL' || value === 'HYBRID' ? (
                <div className="mt-8 p-4 bg-violet-50 border border-violet-100 rounded-lg flex items-start gap-3 animate-in fade-in">
                    <Activity className="w-5 h-5 text-violet-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-violet-900">Módulo Neural Activado</h4>
                        <p className="text-sm text-violet-700">
                            Se habilitarán los paneles de "Deep Device Intelligence" y "Predicción de Rendimiento IA".
                        </p>
                    </div>
                </div>
            ) : null}
            {/* Smart Commercial Packages - "Neural Workflow" */}
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-xs">AI</span>
                        Paquetes Inteligentes (Smart Products)
                    </h3>
                    <Badge variant="outline" className="text-xs">Optimización Neural Activa</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CommercialPackageService.getPackages().map((pkg) => (
                        <div
                            key={pkg.id}
                            className="cursor-pointer h-auto p-4 flex flex-col items-start gap-2 border rounded-md hover:border-violet-400 hover:bg-violet-50 transition-all text-left group"
                            onClick={() => {
                                const optimizedData = CommercialPackageService.applyPackage(pkg.id, data);
                                updateData(optimizedData);
                                toast.promise(new Promise(resolve => setTimeout(resolve, 800)), {
                                    loading: 'Optimizando Grilla y Estructura...',
                                    success: `Paquete "${pkg.name}" aplicado con éxito`,
                                    error: 'Error al aplicar paquete'
                                });
                            }}
                        >
                            <div className="flex items-center gap-2 w-full">
                                <Badge className="bg-slate-900 text-white">{pkg.specs.tipo}</Badge>
                                <span className="text-xs font-mono text-slate-400 ml-auto flex items-center gap-1 group-hover:text-violet-600">
                                    <Zap className="w-3 h-3" /> Auto-Fill
                                </span>
                            </div>
                            <span className="font-bold text-slate-800 mt-1">{pkg.name}</span>
                            <span className="text-xs text-slate-500 font-normal leading-snug">
                                {pkg.description}
                            </span>
                        </div>
                    ))}
                    
                    {/* Botón de Importar Manual (Legacy Support) */}
                     <div 
                         onClick={() => onChange('FM')}
                        className="cursor-pointer p-4 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-300 rounded hover:border-slate-400 hover:bg-slate-50 transition-colors text-center h-full min-h-[140px]"
                    >
                        <span className="block text-xs font-medium text-slate-600">Importar Plantilla...</span>
                        <span className="text-[10px] text-slate-400">(Modo Manual)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
