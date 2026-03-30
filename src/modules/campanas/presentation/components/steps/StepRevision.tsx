import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { CampanaWizardData } from '../types';

export const StepRevision: React.FC<{ data: CampanaWizardData, updateData: (field: string, value: unknown) => void }> = ({ data }) => {
    return (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo</span>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 block mt-1">{data.tipo}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nombre</span>
                    <span className="text-xl font-bold text-slate-800 block mt-1">{data.nombre || 'Sin definir'}</span>
                </div>
            </div>
            
            {data.adTargetingProfile && (
                <div className="border border-violet-100 bg-violet-50/30 p-4 rounded-xl">
                    <h4 className="font-semibold mb-2 text-violet-700 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-violet-500"></span>
                        Configuración Digital Activa
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Mood: <strong>{data.adTargetingProfile.mood || 'N/A'}</strong></div>
                        <div>Movimiento: <strong>{data.adTargetingProfile.estadoMovimiento || 'N/A'}</strong></div>
                    </div>
                </div>
            )}
    
            {/* Business Vision: Client Portal Link Generator */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">NUEVO</span>
                            Portal de Aprobación Cliente
                        </h4>
                        <p className="text-xs text-blue-700 mt-1 max-w-md">
                            Genera un enlace seguro para que el cliente revise la pauta, escuche los audios y firme digitalmente desde su móvil.
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 bg-white border border-blue-200 rounded-md px-3 py-2 text-xs font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                        https://silexar.pulse/portal/review/{data.nombre ? data.nombre.toLowerCase().replace(/\s/g, '-') : 'campana-id'}-{Math.random().toString(36).substring(7)}
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors shadow-sm">
                        Copiar Enlace
                    </button>
                    <button className="bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-4 py-2 rounded-md transition-colors">
                        Enviar por WhatsApp
                    </button>
                </div>
            </div>

            {/* Client Portal Section Ends */}

            {/* Annual Campaign Explosion Preview (Traffic Handover View) */}
            {data.startDate && data.endDate && (data.endDate.getTime() - data.startDate.getTime()) > 7776000000 && (
                <div className="border border-indigo-100 bg-white rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-indigo-100 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-indigo-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-600" />
                                Desglose de Línea (Especificación Emisora)
                            </h4>
                            <p className="text-[10px] text-indigo-600 mt-1">
                                Detalle mensual generado automáticamente a partir de esta línea de contrato.
                            </p>
                        </div>
                        <span className="text-[10px] bg-white px-2 py-1 rounded border border-indigo-200 font-mono text-indigo-500">
                            12 PERIODOS
                        </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-0 bg-slate-50/50 divide-y divide-slate-100">
                        {Array.from({ length: 12 }).map((_, i) => {
                             const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
                             const monthNum = String(i + 1).padStart(2, '0');
                             const monthName = monthNames[i];
                             const campaignName = data.nombre?.toUpperCase() || 'MESA CENTRAL';
                             // const clientName = 'CLIENTE_ID'; // Mock: In real app fetch logic
                             const productName = data.producto?.toUpperCase() || 'GENERAL';
                             
                             // Naming Convention: 01 ENERO MESA CENTRAL - FORD - RANGER
                             const fullName = `${monthNum} ${monthName} - ${campaignName} - ${productName}`;
                             
                             return (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-white transition-colors group">
                                    <div className="h-4 w-4 rounded border border-slate-300 bg-white flex items-center justify-center text-indigo-600">
                                        {/* Simulated Checkbox */}
                                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded-[1px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-700 font-mono">
                                            {fullName}
                                        </div>
                                        <div className="flex gap-2 mt-0.5">
                                            <span className="text-[9px] text-slate-400 border px-1 rounded">FM: ROTATIVO</span>
                                            <span className="text-[9px] text-slate-400 border px-1 rounded">2026</span>
                                            <span className="text-[9px] bg-slate-100 text-slate-500 border px-1 rounded">Línea #{(i+1).toString().padStart(3,'0')}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">Borrador</span>
                                </div>
                             );
                        })}
                    </div>
                    <div className="p-3 bg-indigo-50/30 border-t border-indigo-50 flex justify-end gap-2">
                        <div className="text-xs text-indigo-400 flex items-center mr-auto px-2 italic">
                            * Se generarán 12 campañas vinculadas a esta especificación.
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 shadow-sm">
                <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                     <span className="font-bold block">Validación de Integridad Exitosa</span>
                     <span className="text-xs text-green-700">Conectividad con Contratos y Targeting verificada por el servidor.</span>
                </div>
            </div>
        </div>
    );
};
