import React from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StepProps } from '../types';
import { CompetitiveRadar } from '../CompetitiveRadar';
import { FileText, Tag, Hash, CalendarDays, ShieldAlert, Sparkles } from 'lucide-react';

export const StepDatosGenerales: React.FC<StepProps> = ({ data, updateData }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="p-3 bg-white rounded-full shadow-sm">
                    <FileText className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Identidad de la Campaña</h2>
                    <p className="text-sm text-slate-500">Define los metadatos esenciales para el rastreo y facturación.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" /> Nombre Clave
                        </Label>
                        <Input 
                            value={data.nombre} 
                            onChange={(e) => updateData({ nombre: e.target.value })} 
                            placeholder="Ej: Verano 2026 - Lanzamiento" 
                            className="text-lg font-medium h-12"
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground ml-1">Este nombre se usará en reportes y facturas.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-slate-400" /> Código de Referencia
                        </Label>
                        <Input 
                            value="CAM-2026-####" 
                            disabled 
                            className="bg-slate-50 font-mono text-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                             <Tag className="w-4 h-4 text-slate-400" /> Producto / Marca
                        </Label>
                        <Input 
                            value={data.producto || ''} 
                            onChange={(e) => updateData({ producto: e.target.value })} 
                            placeholder="Ej: Ranger, Cuenta Fan, Fanta Zero" 
                            className="bg-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Descripción Operativa</Label>
                    <textarea 
                        className="flex min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.descripcion} 
                        onChange={(e) => updateData({ descripcion: e.target.value })} 
                        placeholder="Instrucciones especiales para el equipo de tráfico o consideraciones de programación..." 
                    />
                </div>
                <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-violet-500" /> Vigencia del Contrato
                    </Label>
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <span className="text-xs text-slate-500">Inicio</span>
                            <Input 
                                type="date" 
                                className="bg-white"
                                onChange={(e) => updateData({ startDate: new Date(e.target.value) })}
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <span className="text-xs text-slate-500">Término</span>
                            <Input 
                                type="date" 
                                className="bg-white"
                                onChange={(e) => updateData({ endDate: new Date(e.target.value) })}
                            />
                        </div>
                    </div>
                    {/* Annual Detection */}
                    {data.startDate && data.endDate && (data.endDate.getTime() - data.startDate.getTime()) > 7776000000 && (
                        <div className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 p-2 rounded-md border border-indigo-100">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span><strong>Contrato Anual Detectado</strong>: Se generarán 12 campañas mensuales automáticas.</span>
                        </div>
                    )}

                    <div className="space-y-2 mt-4">
                        <Label className="flex items-center gap-2 text-red-600">
                            <ShieldAlert className="w-4 h-4" /> Blindaje de Competencia (Traffic Guard)
                        </Label>
                        <Input 
                            placeholder="Ej: Chevrolet, BCI (Separar por comas)" 
                            className="border-red-100 focus-visible:ring-red-200"
                            onChange={(e) => updateData({ competitorExclusion: e.target.value.split(',').map(s => s.trim()) })}
                        />
                        <p className="text-[10px] text-red-400">
                            El sistema evitará automáticamente pautar en bloques donde existan estas marcas.
                        </p>
                    </div>
                </div>

            </div>
            {/* Business Vision: Competitive Radar */}
            {data.anuncianteId && (
                <div className="mt-6 animate-in slide-in-from-right-8 duration-700">
                    <CompetitiveRadar category="Automotriz" />
                </div>
            )}
        </div>
    );
};
